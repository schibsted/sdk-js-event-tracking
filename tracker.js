"use strict";

// TODO: Manage IDs from external service and cookies
// TODO: Create option for bulk sending
// TODO: Search tracking, could be done with only one parameter
// TODO: Create test/debug mode that doesn't send data but console logs it!
// TODO: Prettify!
// TODO: Set up Grunt to change return types in functions on build.
// TODO: Figure out how IPs should be handled.
// TODO: Should timestamp have millisecond resolution?

var _opt = _opt || {};
var activityQueue = [];

// Track event on page load if automatic tracking is not prohibited

window.onload = function(){
    if(_opt.allowAutomaticTracking !== false){
        trackPageLoadEvent('page');
    }
}
// TODO: Should page load include tags?
/**
 * A function for tracking events to html-forms.
 * @param {string | object} type - The type of page that is loaded. E.g 'article', 'page', 'service'. Default: 'page'
 * @param {string | object} title - The title of the page. Default: document.title
 * @param {string | object} content - The content of the page, or a summary. Default: ''
 */
function trackPageLoadEvent(type, title, content){

    if(!checkMandatoryOptions()){
        return false;
    }

    var activities = [
        {
            'object': {
                '@type':          type || 'page',
                '@id':            _opt.pageId,
                'url':            document.URL,
                'displayName':    title || document.title,
                'content':        content || '',
            },
        },
    ];

    return createTrackerProcessData(activities, 'Read');
}

/**
 * A function for tracking events to html-forms.
 * @param {string} elementId - A unique identifier for the element where the event originated. Function will not track without this parameter.
 * @param {string} type - The type of object the form represents (e.g content, email). Default: 'content'
 * @param {string} name - The display name for the form e.g 'Send email'. Default: ''
 * @param {string} content - The conentent that is added to the form. Default: ''
 */
function trackFormEvent(elementId, type, title, content){

    if(!checkMandatoryOptions()){
        return false;
    }
    var pageId = _opt.pageId;

    var activities = [
        {
            'object': {
                '@type': 'link',
                '@id': pageId || '',
                'href': document.URL,
            }
        },
    ];

    var resultObject = {};
    // TODO: generate ID an put here?
    var resultData = {
        '@type': type || 'content',
        '@id': pageId + ':' + elementId || '',
        'displayName': title || '',
        'content': content || '',
        'inReplyTo': document.URL,
    };
    resultObject['result'] = resultData;
    activities.push(resultObject);

    return createTrackerProcessData(activities, 'Respond');
}

/**
 * Function for tracking comment fields. Will generate an activities object and send it to data collector
 * @param {string} pageId - A unique identifier for the current page. Default: ''
 * @param {string} commentId - A unique ID for the comment. Default: null
 * @param {string} content - The text-body of the comment. Default ''
 * @param {string|object} inReplyTo - A id, title, comment, or an object representing the location of the form or a reference to a parent object. Default: document.URL
 * @returns {object} Activities object.
 */
function trackCommentEvent(pageId, commentId, content, inReplyTo){

    var activities = [
        {
            'result': {
                '@type': ['Note', {'spt':'Comment'}],
                '@id': pageId + ':' + commentId || '',
                'content': content || '',
                'inReplyTo': inReplyTo || document.URL,
            }
        },
        {
            'object': {
                '@type': 'link',
                '@id': pageId || '',
                'href': document.URL,
            }
        },
    ];

    var result = createTrackerProcessData(activities, 'Respond');
    return activities;
}

/**
 * A function for tracking polls in websites. The function will try to locate the options and answer automatically if not specified
 * @param {string} pageId - A unique ID for the page. Default: null
 * @param {string} pollId - A unique ID for the poll. Default: null
 * @param {string} question - The question asked. Default: ''
 * @param {object} element - if automatic answer/option discovery is wanted, pleas pass the element that triggers the function (e.g this).
 * @param {array} options - The different possible answers to the question. Default: automatic
 * @param {array} answer - The answer(s) the user makes. Default: automatic
 * @returns {object} Activities object.
 */
