buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = {};
_opt.clientId = 'sp-34534';
_opt.trackingUrl = '127.0.0.1:8080';
_opt.pageId = 'urn:test.no:pagetest01';
_opt.language = 'no';
_opt.allowAutomaticTracking = false;

buster.testCase('A page load ', {
    'server response 200': function(){

        // trackPageLoadEvent(type, content, title)

        // Should be true
        var result = trackPageLoadEvent('article', 'Testtitle', 'Stoler du på at alle norske medaljevinnere');
        assert.match(result, true);
        /*var result = trackPageLoadEvent();
        assert.match(result, true);
        var result = trackPageLoadEvent('page');
        assert.match(result, true);
        var result = trackPageLoadEvent(undefined, 'Stoler du på at alle norske medaljevinnere');
        assert.match(result, true);
        var result = trackPageLoadEvent(undefined, undefined, 'Stoler du på at alle norske medaljevinnere');
        assert.match(result, true);
        var result = trackPageLoadEvent('article', {'no':'Stoler du på at alle norske medaljevinnere'});
        assert.match(result, true);

        // Should be false
        _opt.pageId = undefined;
        var result = trackPageLoadEvent();
        refute.match(result, true);

        _opt.pageId = 'urn:test.no:pagetest01';
        _opt.clientId = undefined;
        var result = trackPageLoadEvent('page');
        refute.match(result, true);
        _opt.clientId = 'sp-34534';*/

    }
});
