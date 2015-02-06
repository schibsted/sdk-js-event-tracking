"use strict";

// TODO: Manage IDs from external service and cookies
// TODO: Create option for bulk sending
// TODO: Automatic twitter tracking? https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSocial
// TODO: Search tracking, could be done with only one parameter
// TODO: Create test/debug mode that doesn't send data but console logs it!
// TODO: Determine if uri/url should be used and change
// TODO: Prettify!
// TODO: Set up Grunt to change return types in functions on build.

var _opt = _opt || {};
var activityQueue = [];

// Page load event

window.onload = function(){

    var activities = [
        {
            object: {
                objectType:     'page',
                url:            document.URL,
                displayName:    document.title,
            },
        },
    ];

    var result = createTrackerProcessData(activities, 'receive');

}

/**
 * A function for tracking events to html-forms.
 * @param {string} type - The type of object the form represents (e.g content, email). Default: 'content'
 * @param {string} id - A unique identifier for the form. Default: null
 * @param {string} name - The display name for the form e.g 'Send email'. Default: ''
 * @param {string|object} inReplyTo - A id, title, or an object representing the location of the form or a reference to a parent object. Default: page title
 * @param {string} target - A activity stream 2.0 reciving object ('to', 'bto', 'target' are supported at the moment). Default: 'target'
 * @param {string} targetType - Similar to type, but for the receiving object. Default: 'service'
 * @param {string} targetId - Similar to id, but for the receiving object. Default: null
 * @param {string} targetName - Similar to name but for the receiving object. Default: ''
 */
function trackFormEvent(type, id, name, inReplyTo, target, targetType, targetId, targetName){

    var activities = [
        {
            object: {
                objectType: type || 'content',
                displayName: name || '',
                inReplyTo: inReplyTo || document.title,
                url: document.URL,
            }
        },
    ]
    targetObject = {};
    targetData = {
        objectType: targetType || 'service',
        id: targetId || null,
        displayName: targetName || document.title,
    }

    targetObject[target] = targetData;

    activities.push(targetObject);

    var result = createTrackerProcessData(activities, 'send');
    return activities;
}

/**
 * Function for tracking comment fields. Will generate an activities object and send it to data collector
 * @param {string} commentId - A unique ID for the comment. Default: null
 * @param {string} content - The text-body of the comment. Default ''
 * @param {string|object} inReplyTo - A id, title, comment, or an object representing the location of the form or a reference to a parent object. Default: page title
 * @param {string} targetType - The type of entity that receives the comment. Default: 'article'
 * @param {string} targetName - The name of the entity that receives the comment. Default: page title
 * @returns {object} Activities object.
 */
function trackCommentEvent(commentId, content, inReplyTo, targetType, targetName){

    var activities = [
        {
            object: {
                objectType: 'comment',
                id: commentId || null,
                content: content = content || '',
                inReplyTo: inReplyTo || document.title,
            }
        },
        {
            target: {
                objectType: targetType || 'article',
                displayName: targetName || document.title,
                url: document.URL,
            }
        },
    ];

    var result = createTrackerProcessData(activities, 'submit');
    return activities;
}

/**
 * A function for tracking polls in websites. The function will try to locate the options and answer automatically if not specified
 * @param {string} pollId - A unique ID for the poll. Default: null
 * @param {string} question - The question asked. Default: ''
 * @param {object} element - if automatic answer/option discovery is wanted, pleas pass the element that triggers the function (e.g this).
 * @param {array} options - The different possible answers to the question. Default: automatic
 * @param {array} answer - The answer(s) the user makes. Default: automatic
 * @returns {object} Activities object.
 */
