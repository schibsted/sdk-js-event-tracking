'use strict';

module.exports = {
    'Pageload, normal': function (browser) {
        browser
		.deleteCookies()
        .getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
        .url('http://127.0.0.1:8080/integrationtest/dev/index.html')
        .waitForElementVisible('body', 1000)
        .pause(3000)
        .getCookies(function callback(result) {

			this.assert.equal(result.value.length, 1);
            this.assert.equal(result.value[0].name, '_pulse2data');
        })
        .end();
    }
};
