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

	// Get IDs from cookies
    var cookieId = {
        sessionId: this.getUserIdFromCookie(this.sessionKey),
        environmentId: this.getUserIdFromCookie(this.envKey),
        userId: this.activity.opts.userId
    };

    var visitorTemp = this.getUserIdFromCookie(this.visitorKey);
    if (visitorTemp !== null && visitorTemp !== 'undefined' && typeof visitorTemp !== 'undefined') {
        cookieId.visitorId = visitorTemp;
    }

    if (this.activity.loggedIn === false && typeof cookieId.userId !== 'undefined') {
        cookieId = {
            sessionId: undefined,
            environmentId: undefined,
            userId: undefined,
            visitorId: undefined
        };
    } else if (this.activity.loggedIn && typeof cookieId.userId === 'undefined') {
        cookieId.userId = this.activity.userId;
    }

	this.transferUserData(cookieId);
    var self = this;

	// If no session ID is found, do request to CIS
	if (typeof this.idObj.sessionId !== 'undefined') {
		callback(null, self.idObj);
		return
	}
	this.getUserIdFromService(cookieId, function(err, data) {
		if (err) {
			return callback(err);
		}

		self.transferUserData(data);

		// Session ID should just be set after requests.
		self.setSessionIdInCookie();
		if (typeof self.activity.utils.getQueryVariable('failedToSetCookie') !== 'undefined') {
			callback(null, self.idObj);
			return;
		}
		// If CIS can't find a CIS cookie, do a ping to CIS to see if it was set on last communication
		if (data.cisCookieSet || !self.cookiesAllowed || self.activity.noRedirect) {
			callback(null, self.idObj);
		}
		self.getUserIdFromService({ping:'pong'}, function(err, pingData) {
			if (err) {
				callback(err);
				return; // ??
			}
			self.transferUserData(pingData);
			// If CIS cookie is not set, do a redirect (if allowed)
			if (!pingData.cisCookieSet && self.cookiesAllowed) {
				var redirectString = 'https://cis.schibsted.com/redirect/';
				redirectString += '?redirectUrl=' + document.location;

				window.location.assign(redirectString);
			}
			callback(null, self.idObj);
		});
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
    now.setTime(time + 1000000 * 36000);

    if (!temporary) {
        document.cookie = this.envKey + '=' + this.idObj.envId + ';expires=' + now.toGMTString();
    } else {
        document.cookie = this.envKey + '=' + this.idObj.envId;
    }
    document.cookie = this.visitorKey + '=' + this.idObj.visitorId + ';expires=' + now.toGMTString();
    document.cookie = this.userKey + '=' + this.idObj.userId + ';expires=' + now.toGMTString();
};

/*
 * SessionId should last for 15 minutes in cookie.
 */
User.prototype.setSessionIdInCookie = function() {
	var now = new Date();
    var time = now.getTime();
    now.setTime(time + 15 * 60000);
	document.cookie = this.sessionKey + '=' + this.idObj.sessionId + ';expires=' + now.toGMTString();
};

module.exports = User;
