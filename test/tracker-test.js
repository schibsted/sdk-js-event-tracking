buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = {};
_opt.siteId = 'sp-34534';
_opt.trackingUrl = '127.0.0.1:8080';
_opt.language = 'no';

var tracker = new DataTracker(_opt, [], 'post');

var testObjects = [
    {
        object: {
            objectType: 'question',
            displayName: 'Burde Northug få gå sprinten i VM?',
            options: ['Ja', 'Nei'],
            answer: 'Ja',
        },
    },
    {
        target: {
            objectType: 'article',
            displayName: 'Innrømmer svikt i kommunikasjon med Northug - Langrenn - VG',
            url: 'http://www.vg.no/sport/langrenn/langrenn/innroemmer-svikt-i-kommunikasjon-med-northug/a/23383896/',
        },
    }
];

buster.testCase('A tracker object', {
    'siteId was set': function(){
        assert.match(tracker.siteId, _opt.siteId);
    },
    'trackingUrl was set': function(){
        assert.match(tracker.trackingUrl, _opt.trackingUrl);
    },
    'A user ID was given': function(){
        assert.defined(tracker.anonymousId);
    },
    'Date has correct format': function(){
        assert.match(tracker.published, /(\d\d\d\d)\D?(\d\d)\D?(\d\d)\D?(\d\d)\D?(\d\d\D?(\d\d\.?(\d*))?)(Z|[+-]\d\d?(:\d\d)?)?/);
    },
    'Language is set': function(){
        assert.match(tracker.language, _opt.language);
    },
    'A valid JSON object is returned': function(){

        tracker.appendActivityObject(testObjects[0]);
        tracker.appendActivityObject(testObjects[1]);
        assert.isString(tracker.getActivity());

    },
});

buster.testCase('A comment event', {
    'default values are set': function(){
        var test = trackCommentEvent();
        assert.match(test[0].object.id, null);
        assert.match(test[0].object.content, '');
        assert.match(test[0].object.inReplyTo, document.title);
        assert.match(test[1].target.objectType, 'article');
        assert.match(test[1].target.displayName, document.title);
    },
    'set values are set': function(){
        var test = trackCommentEvent(1234, 'Some text', 'http://test.no', 'page', 'Test Page');
        assert.match(test[0].object.id, 1234);
        assert.match(test[0].object.content, 'Some text');
        assert.match(test[0].object.inReplyTo, 'http://test.no');
        assert.match(test[1].target.objectType, 'page');
        assert.match(test[1].target.displayName, 'Test Page');
    },
    'some values are set': function(){
        var test = trackCommentEvent(undefined, 'Some text', undefined, 'page', 'Test Page');
        assert.match(test[0].object.id, null);
        assert.match(test[0].object.content, 'Some text');
        assert.match(test[0].object.inReplyTo, document.title);
        assert.match(test[1].target.objectType, 'page');
        assert.match(test[1].target.displayName, 'Test Page');
    },

});
buster.testCase('A raw object input', {
    'data is returned as is': function(){
        var inputObject = {
            verb: 'share',
        };
        var result = sendActivityObject(inputObject);
        assert.match(inputObject, result);
    },

});
buster.testCase('A custom event input', {
    'Data is returned as a array of objects': function(){
        var testArray = [{
            object: {
                objectType: 'person',
                displayName: 'Person Test',
                id: 1234,
            },
        },{
            target: {
                objectType: 'service',
                displayName: 'Test Service',
                id: 'sb_134213',
            },
        }];
        var result = generalEventTracker('test', 'object', {objectType: 'person', displayName: 'Person Test', id: 1234}, 'target', {objectType: 'service', displayName: 'Test Service', id: 'sb_134213'});
        assert.match(testArray, result);

        // Should fail if verb is not set.
        var result = generalEventTracker();
        assert.match(result, false);

        // Should fail if verb is not set.
        var result = generalEventTracker(undefined, 'object', {objectType: 'person', displayName: 'Person Test', id: 1234});
        assert.match(result, false)
    },

});
buster.testCase('A comment form event', {
    'Data is returned as a array of objects': function(){

        var result = trackCommentEvent(1234, 'First comment!', 'http://vg.no', 'page', 'VG.no');
        assert.match(activityValidator(result), true);
    },

});

function activityValidator(obj){

    // The activity array has one or more items
    if(obj.length < 1){
        console.log('not enough objects in array');
        return false;
    }

    // The objects in the array has correct objects
    var allowedKeys = ['object', 'target', 'to', 'bto'];
    for(var i = 0; i < obj.length; i++){
        if(allowedKeys.indexOf(Object.keys(obj[i])[0].toLowerCase()) < 0){
            console.log('Unsupportet object used');
            return false;
        }
        if(Object.keys(obj[i]).length > 1){
            console.log('Object has to many parent nodes');
            return false;
        }
    }

    //Check if all objects has objectType/type and id or displayName
    for(var i =0; i < obj.length; i++){

        
    }

    return true;
}
