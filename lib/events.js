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
    this.pageId = activity.opts.pageId;
    this.pageType = activity.opt.pageType;
}

module.exports = Events;

Events.prototype.trackPageLoad = function(title) {

    var primaryObj = this.addPageStandards('object');
    primaryObj.object.displayName = title || document.title;

    return [primaryObj];
}

Events.prototype.trackForm = function(formId, contentType) {
    var primaryObj = this.addPageStandards('object');
    var secondaryObj = {
        result: {
            '@type':    contentType,
            '@id':      this.pageId + ':form:' + formId,
        }
    };

    return [primaryObj, secondaryObj];
}

Events.prototype.trackComment = function(formId) {
    return this.trackForm(formId, 'Note');
}

Events.prototype.trackPoll = function(formId) {
    return this.trackForm(formId, 'Question');
}

Events.prototype.trackClick = function(elementId, displayName, targetType, targetId) {
    var primaryObj = {
        object: {
            '@id':          this.pageId + ':element:' + elementId,
            '@type':        'Link',
            'displayName':  displayName
        }
    };

    var secondaryObj = {
        target: {
            '@id':          targetId,
            '@type':        targetType
        }
    };

    return [primaryObj, secondaryObj];
}

Events.prototype.trackSocial = function(elementId, networkName){
    var primaryObj = this.addPageStandards('object');
    var secondaryObj = {
        origin: {
            '@id':          this.pageId + ':element:' + elementId,
            '@type':        'Link'
        }
    };
    var tertiaryObj = {
        target: {
            '@id':          'urn:' + networkName,
            '@type':        'Service'
        }
    };

    return [primaryObj, secondaryObj, tertiaryObj];
}

// FIXME: Update doc! Origin object added
Events.prototype.trackMediaState = function(mediaId, mediaType){
    var primaryObject ={

    }
    var secondaryObj = this.addPageStandards('origin');

    return [primaryObj, secondaryObj];
}

// Utilities

Events.prototype.addPageStandards = function(objType){
    var container = {};

    container[objType]['@type'] = this.activity.opts.pageType;
    container[objType]['@id']   = this.activity.opts.pageId;
    container[objType]['url']   = document.URL;

    return container;
}
