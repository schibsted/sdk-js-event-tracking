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
    this.idObj.visitorId = activity.visitorId;
    this.idObj.envId = undefined;
    this.envKey = '_DataTrackerEnv';
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
        environmentId: this.getIdsFromCookie(this.envKey),
        visitorId: this.getIdsFromCookie(this.visitorKey)
    };
    if (cookieId.environmentId === 'undefined') {
        delete cookieId.environmentId;
    }
    if (cookieId.visitorId === 'undefined') {
        delete cookieId.visitorId;
    }

    // Temporary function to delete any old, redundant cookies.
    this.cleanUpCookies();

    cookieId.userId = this.activity.userId;

	this.transferUserData(cookieId);
    var self = this;

	// If no environment ID or no visitorId is found, do request to CIS
	if (!this.idObj.envId || !this.idObj.visitorId) {

		this.getIdsFromService(cookieId, function(err, data) {

			if (err) {
				return callback(err);
			}

			self.transferUserData(data);

			if (typeof self.activity.utils.getQueryVariable('failedToSetCookie') === 'undefined') {
				// If CIS can't find a CIS cookie, do a ping to CIS to see if it was set on last communication
				if (!data.cisCookieSet && self.cookiesAllowed && !self.activity.noRedirect) {
					self.getIdsFromService({ping:'pong'}, function(err, pingData) {
						if (err) {
							callback(err);
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
				}
				callback(null, self.idObj);
			}
			callback(null, self.idObj);
		});
	} else {
		callback(null, self.idObj);
	}
};

/**
 * Function that takes data returned from CIS and sets User parameters and requests creation of cookies.
 */
User.prototype.transferUserData = function(data) {
    this.idObj.userId = data.userId;
    this.idObj.visitorId = data.visitorId;
    this.idObj.envId = data.environmentId;

    if (this.idObj.envId !== null) {
        this.setIdsInCookie();
    }
};

/**
 * Function that returns the value of a cookie with the provided key.
 * Will delete any falsy ur 'undefined' cookies
 *
 * @param {string} searchKey - The key of the cookie.
 * @returns cookie value.
 */
User.prototype.getIdsFromCookie = function(searchKey) {
    var cookie = decodeURIComponent(
        document.cookie.replace(
            new RegExp(
                '(?:(?:^|.*;)\\s*' + encodeURIComponent(searchKey).replace(/[\-\.\+\*]/g, '\\$&'
            ) + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1'
        )
    ) || undefined;
    if (!cookie || cookie === 'undefined') {
        this.deleteCookie(searchKey);
        return;
    }
    return cookie;
};

/**
 * Function that gets an anonymous user ID from the web API
 *
 * @param {string} id - A id from a cookie (optional)
 * @param {function} callback
 */
User.prototype.getIdsFromService = function(id, callback) {
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
 * A function that sets environment and visitor ID in cookies.
 */
User.prototype.setIdsInCookie = function() {

    var now = new Date();
    var time = now.getTime();
    // now should be 15 minutes from now.
    now.setTime(time + 15 * 60 * 1000);
    document.cookie = this.envKey + '=' + this.idObj.envId + ';expires=' + now.toUTCString();
    // now sould be a year from now.
    now.setTime(time + 365 * 24 * 60 * 60 * 1000);
    document.cookie = this.visitorKey + '=' + this.idObj.visitorId + ';expires=' + now.toUTCString();
};

/**
 * Function that deletes a cookie matching the provided key
 *
 * @param {string} cookieKey - key for the cookie to delete.
 */
User.prototype.deleteCookie = function(cookieKey) {
     document.cookie = cookieKey + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

/**
 * Function that removes redundant cookies, temporary, should not be here by the end of September 2015
 */
 User.prototype.cleanUpCookies = function() {
     if (this.getIdsFromCookie('_DataTrackerSession')) {
         this.deleteCookie('_DataTrackerSession');
     }
     if (this.getIdsFromCookie('_DataTrackerUser')) {
         this.deleteCookie('_DataTrackerUser');
     }
 };

module.exports = User;
