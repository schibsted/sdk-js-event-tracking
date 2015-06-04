/* global server */
'use strict';

module.exports = {
    'Meta data should go in object': function (browser) {
        var chai = require('chai');
        browser
        .deleteCookies()
        .getCookies(function callback(result) {
            this.assert.equal(result.value.length, 0);
        })
		.url('http://127.0.0.1:8080/integrationtest/dev/indexNoPageId.html')
        .waitForElementVisible('body', 1000)
		.pause(1000)
		.execute(function() {
            return server.requests;
        }, [''], function(res) {
			this.assert.equal(res.value.length, 2);

			var requestBody = JSON.parse(res.value[1].requestBody);

			chai.assert.include(requestBody[0].object['@id'], 'urn:', 'pageId got urn');
			chai.assert.include(requestBody[0].object['@id'], 'indexNoPageId.html', 'pageId passed');
			chai.assert.include(requestBody[0].provider['@id'], 'testClient02');
			chai.assert.notInclude(requestBody[0].provider['@id'], 'testClient01');

            // Test for meta and OG here:
            
            var metaData = requestBody[0].object['spt:meta'];
            var ogData = requestBody[0].object['spt:og'];
            console.log(requestBody[0].object);

            chai.assert.isDefined(metaData);
            chai.assert.isDefined(ogData);

            this.assert.equal(ogData['spt:og:type'], 'article');
            this.assert.equal(ogData['spt:og:url'], 'http://www.bt.no/article/bt-3374016.html');
            this.assert.equal(metaData['spt:msapplication-starturl'], 'http://www.bt.no/');
            this.assert.equal(metaData['spt:twitter:site'], 'btno');
        })
        .end();
    }
};