function trackPollEvent(pollId, question, element, options, answer){
    var activities = [];
    var activityObject = {
        object: {
            objectType: 'question',
            id: pollId || null,
            displayName: question || '',
        }
    };

    if(options !== undefined){
        activityObject.object.options = options;
    }
    else if(answer !== undefined){
        activityObject.object.answer = options;
    }
    else if (element !== undefined){
        var foundForm = findFormElement(element);
        if(foundForm !== null){
            var optionsObject = {
                options: [],
                answer: [],
            };
            optionsObject = findOptions(foundForm, optionsObject);

            activityObject.object.options = optionsObject.options;
            activityObject.object.answer = optionsObject.answer;
        }
    }
    activities.push(activityObject);

    activityObject = {
        target: {
            objectType: 'article',
            displayName: document.title,
            url: document.URL,
        }
    };
    activities.push(activityObject);
    var result = createTrackerProcessData(activities, 'respond');
    return activities;

}

/**
* A function for tracking events to html-forms.
* @param {string} verb - An Activitystram 2.0 verb describing the tracked action/event. Default: 'complete'
* @param {string} type - The type of object the form represents (e.g content, email). Default: 'process'
* @param {string} id - A unique identifier for the form. Default: null
* @param {string} name - The display name for the object e.g 'Send email'. Default: ''
* @param {string} target - A activity stream 2.0 reciving object ('to', 'bto', 'target' are supported at the moment). Default: 'target'
* @param {string} targetType - Similar to type, but for the receiving object. Default: 'service'
* @param {string} targetId - Similar to id, but for the receiving object. Default: null
* @param {string} targetName - Similar to name but for the receiving object. Default: document.title
* @returns {object} Activities object.
*/
function clickEventTracker(verb, type, id, name, target, targetType, targetId, targetName){
    var verb = verb || 'complete';
    var target = target || 'target';
    var activities = [{
        object: {
            objectType: type || 'process',
            displayName: name || '',
            url: document.URL,
            id: id || null,
        }
    },];

    var targetObjData = {
        objectType: targetType || 'service',
        displayName: targetName || document.title,
        url: document.URL,
        id: targetId || null,
    };
    var targetObject = {};
    targetObject[target] = targetObjData;

    activities.push(targetObject);
    var result = createTrackerProcessData(activities, verb);
    return activities;
}

// Eventlistener for Facebook events
if(_opt.allowAutomaticTracking !== false){
    FB.Event.subscribe('edge.create', function(targetUrl) {
        socialEventTracker('like', 'page', 'target', document.title, 'service', null, 'Facebook', targetUrl);
    });
    FB.Event.subscribe('edge.remove', function(targetUrl) {
        socialEventTracker('remove', 'page', 'target', document.title, 'service', null, 'Facebook', targetUrl);
    });
    FB.Event.subscribe('message.send', function(targetUrl) {
        socialEventTracker('share', 'page', 'target', document.title, 'service', null, 'Facebook', targetUrl);
    });
}

// TODO: Create event listner for twitter. Version 2?

/**
* A function for tracking events to html-forms.
* @param {string} verb - An Activitystram 2.0 verb describing the tracked action/event. Default: 'like'
* @param {string} type - The type of object the form represents (e.g content, email). Default: 'page'
* @param {string} id - A unique identifier for the form. Default: null
* @param {string} name - The display name for the object. Default: document.title
* @param {string} target - A activity stream 2.0 reciving object. Default: 'target'
* @param {string} targetType - Similar to type, but for the receiving object. Default: 'service'
* @param {string} targetId - Similar to id, but for the receiving object. Default: null
* @param {string} targetName - Similar to name but for the receiving object. Default: ''
* @param {string} targetUrl - The URL of the target service. Default ''
* @returns {object} Activities object.
*/
function socialEventTracker(verb, type, target, name, targetType, targetId, targetName, targetUrl){
    var verb = verb || 'like';
    var target = target || 'target';
    var activities = [{
        object: {
            objectType: type || 'page',
            displayName: name || document.title,
            url: document.URL,
        }
    },];

    var targetObjData = {
        objectType: targetType || 'service',
        displayName: targetName || '',
        url: targetUrl || '',
        id: targetId || null,
    };
    var targetObject = {};
    targetObject[target] = targetObjData;

    activities.push(targetObject);
    var result = createTrackerProcessData(activities, verb);
    return activities;
}

