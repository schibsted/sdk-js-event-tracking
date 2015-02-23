'use strict';

var Events = require('./events');
var Utils = require('./utils');
var User = require('./user');
    // transport = require('./transport/browser');

/**
 * Activity constructor
 *
 * @class
 * @param {object} opts Options
 */
function Activity(opts) {
    if (!opts.clientId) {
        throw new Error('clientId is required');
    }

    if (!opts.pageId) {
        throw new Error('pageId is required');
    }

    this.clientId = opts.clientId;
    this.pageId = opts.pageId;
    this.pageType = opts.pageType || 'page';

    this.activityContainer = {};

    this.events = new Events(this);
    this.user = new User();
}

module.exports = Activity;

Activity.prototype.createActor = function () {
    var actor = {};

    actor['@type'] = 'Person';
    actor['@id'] = this.user.getUserId();
    actor['spt:userAgent'] = navigator.userAgent;
    actor['spt:screenSize'] = window.screen.width + 'x' + window.screen.height;
    actor['spt:viewportSize'] = Utils.getViewportDimensions();
    actor['spt:acceptLanguage'] = Utils.getDeviceLanguage();

    return actor;
};

Activity.prototype.createProvider = function () {

};
