'use strict';

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
