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
    this.cookiesAllowed = navigator.cookieEnabled;

    this.activity = activity;

    this.idServiceUrl = this.activity.vars.envVars.userServiceUrl;

    this.opts = activity.opts;

    if (this.activity.opts.transport) {
        this.transport = this.activity.opts.transport;
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

    var cookieId = {
        sessionId: this.getUserIdFromCookie(this.sessionKey),
        environmentId: this.getUserIdFromCookie(this.envKey),
        userId: this.getUserIdFromCookie(this.userKey)
    };

    var visitorTemp = this.getUserIdFromCookie(this.visitorKey);
    if (visitorTemp !== null && visitorTemp !== 'undefined' && typeof visitorTemp !== undefined) {
        cookieId.visitorId = visitorTemp;
    }

    if (this.activity.loggedIn === false && typeof cookieId.userId !== undefined) {
        cookieId = {
            sessionId: undefined,
            environmentId: undefined,
            userId: undefined,
            visitorId: undefined
        };
        this.transferUserData(cookieId);
    } else if (this.activity.loggedIn && typeof cookieId.userId === undefined) {
        cookieId.userId = this.activity.userId;
        this.transferUserData(cookieId);
    }

    var self = this;

    this.getUserIdFromService(cookieId, function(err, data) {

        if (err) {
            return callback(err);
        }

        self.transferUserData(data);
        if (typeof self.activity.utils.getQueryVariable('failedToSetCookie') === 'undefined') {
            if (!data.cisCookieSet && self.cookiesAllowed && !self.activity.noCisCookie) {
                self.getUserIdFromService({ping:'pong'}, function(err, pingData) {
                    if (err) {
                        callback(err);
                    }
                    self.transferUserData(pingData);
                    if (!pingData.cisCookieSet && self.cookiesAllowed) {

                        var redirectString = 'https://stage-identity.spid.se/redirect';
                        redirectString += '?redirectUrl=' + document.location;

                        window.location.assign(redirectString);
                    }
                    callback(null, self.idObj);
                });
            }
            callback(null, self.idObj);
        }
        callback(null, self.idObj);
    });
};

/**
 * Function that takes data returned from CIS and sets User parameters and requests creation of cookies.
 */
User.prototype.transferUserData = function(data) {
    this.idObj.userId = data.userId;
    this.idObj.sessionId = data.sessionId;
    this.idObj.visitorId = data.visitorId;
    this.idObj.envId = data.environmentId;
    this.idObj.temporaryId = false;

    if (data.environmentIdTemporary === true) {
        this.idObj.temporaryId = true;
    }

    if (this.idObj.envId !== null) {
        this.setUserIdInCookie(this.idObj.temporaryId);
    }
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
    var url = this.activity.opts.userServiceUrl || this.activity.vars.envVars.userServiceUrl;

    var withCredentials = true;
    if (this.activity.noCisCookie) {
        withCredentials = false;
    }

    this.transport(url, id, function(err, data) {

        if (err) {
            return callback(err);
        }

        var response = JSON.parse(data.response || data.responseText);

        callback(null, response.data);
    }, withCredentials);
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