/**
* A function for tracking play/pause and other state changes to video/sound etc.
* @param {string} verb - The action performed as an ActivityStream 2.0 verb. Default: 'watch' Suggestions: watch, listen, complete, stop(?)
* @param {string} type - The type of media that the user interacts with. Default: 'video'
* @param {string} name - The name of the video/audi. Default: document.title
* @param {string} mediaId - A unique identifier for the media object. Default: null
* @returns {object} Activities object.
*/
function mediaStateTracker(verb, type, name, mediaId){
    var verb = verb || 'watch';
    var activities = [{
        object: {
            objectType: type || 'video',
            displayName: name || document.title,
            id: mediaId || null,
            url: document.URL,
        }
    },];

    var targetObjData = {
        objectType: targetType || 'service',
        displayName: targetName || '',
        url: targetUrl || '',
        id: targetId || null,
    };

    var result = createTrackerProcessData(activities, verb);
    return activities;
}

// TODO: Write documentation
/**
* A function for tracking everything. The trade off is that more work needs to be done with the input parameters.
* @param {string} verb - A verb describing det action that will be tracked. E.g 'share'. Will return false if not set
* @returns {object | bool} Activities object or false if no verb is set.
*/
function generalEventTracker(verb, objectType, objectData, targetType, targetData){
    var verb = verb || '';
    if(verb === ''){
        return false;
    }
    var activities = [];
    var objectType = objectType || 'object';
    var targetType = targetType || 'target';

    var fromObj = {};
    var toObj = {};
    fromObj[objectType] = objectData;
    toObj[targetType] = targetData;

    activities = [fromObj, toObj];
    var result = createTrackerProcessData(activities, verb);
    return activities;
}

/**
* A function that takes a pure Activitystream formated object and sends it with no valiadtion to server
* @param {object} activity - A object following the ActivityStream 2.0 format. No default.
* @returns {bool} true on success, false if anything goes wrong. (client side only). // TODO: fix return values
*/
function sendActivityObject(activityObject){
    activityQueue.push(activityObject);
    var result = processActivityQueue();
    return activityObject;

    // TODO: Make sure return is true || false
}

function DataTracker(_opt, activityObjectsArray, verb) {
    return {
        siteId:         _opt.siteId || undefined,
        trackingUrl:    _opt.trackingUrl || undefined,
        anonymousId:    getUserId(),
        published:      new Date().toISOString(),
        language:       _opt.language || 'en',
        doNottrack:     _opt.doNotTrack || false,
        activities:     activityObjectsArray || [],
        verb:           verb,

        createActor: function() {

            var actor = {};

            if(this.anonymousId){
                actor.id = this.anonymousId;
            }
            actor.userAgent = navigator.userAgent;
            actor.deviceLanguage = this.getDeviceLanguage();
            actor.devicePlatform = navigator.platform;

            return actor;

        },

        createGenerator: function() {

            var generator = {};

            generator.ip = '', // TODO: figure out if this is host or client IP.
            generator.url = document.URL;
            generator.title = document.title;
            generator.referrer = document.referrer;
            generator.provider = this.siteId;

            var campaign = this.getCampaignMeta();
            if(campaign !== null){
                generator.campaign = campaign;
            }

            return generator;
        },

        appendActivityObject: function(activityObject) {
            this.activities.push(activityObject);
        },

        getCampaignMeta: function(){
            var sourceKey = ['utm_source', 'Data_source'];
            var mediumKey = ['utm_medium', 'Data_medium'];
            var nameKey = ['utm_campaign', 'Data_campaign'];

            var campaign = {};
            var returnValueFlag = false;

            var source = this.getParameterByArray(sourceKey);
            if(source !== null){
                campaign.campaignSource = source;
                returnValueFlag = true;
            }

            var medium = this.getParameterByArray(mediumKey);
            if(medium !== null){
                campaign.campaignMedium = medium;
                returnValueFlag = true;
            }

            var name = this.getParameterByArray(nameKey);
            if(name !== null){
                campaign.campaignName = name;
                returnValueFlag = true;
            }

            if(returnValueFlag){
                return campaign;
            }
            return null;
        },

        getParameterByArray: function(searchArray){

            for(var i = 0; i < searchArray.length; i++){
                if(getParameter(searchArray[i]) !== null){
                    return getParameter(searchArray[i]);
                }
            }
            return null;
        },

        getDeviceLanguage: function(){

            var userLanguage = 'NaN';

            if (navigator.userLanguage){
                userLanguage = navigator.userLanguage;
            }
            else if (navigator.language){
                userLanguage = navigator.language;
            }

            return userLanguage;
        },

        getActivity: function() {
            var retVal = {};

            if(this.verb && this.verb !== undefined && this.verb !== null){
                retVal.verb = this.verb;
            } else {return 'no verb found'}
            if(this.published){
                retVal.published = this.published;
            } else {return 'no timestamp was found'}
            if(this.language){
                retVal.language = this.language;
            }

            for(var i = 0; i < this.activities.length; i++){
                for(var attrname in this.activities[i]){
                    retVal[attrname] = this.activities[i][attrname];
                }
            }

            // Add actor
            retVal.actor = this.createActor();
            retVal.generator = this.createGenerator();

            return JSON.stringify(retVal);

        },
    }
}

