buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = {};
_opt.clientId = 'sp-34534';
_opt.trackingUrl = '127.0.0.1:8080';
_opt.pageId = 'urn:test.no:formtest01';
_opt.language = 'no';
_opt.allowAutomaticTracking = false;

buster.testCase('A page load ', {
    'server response 200': function(){

        // trackFormEvent(type, elementId, name, content)

        // Should succede
        var result = trackFormEvent();
        assert.match(result, true);
    }
});
