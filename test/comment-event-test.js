buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = _opt || {};

// trackCommentEvent(commentId, originType, content, inReplyTo, callback)

buster.testCase('A form event ', {
    'fails if pageId or clientId is missing': function(){
        _opt.clientId = undefined;
        var result = trackCommentEvent('comment:12824212', 'page');
        assert.equals(result, false);

        _opt.cliendId = null;
        var result = trackCommentEvent('comment:12824212', 'page');
        assert.equals(result, false);

        _opt.clientId = '';
        var result = trackCommentEvent('comment:12824212', 'page');
        assert.equals(result, false);

        _opt.clientId = 'sp-34534';

        _opt.pageId = undefined;
        var result = trackCommentEvent('comment:12824212', 'page');
        assert.equals(result, false);

        _opt.pageId = null;
        var result = trackCommentEvent('comment:12824212', 'page');
        assert.equals(result, false);

        _opt.pageId = '';
        var result = trackCommentEvent('comment:12824212', 'page');
        assert.equals(result, false);

        _opt.pageId = 'urn:test.no:pagetest01';

        var result = trackCommentEvent(undefined, undefined, undefined, undefined, undefined);
        assert.equals(result, false);
        var result = trackCommentEvent('', 'page', undefined, undefined, undefined);
        assert.equals(result, false);
        var result = trackCommentEvent(null, undefined, undefined, undefined, undefined);
        assert.equals(result, false);

    },
    'server response 200': function(done){

        // trackCommentEvent(commentId, originType, content, inReplyTo, callback)

        trackCommentEvent('comment:12824212', 'article', 'note', undefined, done(function(response, data){
            assert.equals(response.status, 200);
        }));

    },
    'contains all needed info': function(done){
        trackCommentEvent('comment:12824212', 'article', 'Bacon Ipsum æøå', undefined, done(function(response, data){
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
                assert.match(d.result.content, 'Bacon Ipsum æøå');
                assert.match(d.result['@type'], 'note');
                assert.match(d.result['@id'], _opt.pageId + ':comment:12824212');
            }
        }));
    },
    'has default values': function(done){
        trackCommentEvent('comment:12824212', undefined, undefined, undefined, done(function(response, data){
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
                assert.match(d.object['@type'], 'page');
                assert.match(d.object['@id'], _opt.pageId);
            }
        }));
    },
});