function trackPollEvent(pageId, pollId, question, element, options, answer){
    var activities = [];
    var activityObject = {
        'object': {
            '@type': 'Question',
            '@id': pageId + ':' + pollId || '',
            'displayName': question || '',
            'url': document.URL,
            'oneOf': {
                '@type':'Collection',
                'items':[],
            }
        }
    };
    var resultObject = {
        'result': {
            '@type': 'Question',
            'displayName': question || '',
            'replies': {
                '@type':'Collection',
                'items':[],
            },
        }
    };

    if(options !== undefined){
        var items = [];
        for(var i=0; i<options.length; i++) {
            var itemsObject = {
                '@type': 'PossibleAnswer',
                '@id': pageId + ':' + pollId + ':' + options[i],
            };
            items.push(itemsObject);
        }

        activityObject.object.oneOf.items = items;
    }
    if(answer !== undefined){
        var items = [];
        for(var i=0; i<answer.length; i++) {
            var itemsObject = {
                '@type': ['PossibleAnswer', {'spt':'Answer'}],
                '@id': pageId + ':' + pollId + ':' + answer[i],
            };
            items.push(itemsObject);
        }

        resultObject.result.replies.items = items;
    }
    // TODO: Make this work again if it should be here.
    /*else if (element !== undefined){
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
    }*/

    activities.push(activityObject);
    activities.push(resultObject);
    var result = createTrackerProcessData(activities, 'Respond');
    return activities;

}

/**
* A function for tracking events to html-forms.
* @param {string} pageId - A unique identifier for the page.
* @param {string} elementId - A unique identifier for the element.
* @param {string} verb - An Activitystram 2.0 verb describing the tracked action/event. Default: 'complete'
* @param {string} type - The type of object the form represents (e.g content, email). Default: 'process'
* @param {string} name - The display name for the object e.g 'Send email'. Default: ''
* @param {string} target - A activity stream 2.0 reciving object ('to', 'bto', 'target' are supported at the moment). Default: 'target'
* @param {string} targetType - Similar to type, but for the receiving object. Default: 'service'
* @param {string} targetId - Similar to id, but for the receiving object. Default: pageId
* @param {string} targetName - Similar to name but for the receiving object. Default: document.title
* @returns {object} Activities object.
*/
function clickEventTracker(pageId, elementId, verb, type, name, target, targetType, targetId, targetName){
    var verb = verb || 'complete';
    var target = target || 'target';
    var activities = [{
        'object': {
            '@type': type || 'process',
            'displayName': name || '',
            'url': document.URL,
            '@id': pageId + ':' + elementId || '',
        }
    },];

    var targetObjData = {
        '@type': targetType || 'page',
        'displayName': targetName || document.title,
        'url': document.URL,
        '@id': targetId || pageId,
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

// TODO: Complete documentation
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
function socialEventTracker(pageId, elementId, verb, type, target, name, targetType, targetId, targetName){
    var verb = verb || 'like';
    var target = target || 'target';
    var activities = [{
        'object': {
            '@type': type || 'page',
            '@id': pageId + ':' + elementId || '',
            'displayName': name || document.title,
            'url': document.URL,
        }
    },];

    var targetObjData = {
        '@type': targetType || 'service',
        'displayName': targetName || '',
        '@id': targetId || null, // TODO: Should ID for social media be predefined by us? something like urn:facebook.com
    };
    var targetObject = {};
    targetObject[target] = targetObjData;

    activities.push(targetObject);
    var result = createTrackerProcessData(activities, verb);
    return activities;
}

// TODO: Complete documentation
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
        'object': {
            '@type': type || 'video',
            'displayName': name || document.title,
            '@id': pageId + ':' + mediaId || null,
            'url': document.URL,
        }
    },];

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
* @returns {bool} true on success, false if anything goes wrong. (client side only).
*/
function sendActivityObject(activityObject){
    activityQueue.push(activityObject);
    var result = processActivityQueue();
    return activityObject;

    // TODO: Make sure return is true || false
}