function getUserId(){
    return 1337;
}
function getParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function processActivityQueue(){

    // TODO: Extend this function to enable bulk sending and manual sending of data.

    var errCount = 0;

    while(activityQueue.length > 0 && errCount <5){
        if(sendData(activityQueue[0], 'http://127.0.0.1:1337/api')){
            activityQueue.shift();
        }
        else {
            errCount++;
        }
    }
}
function sendData(data, serverUri) {

    var xhr = new XMLHttpRequest();
    xhr.open('post', serverUri);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(data);

    var response = 0;

    xhr.onreadystatechange = function(){
        if(xhr.readyState===4){
            response = xhr.status;
        }
    };
    if(response < 300 || response >= 200){
        return true;
    }
    return false;
}

function getDataAttributes(element, dataContainer){

    var data = dataContainer || {};

    data.verb = element.getAttribute('data-verb');
    if(data.verb === null && element.nodeName.toLowerCase() !== 'body'){
        return getDataAttributes(element.parentNode, {});
    }
    if(data.verb === null){
        return false;
    }
    return data;
}
function createTrackerProcessData(activities, verb){
    // TODO: Better errror validation
    var tracker = new DataTracker(_opt, activities, verb);
    activityQueue.push(tracker.getActivity());
    processActivityQueue();
    return true;
}
function findFormElement(element){

    if(element.tagName.toLowerCase() !== 'form'){
        return findFormElement(element.parentNode);
    }
    else if(element.tagName.toLowerCase() === 'body'){
        return null;
    }
    return element;
}
function findOptions(element, optionsObject) {

    var children = element.childNodes;

    for(var i=0; i < children.length; i++){

        if(children[i].nodeName !== "#text"){
            if(children[i].tagName.toLowerCase() === 'input' && children[i].getAttribute('type').toLowerCase() === 'radio'){
                optionsObject.options.push(children[i].getAttribute('value').toLowerCase());
                if(children[i].checked){
                    optionsObject.answer.push(children[i].getAttribute('value').toLowerCase());
                }
            }
            else if(children[i].tagName.toLowerCase() === 'input' && children[i].getAttribute('type').toLowerCase() === 'checkbox'){
                optionsObject.options.push(children[i].getAttribute('value').toLowerCase());
                if(children[i].checked){
                    optionsObject.answer.push(children[i].getAttribute('value').toLowerCase());
                }
            }
            if(children[i].childElementCount !== undefined && children[i].childElementCount > 0){
                var optionsObject = findOptions(children[i], optionsObject);
                if(children.length <= i){
                    return optionsObject;
                }
            }
        }
    }
    return optionsObject;
}
