"use strict";

// TODO: Manage IDs from external service and cookies
// TODO: Search tracking, could be done with only one parameter
// TODO: Create test/debug mode that doesn't send data but console logs it!
// TODO: Prettify!
// TODO: Add spt:customId to actor. Can be set via _opt
// TODO: Change _opt to something more unique.
// TODO: Define parameters that can be a part of _opt
// TODO: Write function that unset null values in activity objects
// TODO: Make config files for local and prod versions

var _opt = _opt || {};
var activityQueue = [];
var errorCount = 0;
var serverUri = 'http://127.0.0.1:8002/api/v1/track';
var sentDataQueue = [];
;'use strict';

// Track event on page load if automatic tracking is not prohibited

window.onload = function(){
    if(_opt.allowAutomaticTracking !== false){
        console.log('autotrack happend');
        trackPageLoadEvent('page');
    }
};
// TODO: Should page load include tags?
// FIXME: Add origin object when a referer is known.
/**
 * A function for tracking events to html-forms.
 * @param {string | object} type - The type of page that is loaded. E.g 'article', 'page', 'service'. Default: 'page'
 * @param {string | object} title - The title of the page. Default: document.title
 * @param {string | object} content - The content of the page, or a summary. Default: ''
 * @param {function} callback - A callback function that will fire when the event has been tracked or if it failed.
 */

// TODO: Custom data in all event functions
function trackPageLoadEvent(type, title, content, callback){

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

    createTrackerProcessData(activities, 'Read', callback);
}

/**
 * A function for tracking events to html-forms. Default verb is respond.
 * @param {string} elementId - A unique identifier for the element where the event originated. Function will not track without this parameter.
 * @param {string} originType - The type of entity the form originates from (e.g page, article, application). Default 'page'
 * @param {string} type - The type of object the form represents (e.g content, spn:email). Default: 'content'
 * @param {string} title - The display name or title for the form e.g 'Send email'. Default: ''
 * @param {string | object} content - The conentent that is added to the form. Default: ''
 * @param {function} callback - A callback function that will fire when the event has been tracked or if it failed.
 */
