buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = {};
_opt.clientId = 'sp-34534';
_opt,clientDomain = 'vg.no'; // FIXME: This needs to go places
_opt.trackingUrl = '127.0.0.1:8080';
_opt.pageId = 'urn:test.no:pagetest01';
_opt.language = 'no';
_opt.allowAutomaticTracking = false;

// function trackFormEvent(elementId, type, title, content, callback)

buster.testCase('A form event ', {
    'fails if pageId or clientId is missing': function(){
        _opt.clientId = undefined;
        var result = trackFormEvent('testElement01', undefined, undefined, undefined, undefined);
        assert.equals(result, false);

        _opt.cliendId = null;
        var result = trackFormEvent('testElement01', undefined, undefined, undefined, undefined);
        assert.equals(result, false);

        _opt.clientId = '';
        var result = trackFormEvent('testElement01', undefined, undefined, undefined, undefined);
        assert.equals(result, false);

        _opt.clientId = 'sp-34534';

        _opt.pageId = undefined;
        var result = trackFormEvent('testElement01', undefined, undefined, undefined, undefined);
        assert.equals(result, false);

        _opt.pageId = null;
        var result = trackFormEvent('testElement01', undefined, undefined, undefined, undefined);
        assert.equals(result, false);

        _opt.pageId = '';
        var result = trackFormEvent('testElement01', undefined, undefined, undefined, undefined);
        assert.equals(result, false);

        _opt.pageId = 'urn:test.no:pagetest01';

        var result = trackFormEvent(undefined, undefined, undefined, undefined, undefined);
        assert.equals(result, false);
        var result = trackFormEvent('', undefined, undefined, undefined, undefined);
        assert.equals(result, false);
        var result = trackFormEvent(null, undefined, undefined, undefined, undefined);
        assert.equals(result, false);

    },
    'server response 200': function(done){

        // function trackFormEvent(elementId, type, title, content, callback)

        trackFormEvent('testElement01', 'article', 'note', undefined, undefined, done(function(response, data){
            assert.equals(response.status, 200);
        }));

    },
    'contains all needed info': function(done){
        trackFormEvent('testElement01', 'application', 'note', 'Test Title', 'Bacon Ipsum æøå', done(function(response, data){
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
                assert.match(d.object['@type'], 'application');
                assert.match(d.object['@id'], _opt.pageId);
            }
        }));
    },
    /*'has default values': function(done){
        trackPageLoadEvent(undefined, undefined, undefined, done(function(response, data){
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
                assert.match(d['@type'], 'Read');

                // Object asserts
                assert.match(d.object['@type'], 'page');
                assert.match(d.object['@id'], _opt.pageId);
                assert.match(d.object.content, "");
                assert.match(d.object.displayName, document.title);
            }
        }));
    },*/
});
