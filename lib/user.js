'use strict';

var transport = require('./transport/browser');

/**
 * Events constructor
 *
 * @class
 */
function User(activity) {
    this.userId = undefined;
    this.key = 'DataTrackerUser';
    this.idServiceUrl = 'http://127.0.0.1:8003/api/v1/identify';

    this.activity = activity;

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

    var cookieId = this.getUserIdFromCookie();

    var self = this;

    this.getUserIdFromService(cookieId, function(err, userId) {
        if (err) {
            return callback(err);
        }

        self.userId = userId;
        self.setUserIdInCookie();

        callback(null, userId);
    });
};

/**
 * Function that returns an anonymous user ID
 *
 * @returns anonymous user ID
 */
User.prototype.getUserIdFromCookie = function() {
    return decodeURIComponent(
        document.cookie.replace(
            new RegExp(
                '(?:(?:^|.*;)\\s*' + encodeURIComponent(this.key).replace(/[\-\.\+\*]/g, '\\$&'
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
    id = id + 1;
    this.transport('http://127.0.0.1:8003/api/v1/identify', { foo: 'bar' }, function(err, data) {
        if (err) {
            return callback(err);
        }

        var response = JSON.parse(data.response);

        callback(null, response.data.sessionId);
    });
};

/**
 * A function that sets the anonymous user ID in a cookie.
 */
User.prototype.setUserIdInCookie = function() {
    document.cookie = this.key + '=' + this.userId;
};

module.exports = User;
