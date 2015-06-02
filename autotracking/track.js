'use strict';

var activity = {};
var activityOpts = {};
try {
    /* global _opt */
	/* global pulse2opt */
	if (typeof pulse2opt !== 'undefined') {
		activityOpts = pulse2opt;
	} else {
		activityOpts = _opt;
	}
} catch (err) {

}

function initTracking(activityOpts) {
	var throttle = activityOpts.throttle || 1;
	if (Math.random() < throttle) {
		var Activity = require('../lib/activity');
		activity = new Activity(activityOpts);
		if (document.readyState === 'complete') {
			trackingFunctions(activityOpts.trackingFeatures);
		} else {
			window.addEventListener('load', function() {
				trackingFunctions(activityOpts.trackingFeatures);
			}, false);
		}

		return activity.getPageViewId();
	}
}

module.exports.initTracking = function(activityOpts) {
    initTracking(activityOpts);
};

module.exports.getPageViewId = function() {
    return activity.getPageViewId();
};

module.exports.getVisitorId = function() {
    return activity.getVisitorId();
};

module.exports.getSessionId = function() {
    return activity.getSessionId();
};

module.exports.logoutEvent = function() {
    activity.refreshUserIds();
};

module.exports.loginEvent = function(userId) {
    activity.refreshUserIds(userId);
};

module.exports.activity = function() {
    return activity;
};

function trackingFunctions(features) {
	features = features || {};
    var pageEvents = require('./pageLoad');
	if (features.pageLoad !== false) {
		pageEvents.pageLoad(activity);
	}
	if (features.hashChange !== false) {
		pageEvents.hashChange(activity);
	}
	if (features.pageUnload !== false) {
		pageEvents.pageUnload(activity);
	}

    var click = require('./click');
	if (features.clickButton !== false) {
		click.button(activity);
	}
	if (features.clickSubmit !== false) {
		click.submit(activity);
	}

    var scrollT = require('./scroll');
	if (features.relativeScroll !== false) {
		scrollT.trackScrollRelative(activity, 25);
	}
	if (features.itemVisible !== false) {
		scrollT.trackScrollItems(activity);
	}

    var social = require('./social');
	if (features.facebook !== false) {
		social.trackFacebookLikes(activity);
		social.trackFacebookUnlikes(activity);
		social.trackFacebookShares(activity);
	}
	if (features.twitter !== false) {
		social.trackTwitterShares(activity);
	}
}

try {
	initTracking(activityOpts);
} catch (err) {

}
