"use strict";

buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

var _opt = {};
_opt.clientId = 'sp-34534';
_opt.trackingUrl = 'http://127.0.0.1:8002/api/v1/track';
_opt.language = 'no';
_opt.allowAutomaticTracking = false;
_opt.pageId = 'urn:test.no:objecttest01';

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

var tracker = new DataTracker(_opt, [], 'post');

buster.testCase('A tracker object', {
    'siteId was set': function(){
        assert.match(tracker.siteId, _opt.clientId);
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


function activityValidator(obj){

    // TODO: Create validation of object values.

    // The activity array has one or more items
    if(obj.length < 1){
        console.log('not enough objects in array');
        return false;
    }

    // The objects in the array has correct objects
    var allowedKeys = ['object', 'target', 'to', 'bto', 'result'];
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

    //Check if all objects has objectType/type (critical) and id or displayName (warning)
    for(i=0; i < obj.length; i++){
        var currentObj = obj[i][Object.keys(obj[i])[0]];

        var keys = Object.keys(currentObj);

        if(!(keys.indexOf('objectType') < 0 || keys.indexOf('type') < 0 )){
            console.log('Object type missing in ' + currentObj);
            return false;
        }
        if(!(keys.indexOf('id') < 0 || keys.indexOf('displayName') < 0 || keys.indexOf('name') < 0)){
            console.log('No displayName or id present in ' + currentObj);
        }
    }

    return true;
}
