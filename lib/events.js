'use strict';

var EventObj = require('./event');

/**
 * Events constructor
 *
 * @class
 * @param {Activity} activity Activity object
 */
function Events(activity) {
    if (!activity) {
        throw new Error('activity required');
    }

    this.activity = activity;
    this.pageId = activity.pageId;
    this.pageType = activity.pageType;

}

/**
 * Function for tracking a page load
 *
 * @param {string | object} [title=document.title] - Title of the page/article.
 * @param {string} [activityType=Read] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackPageLoad = function(title, activityType) {
    var activityObj = this.activity.createScaffold(true);
    activityObj['@type'] = activityType || 'Read';
    activityObj.object = this.addPageStandards();
    activityObj.object.displayName = title || document.title;
	activityObj.origin = {
		url: document.referrer
	};

    return new EventObj(this.activity, activityObj, ['object', 'origin']);
};

/**
 * Function for tracking a page load
 *
 * @param {string} formId - The ID of the form, must be unique for the page.
 * @param {string} contentType - The type of content that the form generates.
 * @param {string} [activityType=Post] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackForm = function(formId, contentType, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Post';
    activityObj.object = {
        '@id': this.getUrnIdWithPageType() + ':form:' + formId
    };
    activityObj.origin = this.addPageStandards();
    activityObj.result = {
        '@type':    contentType,
        '@id':      this.getUrnIdWithPageType() + ':form:' + formId
    };

    return new EventObj(this.activity, activityObj, ['object', 'result', 'origin']);
};

/**
 * Function for tracking a page load
 *
 * @param {string} formId - The ID of the form, must be unique for the page.
 * @param {string} [activityType=Post] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackComment = function(formId, activityType) {
    return this.trackForm(formId, 'Note', activityType);
};

/**
 * Function for tracking a page load
 *
 * @param {string} formId - The ID of the form, must be unique for the page.
 * @param {string} [activityType=Post] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackPoll = function(formId, activityType) {
    return this.trackForm(formId, 'Question', activityType);
};

/**
 * Function for tracking a page load
 *
 * @param {string} elementId - The ID of the clicked element, must be unique for the page.
 * @param {string} displayName - A human readable text describing the click event.
 * @param {string} targetType - The type of page or action that the click results in.
 * @param {string} targetId - The ID of the target. Must be prefixed with 'urn:<domain>:<page id>:<type>:... etc'
 * @param {string} [activityType=Accept] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackClick = function(elementId, displayName, targetType, targetId, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Accept';
    activityObj.object = {
        '@id':          this.getUrnIdWithPageType(targetId, targetType) + ':element:' + elementId,
        '@type':        'Link',
        displayName:  displayName
    };

    activityObj.target = {
        '@id':          this.getUrnIdWithPageType(targetId, targetType),
        '@type':        targetType
    };

    return new EventObj(this.activity, activityObj, ['object', 'target']);
};

/**
 * Function for tracking a page load
 *
 * @param {string} elementId - The ID of the clicked element, must be unique for the page.
 * @param {string} networkName - The name of the SosMed service (Facebook, Twitter, Pintrest etc).
 * @param {string} [activityType=Like] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackSocial = function(elementId, networkName, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Like';
    activityObj.object = this.addPageStandards();
    activityObj.origin = {
        '@id':          this.getUrnIdWithPageType() + ':element:' + elementId,
        '@type':        'Link'
    };
    activityObj.target = {
        '@id':          'urn:' + networkName.toLowerCase() + ':action:' + activityObj['@type'].toLowerCase(),
        '@type':        'Service'
    };

    return new EventObj(this.activity, activityObj, ['object', 'origin', 'target']);
};

/**
 * Function for tracking a page load
 *
 * @param {string} mediaId - The ID of the media element, must be unique.
 * @param {string} mediaType - ActivityStream 2.0 compatible name of the media element.
 * @param {string} [activityType=Watch] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackMediaState = function(mediaId, mediaType, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Watch';
    activityObj.object = {
        '@type': mediaType,
        '@id': this.getUrnIdWithPageType() + ':' + mediaType + ':' + mediaId
    };
    activityObj.origin = this.addPageStandards();

    return new EventObj(this.activity, activityObj, ['object', 'origin']);
};

/**
 * Function for tracking a page load
 *
 * @param {string} scrollDepth - The relative scroll distance that should be tracked (e.g 25%).
 * @param {string} [activityType=Arrive] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackScroll = function(scrollDepth, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Arrive';
    activityObj.object = this.addPageStandards();
    activityObj.result = {
        '@type': 'Place',
        '@id': this.getUrnIdWithPageType() + ':scroll:' + scrollDepth,
        'spt:depth': scrollDepth
    };

    return new EventObj(this.activity, activityObj, ['object', 'result']);
};

/**
 * Function for tracking when an element is visible in viewport.
 *
 * @param {string} elementId - A unique ID per page/element
 * @param {object | string} time - If string, the time which the element entered
 * the viewport (AS 2.0 approved timestamp). If object {start: <timestamp>, end: <timestamp>}
 * @param {string} [activityType=View] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackVisibility = function(elementId, time, activityType) {
    if (typeof time === 'undefined') {
        throw new Error('No time parameter was passed to this function');
    }
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'View';
    activityObj.origin = this.addPageStandards();
    activityObj.object = {
        '@type': 'Content',
        '@id': this.getUrnIdWithPageType() + ':element:' + elementId
    };
    if (time.start) {
        activityObj.object.startTime = time.start;
    } else if (time && !time.end) {
        activityObj.object.startTime = time;
    }
    if (time.end) {
        activityObj.object.endTime = time.end;
    }

    return new EventObj(this.activity, activityObj, ['origin', 'object']);
};

/**
 * Function for tracking a page load
 *
 * @param {string} targetId - The ID of the target. Must be prefixed with 'urn:<domain>:<page id>:<type>:... etc'
 * @param {string} targetType - The type of page or action that the user is exiting to.
 * @param {string} [activityType=Leave] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackExit = function(targetId, targetType, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Leave';
    activityObj.object = this.addPageStandards();
    activityObj.target = {};

    if (typeof targetId !== 'undefined' && typeof targetType !== 'undefined') {
        activityObj.target = {
                '@type': targetType,
                '@id': this.getUrnIdWithPageType(targetId, targetType)
        };
    }

    return new EventObj(this.activity, activityObj, ['object', 'target']);
};

/**
 * Function for tracking engagement time
 *
 * @param {int} duration - The duration of the engagement in seconds.
 * @param {string} [activityType=View] - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackEngagementTime = function(duration, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'View';
    activityObj.object = this.addPageStandards();
    activityObj.duration = duration;

    return new EventObj(this.activity, activityObj, ['object']);
};

/**
 * Function for tracking any kind of event
 *
 * @param {object} obj - A object of Actvivtystream 2.0 objects (target, object, origin etc)
 * @param {string} activityType - The type of activity that is tracked.
 * @returns {object} Event object
 */
