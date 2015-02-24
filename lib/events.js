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

    // Objects used to store event details.
    this.objectOrder = [];

    this.activityObj = this.activity.createScaffold();

    this.ev = {};

}

Events.prototype.trackPageLoad = function(title) {
    this.activityObj.object = this.addPageStandards();
    this.activityObj.object.displayName = title || document.title;

    this.objectOrder = ['object'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

Events.prototype.trackForm = function(formId, contentType) {
    this.activityObj.object = this.addPageStandards();
    this.activityObj.result = {
        '@type':    contentType,
        '@id':      this.pageId + ':form:' + formId
    };

    this.objectOrder = ['object', 'result'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

Events.prototype.trackComment = function(formId) {
    return this.trackForm(formId, 'Note');
};

Events.prototype.trackPoll = function(formId) {
    return this.trackForm(formId, 'Question');
};

Events.prototype.trackClick = function(elementId, displayName, targetType, targetId) {
    this.activityObj.object = {
        '@id':          this.pageId + ':element:' + elementId,
        '@type':        'Link',
        displayName:  displayName
    };

    this.activityObj.target = {
        '@id':          targetId,
        '@type':        targetType
    };

    this.objectOrder = ['object', 'target'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

Events.prototype.trackSocial = function(elementId, networkName) {
    this.activityObj.object = this.addPageStandards();
    this.activityObj.origin = {
        '@id':          this.pageId + ':element:' + elementId,
        '@type':        'Link'
    };
    this.activityObj.target = {
        '@id':          'urn:' + networkName,
        '@type':        'Service'
    };

    this.objectOrder = ['object', 'origin', 'target'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

// FIXME: Update doc! Origin object added
Events.prototype.trackMediaState = function(mediaId, mediaType) {
    this.activityObj.object = {
        '@type': mediaType,
        '@id': mediaId
    };
    this.activityObj.origin = this.addPageStandards();

    this.objectOrder = ['object', 'origin'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

Events.prototype.trackScroll = function(scrollDepth) {
    this.activityObj.object = this.addPageStandards();
    this.activityObj.result = {
        '@type': 'Place',
        '@id': this.pageId + ':scroll:' + scrollDepth,
        location: scrollDepth
    };

    this.objectOrder = ['object', 'result'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

Events.prototype.trackExit = function(targetId, targetType) {
    this.activityObj.object = this.addPageStandards();
    this.activityObj.target = {
            '@type': targetType,
            '@id': targetId
    };

    this.objectOrder = ['object', 'target'];
    this.ev = new EventObj(this.activity, this.activityObj);
    return this.ev;
};

// Utilities

Events.prototype.addProperty = function(obj, property, value) {
    var objKey = this.getObjectKey(obj);

    this.activityObj[objKey][property] = value;

    this.ev.setData(this.activityObj);
    return this.ev;
};

Events.prototype.addCustomData = function(obj, data) {
    var objKey = this.getObjectKey(obj);

    this.activityObj[objKey]['spt:custom'] = data;

    this.ev.setData(this.activityObj);
    return this.ev;
};

Events.prototype.getObjectKey = function(obj) {
    if (obj === 'primary') {
        return this.objectOrder[0];
    } else if (obj === 'secondary') {
        return this.objectOrder[1];
    } else if (obj === 'tertiary') {
        return this.objectOrder[2];
    } else {
        throw new Error('Object reference not valid');
    }
};

Events.prototype.addPageStandards = function() {
    var container = {};

    container['@type']         = this.activity.pageType;
    container['@id']           = this.activity.pageId;
    container.url              = document.URL;
    container.displayName      = document.title;

    return container;
};

module.exports = Events;
