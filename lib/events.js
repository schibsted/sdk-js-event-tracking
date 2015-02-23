'use strict';

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
    this.primaryObj = {};
    this.secondaryObj = {};
    this.tertiaryObj = {};
}

module.exports = Events;

Events.prototype.trackPageLoad = function(title) {

    this.primaryObj = this.addPageStandards('object');
    this.primaryObj.object.displayName = title || document.title;

    return [this.primaryObj];
};

Events.prototype.trackForm = function(formId, contentType) {
    this.primaryObj = this.addPageStandards('object');
    this.secondaryObj = {
        result: {
            '@type':    contentType,
            '@id':      this.pageId + ':form:' + formId
        }
    };

    return [this.primaryObj, this.secondaryObj];
};

Events.prototype.trackComment = function(formId) {
    return this.trackForm(formId, 'Note');
};

Events.prototype.trackPoll = function(formId) {
    return this.trackForm(formId, 'Question');
};

Events.prototype.trackClick = function(elementId, displayName, targetType, targetId) {
    this.primaryObj = {
        object: {
            '@id':          this.pageId + ':element:' + elementId,
            '@type':        'Link',
            displayName:  displayName
        }
    };

    this.secondaryObj = {
        target: {
            '@id':          targetId,
            '@type':        targetType
        }
    };

    return [this.primaryObj, this.secondaryObj];
};

Events.prototype.trackSocial = function(elementId, networkName) {
    this.primaryObj = this.addPageStandards('object');
    this.secondaryObj = {
        origin: {
            '@id':          this.pageId + ':element:' + elementId,
            '@type':        'Link'
        }
    };
    this.tertiaryObj = {
        target: {
            '@id':          'urn:' + networkName,
            '@type':        'Service'
        }
    };

    return [this.primaryObj, this.secondaryObj, this.tertiaryObj];
};

// FIXME: Update doc! Origin object added
Events.prototype.trackMediaState = function(mediaId, mediaType) {
    this.primaryObj = {
        object: {
            '@type': mediaType,
            '@id': mediaId
        }
    };
    this.secondaryObj = this.addPageStandards('origin');

    return [this.primaryObj, this.secondaryObj];
};

Events.prototype.trackScroll = function(scrollDepth) {
    this.primaryObj = this.addPageStandards('object');
    this.secondaryObj = {
        result: {
            '@type': 'Place',
            '@id': this.pageId + ':scroll:' + scrollDepth,
            location: scrollDepth
        }
    };

    return [this.primaryObj, this.secondaryObj];
};

Events.prototype.trackExit = function(targetId, targetType) {
    this.primaryObj = this.addPageStandards('object');
    this.secondaryObj = {
        target: {
            '@type': targetType,
            '@id': targetId
        }
    };

    return [this.primaryObj, this.secondaryObj];
};

// Utilities

Events.prototype.send = function() {
    // TODO: Add code for sending data to activity here.
};

Events.prototype.addProperty = function(obj, property, value) {
    var objKey = '';

    if (obj === 'primary') {
        objKey = Object.keys(this.primaryObj)[0];
        this.primaryObj[objKey][property] = value;
        return true;
    } else if (obj === 'secondary') {
        objKey = Object.keys(this.secondaryObj)[0];
        this.secondaryObj[objKey][property] = value;
        return true;
    } else if (obj === 'tertiary') {
        objKey = Object.keys(this.secondaryObj)[0];
        this.secondaryObj[objKey][property] = value;
        return true;
    } else {
        throw new Error('Object reference not valid');
    }
    return false;
};

Events.prototype.addCustomData = function(obj, data) {
    var objKey = '';

    if (obj === 'primary') {
        objKey = Object.keys(this.primaryObj)[0];
        this.primaryObj[objKey]['spt:custom'] = data;
        return true;
    } else if (obj === 'secondary') {
        objKey = Object.keys(this.secondaryObj)[0];
        this.secondaryObj[objKey]['spt:custom'] = data;
        return true;
    } else if (obj === 'tertiary') {
        objKey = Object.keys(this.secondaryObj)[0];
        this.secondaryObj[objKey]['spt:custom'] = data;
        return true;
    } else {
        throw new Error('Object reference not valid');
    }
    return false;
};

Events.prototype.addPageStandards = function(objType) {
    var container = {};

    container[objType]['@type']         = this.activity.pageType;
    container[objType]['@id']           = this.activity.pageId;
    container[objType].url              = document.URL;
    container[objType].displayName      = document.title;

    return container;
};
