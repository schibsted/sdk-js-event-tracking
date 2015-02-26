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

Events.prototype.trackPageLoad = function(title, activityType) {
    var activityObj = this.activity.createScaffold();
    activityObj['@type'] = activityType || 'Read';
    activityObj.object = this.addPageStandards();
    activityObj.object.displayName = title || document.title;

    return new EventObj(this.activity, activityObj, ['object']);
};

Events.prototype.trackForm = function(formId, contentType) {
    var activityObj = this.activity.createScaffold();
    activityObj.object = this.addPageStandards();
    activityObj.result = {
        '@type':    contentType,
        '@id':      this.pageId + ':form:' + formId
    };

    return new EventObj(this.activity, activityObj, ['object', 'result']);
};

Events.prototype.trackComment = function(formId) {
    return this.trackForm(formId, 'Note');
};

Events.prototype.trackPoll = function(formId) {
    return this.trackForm(formId, 'Question');
};

Events.prototype.trackClick = function(elementId, displayName, targetType, targetId) {
    var activityObj = this.activity.createScaffold();
    activityObj.object = {
        '@id':          this.pageId + ':element:' + elementId,
        '@type':        'Link',
        displayName:  displayName
    };

    activityObj.target = {
        '@id':          targetId,
        '@type':        targetType
    };

    return new EventObj(this.activity, activityObj, ['object', 'target']);
};

Events.prototype.trackSocial = function(elementId, networkName) {
    var activityObj = this.activity.createScaffold();
    activityObj.object = this.addPageStandards();
    activityObj.origin = {
        '@id':          this.pageId + ':element:' + elementId,
        '@type':        'Link'
    };
    activityObj.target = {
        '@id':          'urn:' + networkName,
        '@type':        'Service'
    };

    return new EventObj(this.activity, activityObj, ['object', 'origin', 'target']);
};

// FIXME: Update doc! Origin object added
Events.prototype.trackMediaState = function(mediaId, mediaType) {
    var activityObj = this.activity.createScaffold();
    activityObj.object = {
        '@type': mediaType,
        '@id': mediaId
    };
    activityObj.origin = this.addPageStandards();

    return new EventObj(this.activity, activityObj, ['object', 'origin']);
};

Events.prototype.trackScroll = function(scrollDepth) {
    var activityObj = this.activity.createScaffold();
    activityObj.object = this.addPageStandards();
    activityObj.result = {
        '@type': 'Place',
        '@id': this.pageId + ':scroll:' + scrollDepth,
        location: scrollDepth
    };

    return new EventObj(this.activity, activityObj, ['object', 'result']);
};

Events.prototype.trackExit = function(targetId, targetType) {
    var activityObj = this.activity.createScaffold();
    activityObj.object = this.addPageStandards();
    activityObj.target = {
            '@type': targetType,
            '@id': targetId
    };

    return new EventObj(this.activity, activityObj, ['object', 'target']);
};

// Utilities

Events.prototype.addPageStandards = function() {
    var container = {};

    container['@type']         = this.activity.pageType;
    container['@id']           = this.activity.pageId;
    container.url              = document.URL;
    container.displayName      = document.title;

    return container;
};

module.exports = Events;
