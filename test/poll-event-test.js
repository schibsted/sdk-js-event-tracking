"use strict";

buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = _opt || {};

// function trackPollEvent(pollId, question, options, answer, callback)

buster.testCase('A form event ', {
    'fails if pageId or clientId is missing': function(){
        _opt.clientId = undefined;
        var result = trackPollEvent('poll:12824212', 'Is this a question?');
        assert.equals(result, false);

        _opt.cliendId = null;
        result = trackPollEvent('poll:12824212', 'Is this i question?');
        assert.equals(result, false);

        _opt.clientId = '';
        result = trackPollEvent('poll:12824212', 'Is this i question?');
        assert.equals(result, false);

        _opt.clientId = 'sp-34534';

        _opt.pageId = undefined;
        result = trackPollEvent('poll:12824212', 'Is this i question?');
        assert.equals(result, false);

        _opt.pageId = null;
        result = trackPollEvent('poll:12824212', 'Is this i question?');
        assert.equals(result, false);

        _opt.pageId = '';
        result = trackPollEvent('poll:12824212', 'Is this i question?');
        assert.equals(result, false);

        _opt.pageId = 'urn:test.no:pagetest01';

        result = trackPollEvent(undefined, undefined, undefined, undefined, undefined);
        assert.equals(result, false);
        result = trackPollEvent('', 'Is this i question?', undefined, undefined, undefined);
        assert.equals(result, false);
        result = trackPollEvent(null, undefined, undefined, undefined, undefined);
        assert.equals(result, false);

    },
    'server response 200': function(done){

        trackPollEvent('poll:12824212', 'Is this i question?', ['yes', 'no'], ['yes'], done(function(response, data){
            assert.equals(response.status, 200);
        }));

        // Should fail if URL is not correct

        var oldTrackingUrl = _opt.trackingUrl;
        _opt.trackingUrl = 'http://128.0.0.1/api/v1/track';

        trackPollEvent('poll:12824212', 'Is this i question?', ['yes', 'no'], ['yes'], done(function(response, data){
            refute.equals(response.status, 200);
        }));

        _opt.trackingUrl = oldTrackingUrl;

    },
    /*'contains all needed info': function(done){
        trackPollEvent('poll:12824212', 'article', 'Bacon Ipsum', undefined, done(function(response, data){
            assert.equals(response.status, 200);
            for(var i = 0; i < data.length; i++){
                var d = JSON.parse(data[i]);

                // General value checks
                headerAsserts(d);
                providerAsserts(d);
                actorAsserts(d);
                objectAsserts(d);

                // Specific value checks
                // Header asserts
                assert.match(d['@type'], 'Respond');

                // Object asserts
                assert.match(d.object['@type'], 'article');
                assert.match(d.object['@id'], _opt.pageId);

                // Result asserts
                assert.match(d.result.content, 'Bacon Ipsum');
                assert.match(d.result['@type'], 'note');
                assert.match(d.result['@id'], _opt.pageId + ':poll:12824212');
            }
        }));
    },
    'has default values': function(done){
        trackPollEvent('poll:12824212', undefined, undefined, undefined, done(function(response, data){
            assert.equals(response.status, 200);
            for(var i = 0; i < data.length; i++){
                var d = JSON.parse(data[i]);

                // General value checks
                headerAsserts(d);
                providerAsserts(d);
                actorAsserts(d);
                objectAsserts(d);

                // Specific value checks
                // Header asserts
                assert.match(d['@type'], 'Respond');

                // Object asserts
                assert.match(d.object['@type'], 'Is this i question?');
                assert.match(d.object['@id'], _opt.pageId);
            }
        }));
    },*/
});
