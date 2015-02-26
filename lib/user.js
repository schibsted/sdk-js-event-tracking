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

User.prototype.getUserIdFromCookie = function() {
    return decodeURIComponent(
        document.cookie.replace(
            new RegExp(
                '(?:(?:^|.*;)\\s*' + encodeURIComponent(this.key).replace(/[\-\.\+\*]/g, '\\$&'
            ) + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1'
        )
    ) || false;
};

User.prototype.getUserIdFromService = function(id, callback) {
    id = id + 1;
    this.transport('http://127.0.0.1:8003/api/v1/identify', { foo: 'bar' }, function(err, data) {
        if (err) {
            return callback(err);
        }

        var response = JSON.parse(data.response);

        callback(null, response.data.sessionId);
    });

    /*response = JSON.parse(data.response);
    console.log(response.data.sessionId);
    return response.data.sessionId;*/

    /*sendData (id, this.idServiceUrl, function(response, data) {
        if (response.status === 200) {
            console.log(data);
            this.userId = data.anonymousId;
            return data.anonymousId;
        }
    });*/
};

User.prototype.setUserIdInCookie = function() {
    document.cookie = this.key + '=' + this.userId;
};

module.exports = User;
