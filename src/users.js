'use strict';

function UserData() {
    return {
        userId:         undefined,
        key:            'DataTrackerUser',
        idServiceUrl:   'http://127.0.0.1:8003/api/v1/identify',

        getUserId: function() {

            if (this.userId !== undefined) {
                console.log('undefined user returned');
                return this.userId;
            }

            var cookieID = this.getUserIdFromCookie();
            if (cookieID === false) {
                // FIXME: Need correct format for in
                this.userId = this.getUserIdFromService();
            }
            this.userId = this.getUserIdFromService(/* cookie object */);
            this.setUserIdInCookie();
            return this.userId;

        },
        getUserIdFromCookie: function() {
            return decodeURIComponent(
                document.cookie.replace(
                    new RegExp(
                        '(?:(?:^|.*;)\\s*' + encodeURIComponent(this.key).replace(/[\-\.\+\*]/g, '\\$&'
                    ) + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1'
                )
            ) || false;
        },
        getUserIdFromService: function(id) {
            sendData (id, this.idServiceUrl, function(response, data) {
                if (response.status === 200) {
                    console.log(data);
                    this.userId = data.anonymousId;
                    return data.anonymousId;
                }
            });
        },
        setUserIdInCookie: function() {
            document.cookie = this.key + '=' + this.userId;
        }
    };
}
