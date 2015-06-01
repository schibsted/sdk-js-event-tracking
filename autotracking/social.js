'use strict';

// TODO: This should be double packed in try/catch

module.exports.trackFacebookLikes = function(activity) {
    FB.Event.subscribe('edge.create', function(targetUrl) {
        var eventObj = activity.events.trackSocial('facebook-like', 'Facebook', 'Like');
        eventObj.addProperty('tertiary', 'url', targetUrl);
        eventObj.send();
    });
};

module.exports.trackFacebookUnlikes = function(activity) {
    FB.Event.subscribe('edge.remove', function(targetUrl) {
        var eventObj = activity.events.trackSocial('facebook-unlike', 'Facebook', 'Remove');
        eventObj.addProperty('tertiary', 'url', targetUrl);
        eventObj.send();
    });
};

module.exports.trackFacebookShares = function(activity) {
    FB.Event.subscribe('message.send', function(targetUrl) {
        var eventObj = activity.events.trackSocial('facebook-share', 'Facebook', 'Share');
        eventObj.addProperty('tertiary', 'url', targetUrl);
        eventObj.send();
    });
};

module.exports.trackTwitterShares = function (activity) {

    function trackTwitter() {
        activity.events.trackSocial('twitter-share', 'Twitter', 'Share').send();
    }
    try {
        twttr.ready(function () {
            if (typeof twttr === undefined) {
                throw 'twitter is not included in the site';
            }
            twttr.events.bind('tweet', trackTwitter);
        });
    } catch (e) {

    }
};
