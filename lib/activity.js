'use strict';

var Events = require('./events');
var Utils = require('./utils');
var User = require('./user');
var transport = require('./transport/browser');

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

    if (opts.url) {
        this.url = opts.url;
    } else {
        this.url = 'http://TODO';
    }

    if (opts.transport) {
        this.transport = opts.transport;
    } else {
        this.transport = transport;
    }

    this.clientId = opts.clientId;
    this.pageId = opts.pageId;
    this.pageType = opts.pageType || 'page';

    this.queue = [];

    this.events = new Events(this);
    this.user = new User();
}

/**
 * Add object to queue
 *
 * @param {object} object
 */
Activity.prototype.addToQueue = function(object) {
    this.queue.push(object);
};

/**
 * Send objects in queue
 *
 * @param {function} callback
 */
Activity.prototype.sendQueue = function(callback) {
    if (!this.queue.length) {
        return callback();
    }

    var queue = this.queue.slice(0);

    this.queue = [];

    var activity = this;

    this.transport(this.url, queue, function(err) {
        if (err) {
            // Add failed items back into queue
            activity.queue = activity.queue.concat(queue);

            callback(err);
        } else {
            callback();
        }
    });
};

/**
 * Send item. If it fails add it to the queue
 *
 * @param {object} object
 * @param {function} callback
 */
Activity.prototype.send = function(object, callback) {
    var activity = this;

    this.transport(this.url, [object], function(err) {
        if (err) {
            activity.addToQueue(object);

            callback(err);
        } else {
            callback();
        }
    });
};

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

module.exports = Activity;