Events.prototype.trackCustomEvent = function(obj, activityType) {
    var activityObj = this.activity.createScaffold();
    var objectOrder = [];
    if (!activityType || !obj) {
        throw new Error('activityType and obj is required');
    }
    activityObj['@type'] = activityType;

    for (var element in obj) {
        activityObj[element] = obj[element];
        objectOrder.push(element);
    }

    return new EventObj(this.activity, activityObj, objectOrder);
};

/**
 * Function for getting standard page properties
 *
 * @returns {object} object of standard page properties
 */
Events.prototype.addPageStandards = function() {
    var container = {};

    container['@type']         = this.activity.pageType;
    if (String(this.activity.pageId).indexOf('urn:') > -1) {
        container['@id']       = this.activity.pageId;
    } else {
        container['@id'] = this.getUrnIdWithPageType(this.activity.pageId);
    }
    container.url              = document.URL;
    container.displayName      = document.title;

    return container;
};

/**
 * Turn a pageId in to a pageId prefixed with urn, domain and pageType
 *
 * @returns {string} A prefixed ID. Or just a id if it allready contains urn.
 */
Events.prototype.getUrnIdWithPageType = function(id, pageType) {
    var useId = id || this.activity.pageId;
    if (String(useId).indexOf('urn:') === -1) {
        var type = pageType || this.activity.pageType;
        var domain = this.getDomainFromUrl(document.URL);
        return 'urn:' + domain + ':' + type.toLowerCase() + ':' + useId;
    } else {
        return useId;
    }
};

/**
 * Function that
 */
Events.prototype.getDomainFromUrl = function(url) {
    var matches = url.match(/^https?\:\/\/(www.)?([^\/:?#]+)(?:[\/:?#]|$)/i);
    return matches && matches[2];
};

module.exports = Events;