function DataTracker(_opt, activityObjectsArray, verb) {
    return {
        siteId:         _opt.clientId || undefined,
        trackingUrl:    _opt.trackingUrl || undefined,
        anonymousId:    getUserId(),
        published:      getTimeStamp(),
        language:       _opt.language || 'en',
        doNottrack:     _opt.doNotTrack || false,
        activities:     activityObjectsArray || [],
        verb:           verb,
        context:        ['http://www.w3.org/ns/activitystreams',{'spt':'http://spt.no'}],

        createActor: function() {

            var actor = {};

            actor['@type'] = 'Person';

            if(this.anonymousId){
                actor['@id'] = this.anonymousId;
            }
            actor['spt:userAgent'] = navigator.userAgent;
            actor['spt:ip'] = ''; // TODO: Find a way to inject this on requesting this resource.
            actor['spt:screenSize'] = window.screen.width + 'x' + window.screen.height;
            actor['spt:viewportSize'] = getViewportDimensions();

            return actor;

        },

        createProvider: function() {

            var provider = {};

            provider['@type'] = 'Organization';
            provider['@id'] = getUserId();
            provider['spt:client'] = this.siteId;
            provider['url'] = document.URL;

            // TODO: Determin where campaigns should go.
            /*var campaign = this.getCampaignMeta();
            if(campaign !== null){
                generator.campaign = campaign;
            }*/

            return provider;
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
        // TODO: Determine if browser language is something we should include and in what form.
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

            retVal['@context'] = this.context;

            if(this.verb && this.verb !== undefined && this.verb !== null){
                retVal['@type'] = this.verb;
            } else {return 'no verb found'}
            if(this.published){
                retVal['published'] = this.published;
            } else {return 'no timestamp was found'}
            /*if(this.language){
                retVal.language = this.language;
            }*/ // TODO: Is this needed?

            for(var i = 0; i < this.activities.length; i++){
                for(var attrname in this.activities[i]){
                    retVal[attrname] = this.activities[i][attrname];
                }
            }

            // Add actor
            retVal.actor = this.createActor();
            retVal.provider = this.createProvider();

            return JSON.stringify(retVal);

        },
    }
}

function getTimeStamp(){
    var now = new Date(),
    timezoneOffset = -now.getTimezoneOffset(),
    diff = timezoneOffset >= 0 ? '+' : '-',
    padding = function(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    };

    return now.getFullYear()
        + '-' + padding(now.getMonth()+1)
        + '-' + padding(now.getDate())
        + 'T' + padding(now.getHours())
        + ':' + padding(now.getMinutes())
        + ':' + padding(now.getSeconds())
        + diff + padding(timezoneOffset / 60)
        + ':' + padding(timezoneOffset % 60);
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
        if(sendData(activityQueue[0], /*'http://127.0.0.1:1337/api'*/'http://127.0.0.1:8002/api/v1/track')){
            activityQueue.shift();
        }
        else {
            errCount++;
        }
    }
    if(errCount >= 5){
        // TODO: Create alert call to server here!
        return false;
    }
    return true;
}
function sendData(data, serverUri) {

    //console.log(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', serverUri);
    //console.log('request sent to ' + serverUri);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(data);

    var response = 0;

    xhr.onreadystatechange = function(){
        if(xhr.readyState===4){
            response = xhr.status;
            console.log(xhr.responseText);
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
    return processActivityQueue();
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
function getViewportDimensions() {
    var viewportwidth;
    var viewportheight;

    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
    }
    else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0){
        viewportwidth = document.documentElement.clientWidth,
        viewportheight = document.documentElement.clientHeight
    }
    else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }
    return viewportwidth + 'x' + viewportheight;
}
function checkMandatoryOptions(){
    if(_opt.clientId === undefined){
        return false;
    }
    if(_opt.pageId === undefined){
        return false;
    }
    return true;
}
