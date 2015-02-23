'use strict';

/**
 * Events constructor
 *
 * @class
 */

function User() {
    this.userId = 1337; // undefined;
    this.key = 'DataTrackerUser';
    this.idServiceUrl = 'http://127.0.0.1:8003/api/v1/identify';
}

module.exports = User;

User.prototype.getUserId = function() {
    if (this.userId !== undefined) {
        return this.userId;
    }

    var cookieID = this.getUserIdFromCookie();
    if (cookieID === false) {
        this.userId = this.getUserIdFromService();
    }
    this.userId = this.getUserIdFromService(/* cookie object */);
    this.setUserIdInCookie();
    return this.userId;
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

User.prototype.getUserIdFromService = function(id) {
    id = id + 1; // TODO: Remove when function is done
    // FIXME: Add new syntax for sending data here
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
