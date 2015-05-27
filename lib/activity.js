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

    this.vars = vars;
    this.clientId = 'urn:schibsted.com:' + opts.clientId;

    if (opts.url) {
        this.url = opts.url + '/' + this.clientId;
    } else {
        this.url = this.vars.envVars.dataCollectorUrl + '/' + this.clientId;
    }

    if (opts.transport) {
        this.transport = opts.transport;
    } else {
        this.transport = transport;
    }

    if (opts.respectDoNotTrack === true) {
        if (navigator.doNotTrack === 1) {
            this.allowTracking = false;
        } else {
            this.allowTracking = true;
        }
    } else {
        this.allowTracking = true;
    }

    this.opts = opts;
    this.pageViewId = Utils.getUuidV4();
    this.pageId = opts.pageId || document.location;
    this.pageType = opts.pageType || 'Page';
    this.provider = opts.provider || {};
    this.userIdDomain = opts.userIdDomain || 'schibsted.com';
	this.noRedirect = true;
    this.utils = Utils;

    this.queue = [];

    this.events = new Events(this);
    this.user = new User(this);

    // Get various IDs:start

    if (opts.visitorId) {
        this.visitorId = opts.visitorId;
    }
    if (opts.userId) {
        this.userId = opts.userId;
        this.loggedIn = true;
    } else {
        this.loggedIn = false;
    }

    this.initIds(function() {});

}

Activity.prototype.initIds = function(callback) {

    callback = callback || function() {};

    var self = this;

    debug('Fetching Ids');

    this.user.getUserId(function(err, idObj) {
        if (err) {
            debug('Failed to fetch userId', err);

            self.visitorId = null;
            self.userId = null;
            self.envId = null;
            self.sessionId = null;
        } else {
            if (!self.visitorId) {
                self.visitorId = idObj.visitorId;
            }

            if (!self.userId) {
                self.userId = idObj.userId;
            }

            self.envId = idObj.envId;
            self.sessionId = idObj.sessionId;
        }

        if (self.waitingToTransmitQueue === true) {
            self.sendQueue();
            self.waitingToTransmitQueue = false;
        }

        return callback(idObj);

    });
};

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

    if (!this.allowTracking) {
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
    if (typeof this.visitorId === 'undefined' || this.visitorId === 'undefined') {
        return;
    }

    if (this.visitorId !== null && String(this.visitorId).indexOf('urn') === -1) {
        object.actor['@id'] = 'urn:schibsted.com:person:' + this.visitorId;
    } else {
        object.actor['@id'] = this.visitorId;
    }

    if (this.envId !== null && String(this.envId).indexOf('urn') === -1) {
        object.actor['spt:environmentId'] = 'urn:schibsted.com:environment:' + this.envId;
    } else {
        object.actor['spt:environmentId'] = this.envId;
    }

    if (this.sessionId !== null && String(this.sessionId).indexOf('urn') === -1) {
        object.actor['spt:sessionId'] = 'urn:schibsted.com:session:' + this.sessionId;
    } else {
        object.actor['spt:sessionId'] = this.sessionId;
    }

    if (this.userId && String(this.userId).indexOf('undefined') === -1) {
        if (String(this.userId).indexOf('urn') === -1){
            object.actor['spt:userId'] = 'urn:' + this.userIdDomain + ':user:' + this.userId;
        } else {
            object.actor['spt:userId'] = this.userId;
        }
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

    if (!this.allowTracking) {
        return callback();
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
 * Collect actor data and create reduced actor object
 *
 * @returns actor object
 */
Activity.prototype.createReducedActor = function () {
    var actor = {};

    actor['@type'] = 'Person';
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
    provider['@id'] = this.clientId;
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
Activity.prototype.createScaffold = function (full) {
    var scaffold = {};

    var contextExtra = {
        spt:'http://schibsted.com',
        'spt:sdkType': 'JS',
        'spt:sdkVersion': '0.3.0'
    };

    scaffold['@context'] = ['http://www.w3.org/ns/activitystreams', contextExtra];
    scaffold['@id'] = Utils.getUuidV4();
    scaffold['spt:pageViewId'] = this.pageViewId;
    scaffold.published = Utils.getTimestamp();
    if (full) {
        scaffold.actor = this.createActor();
    } else {
        scaffold.actor = this.createReducedActor();
    }
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

/**
 * Function that return a sessionId
 *
 * @returns {string} sessionId
 */
Activity.prototype.getSessionId = function() {
    return this.sessionId;
};

/**
 * Function that return a visitorId
 *
 * @returns {string} visitorId
 */
Activity.prototype.getVisitorId = function() {
    return this.visitorId;
};

// TODO: Test better when CIS is ready.
/**
 * Function that resets visitorID and userID. Typically called on login/logout
 *
 * @param {string | undefined} userId - The new userID or undefined on logout.
 */
Activity.prototype.refreshUserIds = function(userId) {
    this.user.idObj.visitorId = undefined;
    this.user.idObj.userId = userId || undefined;
    this.visitorId = undefined;
    this.userId = userId || undefined;

    if (!userId) {
        this.loggedIn = false;
    } else {
        this.loggedIn = true;
    }
    this.user.setUserIdInCookie(false);

    var self = this;

    this.user.getUserId(function(err, idObj) {
        if (err) {
            throw new Error('Could not fetch id');
        }
        if (!self.visitorId || typeof self.visitorId === 'undefined' || self.visitorId === 'undefined') {
            self.visitorId = idObj.visitorId;
        }
        if (!self.userId) {
            self.userId = idObj.userId;
        }
        self.envId = idObj.envId;
        self.sessionId = idObj.sessionId;

        if (self.waitingToTransmitQueue === true) {
            self.sendQueue();
            self.waitingToTransmitQueue = false;
        }
    });
};

module.exports = Activity;
