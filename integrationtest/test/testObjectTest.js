/* global server */
'use strict';

module.exports = {
    'CIS request only on new sessions': function (browser) {
        var chai = require('chai');
        browser
        .deleteCookies()
        .getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
        .url('http://127.0.0.1:8080/integrationtest/dev/indexObjectTest.html')
        .waitForElementVisible('body', 1000)
        .execute(function() {
            return server.requests;
        }, [''], function(res) {
			this.assert.equal(res.value.length, 2);
			this.assert.equal(res.value[0].requestBody, '{}');
			this.assert.equal(res.value[0].withCredentials, true);
			this.assert.equal(res.value[0].url, 'https://cis.schibsted.com/api/v1/identify');

			var requestBody = JSON.parse(res.value[1].requestBody);

			this.assert.equal(requestBody[0]['@type'], 'Read');
			this.assert.notEqual(requestBody[0]['@context'], undefined);
			this.assert.notEqual(requestBody[0].provider, undefined);
			this.assert.notEqual(requestBody[0].actor, undefined);
			this.assert.notEqual(requestBody[0].object, undefined);
			chai.assert.include(res.value[1].url, '/api/v1/track', 'contains correct relpath');
			chai.assert.include(requestBody[0].object['@id'], 'urn:', 'pageId got urn');
			chai.assert.include(requestBody[0].object['@id'], '1234567', 'pageId passed');
        })
        .pause(1000)

		// Refreshing the page should not create new request to CIS

		.refresh()
		.waitForElementVisible('body', 1000)
		.setCookie({
			name: '_DataTrackerSession',
			value: '1234',
			path: '/integrationtest/dev/',
			expiry: (Date.now() / 1000) * 3600
		})
		.setCookie({
			name: '_DataTrackerUser',
			value: '1234',
			path: '/integrationtest/dev/',
			expiry: (Date.now() / 1000) * 3600
		})
		.execute(function() {
			return server.requests;
		}, [''], function(res) {

			// There should be a pageload request being sent.
			this.assert.equal(res.value.length, 1);
			var requestBody = JSON.parse(res.value[0].requestBody);
			this.assert.equal(requestBody[0]['@type'], 'Read');
		})

		// Refreshing the page without cookies should create request to CIS.

		.deleteCookie('_pulse2data')
		.refresh()
		.waitForElementVisible('body', 1000)

		// Check that environment and session cookies are deleted

		.getCookies(function callback(result) {
            this.assert.equal(result.value.length, 1);
			console.log(result.value[0]);
        })
		.execute(function() {
			return server.requests;
		}, [''], function(res) {
			this.assert.equal(res.value.length, 2);
			this.assert.equal(res.value[0].url, 'https://cis.schibsted.com/api/v1/identify');
			var requestBody = JSON.parse(res.value[1].requestBody);
			this.assert.equal(requestBody[0]['@type'], 'Read');
		})

		// TODO: Do new request with just sessionId deleted to confirm.
		// Wrap up

        .execute(function() {
            server.restore();
        }, [''])
        .end();
    }
};
