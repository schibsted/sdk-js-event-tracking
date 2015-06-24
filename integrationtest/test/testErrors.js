/* global server */
'use strict';

module.exports = {
    'When CIS returns 4xx and 5xx': function (browser) {
        // var chai = require('chai');
        browser
        .deleteCookies()
        .getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
        .url('http://127.0.0.1:8080/integrationtest/dev/errortests/index404.html')
        .waitForElementVisible('body', 1000)
		.pause(2000)
        .execute(function() {
            return server.requests;
        }, [''], function(res) {
			this.assert.equal(res.value.length, 3);
			res.value.map(function(obj) {
				this.assert.equal(obj.url, 'https://cis.schibsted.com/api/v1/identify');
			}.bind(this));
        })
		.getCookies(function callback(result) {
            console.log(result.value);
            this.assert.equal(result.value.length, 0);
        })
        .deleteCookies()
        .getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
        .url('http://127.0.0.1:8080/integrationtest/dev/errortests/index500.html')
        .waitForElementVisible('body', 1000)
		.pause(2000)
        .execute(function() {
            return server.requests;
        }, [''], function(res) {
			this.assert.equal(res.value.length, 3);
			res.value.map(function(obj) {
				this.assert.equal(obj.url, 'https://cis.schibsted.com/api/v1/identify');
			}.bind(this));
        })
		.getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
        .execute(function() {
            server.restore();
        }, [''])
        .end();
    }
};
