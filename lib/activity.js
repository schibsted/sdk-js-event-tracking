'use strict';

var debug = require('debug')('spt:pulse');
var vars = {};
try {
    vars = require('vars');
} catch (err) {
    vars = require('./dev/vars');
}
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

    this.vars = vars;

    if (opts.url) {
        this.url = opts.url;
    } else {
        this.url = this.vars.envVars.dataCollectorUrl;
    }

    if (opts.transport) {
        this.transport = opts.transport;
    } else {
        this.transport = transport;
    }

    this.pageViewId = Utils.getUuidV4();
    this.clientId = opts.clientId;
    this.pageId = opts.pageId;
    this.pageType = opts.pageType || 'Page';
    this.provider = opts.provider || {};
    this.userIdDomain = opts.userIdDomain || 'spid.no';

    this.queue = [];

    this.events = new Events(this);
    this.user = new User(this);

    if (opts.userId) {
        this.userId = opts.userId;
        this.visitorId = opts.visitorId;
    } else {
        var self = this;

        debug('Fetching userId');

        this.user.getUserId(function(err, idObj) {
            if (err) {
                throw new Error('Could not fetch id');
            }

            self.userId = idObj.userId;
            self.envId = idObj.envId;
            self.visitorId = idObj.visitorId;
            self.userId = idObj.userId;

            if (self.waitingToTransmitQueue === true) {
                self.sendQueue();
            }
        });
    }
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

    if (!callback) {
        callback = function() {};
    }

    if (!this.queue.length) {
        return callback();
    }

    if (typeof this.visitorId === 'undefined') {
        this.waitingToTransmitQueue = true;

        return callback();
    }

    debug('Sending queue');

    var queue = this.queue.slice(0);

    for (var i = 0; i < queue.length; i++) {
        this.addUserId(queue[i]);
    }

    this.queue = [];

    var activity = this;

    this.transport(this.url, queue, function(err) {
        if (err) {
            debug('Failed to send queue');

            // Add failed items back into queue
            activity.queue = activity.queue.concat(queue);

            callback(err);
        } else {
            callback();
        }
    });
};

/**
 * Adds user ID to the activity. Used by send and sendQueue functions.
 *
 * @param {object} object
 */
Activity.prototype.addUserId = function(object) {
    if (this.visitorId !== undefined) {
        object.actor['@id'] = 'urn:spid.no:person:' + this.visitorId;
        object.actor['spt:environmentId'] = 'urn:spid.no:environment:' + this.envId;
        object.actor['spt:sessionId'] = 'urn:spid.no:session:' + this.sessionId;
        object.actor['spt:userId'] = 'urn:' + this.userIdDomain + ':user:' + this.userId;
    }
};

/**
 * Send item. If it fails add it to the queue
 *
 * @param {object} object
 * @param {function} callback
 */
Activity.prototype.send = function(object, callback) {
    if (!callback) {
        callback = function() {};
    }

    if (typeof this.visitorId === 'undefined') {
        this.addToQueue(object);
        this.waitingToTransmitQueue = true;

        return callback();
    }

    debug('Sending object');

    var activity = this;

    this.addUserId(object);

    this.transport(this.url, [object], function(err) {
        if (err) {
            debug('Failed to send object');

            activity.addToQueue(object);

            callback(err);
        } else {
            callback();
        }
    });
};

/**
 * Collect actor data and create actor object
 *
 * @returns actor object
 */
Activity.prototype.createActor = function () {
    var actor = {};

    actor['@type'] = 'Person';
    actor['spt:userAgent'] = navigator.userAgent;
    actor['spt:screenSize'] = window.screen.width + 'x' + window.screen.height;
    actor['spt:viewportSize'] = Utils.getViewportDimensions();
    actor['spt:acceptLanguage'] = Utils.getDeviceLanguage();

    return actor;
};

/**
 * Collect provider data and create provider object
 *
 * @returns provider object
 */
Activity.prototype.createProvider = function () {
    var provider = {};

    provider['@type'] = 'Organization';
    provider['@id'] = 'urn:spid.no:' + this.clientId;
    provider.url = document.URL;

    for (var key in this.provider) {
        if (this.provider.hasOwnProperty(key)) {
            provider[key] = this.provider[key];
        }
    }

    return provider;
};

/**
 * Creates the scaffold for the activity object, including actor and provider
 *
 * @returns activity object
 */
Activity.prototype.createScaffold = function () {
    var scaffold = {};

    var contextExtra = {
        spt:'http://spid.no',
        'spt:sdkType': 'JS',
        'spt:sdkVersion': '0.1.0'
    };

    scaffold['@context'] = ['http://www.w3.org/ns/activitystreams', contextExtra];
    scaffold['@id'] = Utils.getUuidV4();
    scaffold['spt:pageViewId'] = this.pageViewId;
    scaffold.published = Utils.getTimestamp();
    scaffold.actor = this.createActor();
    scaffold.provider = this.createProvider();

    return scaffold;
};

/**
 * Function that return a pageViewId
 *
 * @returns {string} pageViewId
 */
Activity.prototype.getPageViewId = function() {
    return this.pageViewId;
};

module.exports = Activity;
