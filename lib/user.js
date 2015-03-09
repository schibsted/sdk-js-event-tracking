'use strict';

var transport = require('./transport/browser');

/**
 * Events constructor
 *
 * @class
 */
function User(activity) {
    this.userId = undefined;
    this.sessionId = undefined;
    this.key = '_DataTrackerUser';
    this.sessionKey = '_DataTrackerSession';

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
    if (this.userId !== undefined) {
        return callback(null, this.userId);
    }

    var cookieId = {
        sessionId: this.getUserIdFromCookie(this.sessionKey),
        environmentId: this.getUserIdFromCookie(this.key)
    };

    var self = this;

    this.getUserIdFromService(cookieId, function(err, data) {
        if (err) {
            return callback(err);
        }

        self.userId = data.environmentId;
        self.sessionId = data.sessionId;

        var temporaryId = false;

        if (data.environmentIdTemporary === true) {
            temporaryId = true;
        }

        self.setUserIdInCookie(temporaryId);

        callback(null, self.userId);
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
    ) || false;
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

    if (!temporary) {
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + 1000000 * 36000;
        now.setTime(expireTime);

        document.cookie = this.key + '=' + this.userId + ';expires=' + now.toGMTString();
    } else {
        document.cookie = this.key + '=' + this.userId;
    }
    document.cookie = this.sessionKey + '=' + this.sessionId;
};

module.exports = User;
