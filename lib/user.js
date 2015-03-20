'use strict';

var transport = require('./transport/browser');

// TODO: Handle downtime at CIS by generating temporary IDs (if cookies not present).
// TODO: Set temporary flag in actor if fingerprint not unique.

/**
 * Events constructor
 *
 * @class
 */
function User(activity) {
    this.idObj = {};
    this.idObj.userId = activity.userId;
    this.idObj.sessionId = undefined;
    this.idObj.visitorId = activity.visitorId;
    this.idObj.envId = undefined;
    this.envKey = '_DataTrackerEnv';
    this.sessionKey = '_DataTrackerSession';
    this.userKey = '_DataTrackerUser';
    this.visitorKey = '_DataTrackerVisitor';

    this.activity = activity;

    this.idServiceUrl = this.activity.vars.envVars.userServiceUrl;

    this.opts = activity.opts;

    if (this.activity.transport) {
        this.transport = this.activity.transport;
    } else {
        this.transport = transport;
    }
}

/**
 * Function that for getting an anonymous user ID
 *
 * @param {function} callback
 */
User.prototype.getUserId = function(callback) {

    if (this.idObj.visitorId !== undefined) {
        return callback(null, this.visitorId);
    }

    var cookieId = {
        sessionId: this.getUserIdFromCookie(this.sessionKey),
        environmentId: this.getUserIdFromCookie(this.envKey),
        userId: this.getUserIdFromCookie(this.userKey)
    };

    var visitorTemp = this.getUserIdFromCookie(this.visitorKey);
    if (visitorTemp !== null && visitorTemp !== 'undefined' && typeof visitorTemp !== undefined) {
        cookieId.visitorId = visitorTemp;
    }

    console.log('cookie ID');
    console.log(cookieId);

    var self = this;

    this.getUserIdFromService(cookieId, function(err, data) {
        if (err) {
            return callback(err);
        }

        self.idObj.userId = data.userId;
        self.idObj.sessionId = data.sessionId;
        self.idObj.visitorId = data.visitorId;
        self.idObj.envId = data.environmentId;

        var temporaryId = false;

        if (data.environmentIdTemporary === true) {
            temporaryId = true;
        }

        self.setUserIdInCookie(temporaryId);

        callback(null, self.idObj);
    });
};

/**
 * Function that returns an anonymous user ID
 *
 * @returns anonymous user ID
 */
User.prototype.getUserIdFromCookie = function(searchKey) {
    return decodeURIComponent(
        document.cookie.replace(
            new RegExp(
                '(?:(?:^|.*;)\\s*' + encodeURIComponent(searchKey).replace(/[\-\.\+\*]/g, '\\$&'
            ) + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1'
        )
    ) || undefined;
};

/**
 * Function that gets an anonymous user ID from the web API
 *
 * @param {string} id - A id from a cookie (optional)
 * @param {function} callback
 */
User.prototype.getUserIdFromService = function(id, callback) {
    this.transport(this. activity.vars.envVars.userServiceUrl, id, function(err, data) {
        if (err) {
            return callback(err);
        }

        var response = JSON.parse(data.response);

        callback(null, response.data);
    });
};

/**
 * A function that sets the anonymous user ID in a cookie.
 */
User.prototype.setUserIdInCookie = function(temporary) {

    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000000 * 36000;
    now.setTime(expireTime);

    if (!temporary) {
        document.cookie = this.envKey + '=' + this.idObj.envId + ';expires=' + now.toGMTString();
    } else {
        document.cookie = this.envKey + '=' + this.idObj.envId;
    }
    document.cookie = this.sessionKey + '=' + this.idObj.sessionId;
    document.cookie = this.visitorKey + '=' + this.idObj.visitorId + ';expires=' + now.toGMTString();
    document.cookie = this.userKey + '=' + this.idObj.userId + ';expires=' + now.toGMTString();
};

module.exports = User;
