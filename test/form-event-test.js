/*buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = {};
_opt.clientId = 'sp-34534';
_opt.trackingUrl = '127.0.0.1:8080';
_opt.pageId = 'urn:test.no:formtest01';
_opt.language = 'no';
_opt.allowAutomaticTracking = false;

buster.testCase('A form event ', {
    'server response 200': function(){

        // trackFormEvent(elementId, type, title, content)

        // Should be true
        var result = trackFormEvent('form01');
        assert.match(result, true);
        var result = trackFormEvent('form01', 'note', undefined, undefined);
        assert.match(result, true);
        var result = trackFormEvent('form01', undefined, 'Title of this form', undefined);
        assert.match(result, true);
        var result = trackFormEvent('form01', undefined, 'Title of this form', 'Some text inputed in the form');
        assert.match(result, true);

        var testContentObject = {
            '@type': 'Collection',
            'items': [
                {
                    '@type': 'Person',
                    '@id': 'urn:test.no:formtest01:form01:input01',
                    'displayName': 'Name',
                    'content': 'Per Son',
                },
                {
                    '@type': 'Content',
                    '@id': 'urn:test.no:formtest01:form01:textarea01',
                    'displayName': 'Wish',
                    'content': 'I wish happiness and peace to everyone',
                },
            ]
        }
        var result = trackFormEvent('form01', undefined, 'Title of this form', testContentObject);
        assert.match(result, true);

        // Should not be true
        var result = trackFormEvent();
        refute.match(result, true);
        var result = trackFormEvent(undefined);
        refute.match(result, true);
        var result = trackFormEvent(null);
        refute.match(result, true);
        var result = trackFormEvent('');
        refute.match(result, true);
    }
});
*/