function trackFormEvent(elementId, originType, type, title, content, callback){

    if(!checkMandatoryOptions()){
        return false;
    }
    var pageId = _opt.pageId;

    if(elementId === undefined || elementId === '' || elementId === null){
        return false;
    }

    var activities = [
        {
            'object': {
                '@type': originType || 'page',
                '@id': pageId || '',
                'url': document.URL,
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

    return createTrackerProcessData(activities, 'Respond', callback);
}

/**
 * Function for tracking comment fields. Will generate an activities object and send it to data collector
 * @param {string} commentId - A unique ID for the comment. Must be set
 * @param {string} originType - The type of entity the form originates from (e.g page, article, application). Default 'page'
 * @param {string} content - The text-body of the comment. Default ''
 * @param {string|object} inReplyTo - A id, title, comment, or an object representing the location of the form or a reference to a parent object. Default: document.URL
 * @param {function} callback - A callback function that will fire when the event has been tracked or if it failed.
 */
function trackCommentEvent(commentId, originType, content, inReplyTo, callback){

    if(!checkMandatoryOptions()){
        return false;
    }
    var pageId = _opt.pageId;

    if(commentId === undefined || commentId === '' || commentId === null){
        return false;
    }

    var activities = [
        {
            'result': {
                '@type': ['Note', {'spt':'Comment'}],
                '@id': _opt.pageId + ':' + commentId || '',
                'content': content || '',
                'inReplyTo': inReplyTo || document.URL,
            }
        },
        {
            'object': {
                '@type': originType || 'page',
                '@id': _opt.pageId || '',
                'url': document.URL,
            }
        },
    ];

    var result = createTrackerProcessData(activities, 'Respond', callback);
    return activities;
}

// FIXME: Add origin
/**
 * A function for tracking polls in websites. The function will try to locate the options and answer automatically if not specified
 * @param {string} pollId - A unique ID for the poll. Default: null
 * @param {string} question - The question asked. Default: ''
 * @param {array} options - The different possible answers to the question. Default: []
 * @param {array} answer - The answer(s) the user makes. Default: []
 * @param {function} callback - A callback function that will fire when the event has been tracked or if it failed.
 * @returns {object} Activities object.
 */
function trackPollEvent(pollId, question, options, answer, callback){

    if(!checkMandatoryOptions()){
        return false;
    }
    var pageId = _opt.pageId;

    if(pollId === undefined || pollId === '' || pollId === null){
        return false;
    }

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

    var items, itemsObject, i;

    if(options !== undefined){
        items = [];
        for(i=0; i<options.length; i++) {
            itemsObject = {
                '@type': 'PossibleAnswer',
                '@id': pageId + ':' + pollId + ':' + options[i],
            };
            items.push(itemsObject);
        }

        activityObject.object.oneOf.items = items;
    }
    if(answer !== undefined){
        items = [];
        for(i=0; i<answer.length; i++) {
            itemsObject = {
                '@type': ['PossibleAnswer', {'spt':'Answer'}],
                '@id': pageId + ':' + pollId + ':' + answer[i],
            };
            items.push(itemsObject);
        }

        resultObject.result.replies.items = items;
    }

    activities.push(activityObject);
    activities.push(resultObject);
    var result = createTrackerProcessData(activities, 'Respond', callback);
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
    verb = verb || 'complete';
    target = target || 'target';
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
    verb = verb || 'like';
    target = target || 'target';
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
    verb = verb || 'watch';
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
    verb = verb || '';
    if(verb === ''){
        return false;
    }
    var activities = [];
    objectType = objectType || 'object';
    targetType = targetType || 'target';

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
;'use strict';

function DataTracker(_opt, activityObjectsArray, verb) {
    return {
        siteId:         _opt.clientId || undefined,
        trackingUrl:    _opt.trackingUrl || undefined,
        userObject:     new UserData(),
        published:      getTimeStamp(),
        language:       _opt.language || 'en',
        doNottrack:     _opt.doNotTrack || false,
        activities:     activityObjectsArray || [],
        verb:           verb,
        context:        ['http://www.w3.org/ns/activitystreams',{'spt':'http://spt.no'}],

        createActor: function() {

            var actor = {};

            actor['@type'] = 'Person';

            var anonymousId = userObject.userId;

            if(anonymousId){
                actor['@id'] = anonymousId;
            }
            actor['spt:userAgent'] = navigator.userAgent;
            actor['spt:ip'] = ''; // TODO: Find a way to inject this on requesting this resource.
            actor['spt:screenSize'] = window.screen.width + 'x' + window.screen.height;
            actor['spt:viewportSize'] = getViewportDimensions();
            actor['spt:acceptLanguage'] = this.getDeviceLanguage();

            return actor;
        },

        createProvider: function() {

        // FIXME: Go over this info. ID and URL might need to be fixed

            var provider = {};

            provider['@type'] = 'Organization';
            provider['@id'] = 'urn:spt.no:'+this.siteId;
            //provider['spt:client'] = this.siteId;
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
            } else {return 'no verb found';}
            if(this.published){
                retVal['published'] = this.published;
            } else {return 'no timestamp was found';}

            for(var i = 0; i < this.activities.length; i++){
                for(var attrname in this.activities[i]){
                    if (this.activities[i].hasOwnProperty(attrname)) {
                        retVal[attrname] = this.activities[i][attrname];
                    }
                }
            }

            // Add actor
            retVal.actor = this.createActor();
            retVal.provider = this.createProvider();

            //console.log(JSON.stringify(retVal));

            return JSON.stringify(retVal);

        },
    };
}
;"use strict";

function UserData (){
    return {
        userId:         undefined,
        key:            'DataTrackerUser',
        idServiceUrl:   'http://127.0.0.1:8003/api/v1/identify',

        getUserId: function(){

            if(this.userId !== undefined){
                return this.userId;
            }

            var cookieID = this.getUserIdFromCookie();
            if(cookieID === false){
                // FIXME: Need correct format for in
                this.userId = this.getUserIdFromService(/* cookie object */);
            }
            this.userId = this.getUserIdFromService();
            this.setUserIdInCookie();
            return this.userId;

        },
        getUserIdFromCookie: function(){
            return decodeURIComponent(
                document.cookie.replace(
                    new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(this.key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1"
                )
            ) || false;
        },
        getUserIdFromService: function(id){
            sendData(id, this.idServiceUrl, function(response, data){
                if(response.status === 200){
                    this.userId = data.anonymousId;
                }
            });
        },
        setUserIdInCookie: function(){
            document.cookie = this.key + '=' + this.userId;
        },
    };
}
;'use strict';

function createTrackerProcessData(activities, verb, callback){

    var tracker = new DataTracker(_opt, activities, verb); // FIXME: This does not have to be created on each run.
    activityQueue.push(tracker.getActivity());
    return processActivityQueue(callback);
}
function processActivityQueue(callback){

    var uri = _opt.trackingUrl || serverUri;

    var result = sendData(activityQueue, uri, callback);
    activityQueue = [];

    if(errorCount >= 5){
        // TODO: Report to server
        console.log('data was not sent in ' + errorCount + ' tries');
    }
    return result;
}
function sendData(data, uri, callback) {

    var async = _opt.sendDataAsync || true;

    sentDataQueue.push(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', uri, async);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    try {
        xhr.send(data);
    }
    catch(err){
        errorCount++;
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState===4){

            var sentData = sentDataQueue.shift();

            if(xhr.status === 200) {
                errorCount = 0;
            }
            else {
                activityQueue = activityQueue.concat(sentData);
                errorCount++;
            }
            if(callback !== undefined){
                callback(xhr, sentData);
            }
        }
    };
}
;"use strict";

var _opt = _opt || {};

function getTimeStamp(){
    var now = new Date(),
    timezoneOffset = -now.getTimezoneOffset(),
    diff = timezoneOffset >= 0 ? '+' : '-',
    padding = function(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    };

    // Put date in timestamp
    var timestamp = now.getFullYear() + '-' + padding(now.getMonth()+1) + '-' + padding(now.getDate());
    // Add time
    timestamp = timestamp + 'T' + padding(now.getHours()) + ':' + padding(now.getMinutes()) + ':' + padding(now.getSeconds());
    // Add timezone offset
    timestamp = timestamp + diff + padding(timezoneOffset / 60) + ':' + padding(timezoneOffset % 60);

    return timestamp;
}
function getParameter(name, queryString) {
    var searchString = queryString || location.search;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]").toLowerCase();
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(searchString);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getViewportDimensions() {
    var viewportwidth;
    var viewportheight;

    if (typeof window.innerWidth !== 'undefined') {
        viewportwidth = window.innerWidth;
        viewportheight = window.innerHeight;
    }
    else if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.clientWidth !=='undefined' && document.documentElement.clientWidth !== 0){
        viewportwidth = document.documentElement.clientWidth;
        viewportheight = document.documentElement.clientHeight;
    }
    else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
        viewportheight = document.getElementsByTagName('body')[0].clientHeight;
    }
    return viewportwidth + 'x' + viewportheight;
}
function checkMandatoryOptions(){
    if(_opt.clientId === undefined || _opt.clientId === null || _opt.clientId === ''){
        return false;
    }
    if(_opt.pageId === undefined || _opt.pageId === null || _opt.pageId === ''){
        return false;
    }
    return true;
}
