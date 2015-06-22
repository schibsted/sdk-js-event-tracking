/* global AutoTrack */
'use strict';

module.exports = {
    'Pageload, normal': function (browser) {
        var chai = require('chai');
        var uuidv4pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        browser
		.deleteCookies()
        .getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
        .url('http://127.0.0.1:8080/integrationtest/dev/index.html')
        .waitForElementVisible('body', 1000)
        .pause(3000)
        .getCookies(function callback(result) {

			this.assert.equal(result.value.length, 2);

			var count = 0;

			for (var j = 0; j < result.value.length; j++) {
				if (result.value[j].name === '_DataTrackerEnv') {
					chai.assert.isDefined(result.value[1].value, 'Environment ID was defined in cookie');
					count += 3;
				} else if (result.value[j].name === '_DataTrackerVisitor') {
					chai.assert.match(result.value[j].value, uuidv4pattern);
					count += 9;
				} else {
					this.assert.equal(false, 'This should never be fired');
				}
			}

			this.assert.equal((3 + 9), count);
        })
        .execute(function() {
            AutoTrack.loginEvent('urn:lol.no:user:234232342');
        }, [''])
        .pause(3000)
        .getCookies(function callback(resultNew) {

			for (var j = 0; j < resultNew.value.length; j++) {
				if (resultNew.value[j].name === '_DataTrackerUser') {
					this.assert.equal(resultNew.value[j].value, 'urn:lol.no:user:234232342');
				}
			}
        })
        .execute(function() {
            AutoTrack.logoutEvent();
        }, [''])
        .pause(3000)
        .getCookies(function callback(resultNew2) {

			for (var j = 0; j < resultNew2.value.length; j++) {
				if (resultNew2.value[j].name === '_DataTrackerUser') {
					this.assert.equal(resultNew2.value[j].value, 'undefined');
				}
			}

        })
        .end();
    }
};
