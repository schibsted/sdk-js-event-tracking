(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["AutoTrack"] = factory();
	else
		root["AutoTrack"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
			var Activity = __webpack_require__(1);
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
	    var pageEvents = __webpack_require__(2);
		if (features.pageLoad !== false) {
			pageEvents.pageLoad(activity);
		}
		if (features.hashChange === true) {
			pageEvents.hashChange(activity);
		}
		if (features.pageUnload === true) {
			pageEvents.pageUnload(activity);
		}

	    var click = __webpack_require__(3);
		if (features.clickButton === true) {
			click.button(activity);
		}
		if (features.clickSubmit === true) {
			click.submit(activity);
		}

	    var scrollT = __webpack_require__(4);
		if (features.relativeScroll === true) {
			scrollT.trackScrollRelative(activity, 25);
		}
		if (features.itemVisible === true) {
			scrollT.trackScrollItems(activity);
		}

	    var social = __webpack_require__(5);
		if (features.facebook === true) {
			social.trackFacebookLikes(activity);
			social.trackFacebookUnlikes(activity);
			social.trackFacebookShares(activity);
		}
		if (features.twitter === true) {
			social.trackTwitterShares(activity);
		}
	}

	try {
		initTracking(activityOpts);
	} catch (err) {

	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var debug = __webpack_require__(11)('spt:pulse');
	var vars = {};
	try {
	    vars = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"vars\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	} catch (err) {
	    vars = __webpack_require__(6);
	}
	var Events = __webpack_require__(7);
	var Utils = __webpack_require__(8);
	var User = __webpack_require__(9);
	var transport = __webpack_require__(10);

	/**
	 * Activity constructor
	 *
	 * @class
	 * @param {object} opts Options
	 */
	function Activity(opts) {
	    if (!opts.clientId) {
	        throw new Error('clientId is required');
	    }

	    this.vars = vars;
	    this.clientId = 'urn:schibsted.com:' + opts.clientId;

	    if (opts.url) {
	        this.url = opts.url + '/' + this.clientId;
	    } else {
	        this.url = this.vars.envVars.dataCollectorUrl + '/' + this.clientId;
	    }

	    if (opts.transport) {
	        this.transport = opts.transport;
	    } else {
	        this.transport = transport;
	    }

	    if (opts.respectDoNotTrack === true) {
	        if (navigator.doNotTrack === 1) {
	            this.allowTracking = false;
	        } else {
	            this.allowTracking = true;
	        }
	    } else {
	        this.allowTracking = true;
	    }

	    this.opts = opts;
	    this.pageViewId = Utils.getUuidV4();
	    this.pageId = opts.pageId || document.location;
	    this.pageType = opts.pageType || 'Page';
	    this.provider = opts.provider || {};
	    this.userIdDomain = opts.userIdDomain || 'schibsted.com';
		this.noRedirect = true;
	    this.utils = Utils;

	    this.queue = [];

	    this.events = new Events(this);
	    this.user = new User(this);

	    // Get various IDs:start

	    if (opts.visitorId) {
	        this.visitorId = opts.visitorId;
	    }
	    if (opts.userId) {
	        this.userId = opts.userId;
	        this.loggedIn = true;
	    } else {
	        this.loggedIn = false;
	    }

	    this.initIds(function() {});

	}

	Activity.prototype.initIds = function(callback) {

	    callback = callback || function() {};

	    var self = this;

	    debug('Fetching Ids');

	    this.user.getUserId(function(err, idObj) {
	        if (err) {
	            debug('Failed to fetch userId', err);

	            self.visitorId = null;
	            self.userId = null;
	            self.envId = null;
	            self.sessionId = null;
	        } else {
	            if (!self.visitorId) {
	                self.visitorId = idObj.visitorId;
	            }

	            if (!self.userId) {
	                self.userId = idObj.userId;
	            }

	            self.envId = idObj.envId;
	            self.sessionId = idObj.sessionId;
	        }

	        if (self.waitingToTransmitQueue === true) {
	            self.sendQueue();
	            self.waitingToTransmitQueue = false;
	        }

	        return callback(idObj);

	    });
	};

	/**
	 * Add object to queue
	 *
	 * @param {object} object
	 */
	Activity.prototype.addToQueue = function(object) {
	    this.queue.push(object);
	};

	/**
	 * Send objects in queue
	 *
	 * @param {function} callback
	 */
	Activity.prototype.sendQueue = function(callback) {

	    if (!callback) {
	        callback = function() {};
	    }

	    if (!this.queue.length) {
	        return callback();
	    }

	    if (!this.allowTracking) {
	        return callback();
	    }

	    if (typeof this.visitorId === 'undefined') {
	        this.waitingToTransmitQueue = true;

	        return callback();
	    }

	    debug('Sending queue');

	    var queue = this.queue.slice(0);

	    for (var i = 0; i < queue.length; i++) {
	        this.addUserId(queue[i]);
	    }

	    this.queue = [];

	    var activity = this;

	    this.transport(this.url, queue, function(err) {
	        if (err) {
	            debug('Failed to send queue');

	            // Add failed items back into queue
	            activity.queue = activity.queue.concat(queue);

	            callback(err);
	        } else {
	            callback();
	        }
	    });
	};

	/**
	 * Adds user ID to the activity. Used by send and sendQueue functions.
	 *
	 * @param {object} object
	 */
	Activity.prototype.addUserId = function(object) {
	    if (typeof this.visitorId === 'undefined' || this.visitorId === 'undefined') {
	        return;
	    }

	    if (this.visitorId !== null && String(this.visitorId).indexOf('urn') === -1) {
	        object.actor['@id'] = 'urn:schibsted.com:person:' + this.visitorId;
	    } else {
	        object.actor['@id'] = this.visitorId;
	    }

	    if (this.envId !== null && String(this.envId).indexOf('urn') === -1) {
	        object.actor['spt:environmentId'] = 'urn:schibsted.com:environment:' + this.envId;
	    } else {
	        object.actor['spt:environmentId'] = this.envId;
	    }

	    if (this.sessionId !== null && String(this.sessionId).indexOf('urn') === -1) {
	        object.actor['spt:sessionId'] = 'urn:schibsted.com:session:' + this.sessionId;
	    } else {
	        object.actor['spt:sessionId'] = this.sessionId;
	    }

	    if (this.userId && String(this.userId).indexOf('undefined') === -1) {
	        if (String(this.userId).indexOf('urn') === -1){
	            object.actor['spt:userId'] = 'urn:' + this.userIdDomain + ':user:' + this.userId;
	        } else {
	            object.actor['spt:userId'] = this.userId;
	        }
	    }
	};

	/**
	 * Send item. If it fails add it to the queue
	 *
	 * @param {object} object
	 * @param {function} callback
	 */
	Activity.prototype.send = function(object, callback) {
	    if (!callback) {
	        callback = function() {};
	    }

	    if (!this.allowTracking) {
	        return callback();
	    }

	    if (typeof this.visitorId === 'undefined') {
	        this.addToQueue(object);
	        this.waitingToTransmitQueue = true;

	        return callback();
	    }

	    debug('Sending object');

	    var activity = this;

	    this.addUserId(object);

	    this.transport(this.url, [object], function(err) {
	        if (err) {
	            debug('Failed to send object');

	            activity.addToQueue(object);

	            callback(err);
	        } else {
	            callback();
	        }
	    });
	};

	/**
	 * Collect actor data and create actor object
	 *
	 * @returns actor object
	 */
	Activity.prototype.createActor = function () {
	    var actor = {};

	    actor['@type'] = 'Person';
	    actor['spt:userAgent'] = navigator.userAgent;
	    actor['spt:screenSize'] = window.screen.width + 'x' + window.screen.height;
	    actor['spt:viewportSize'] = Utils.getViewportDimensions();
	    actor['spt:acceptLanguage'] = Utils.getDeviceLanguage();

	    return actor;
	};

	/**
	 * Collect actor data and create reduced actor object
	 *
	 * @returns actor object
	 */
	Activity.prototype.createReducedActor = function () {
	    var actor = {};

	    actor['@type'] = 'Person';
	    return actor;
	};

	/**
	 * Collect provider data and create provider object
	 *
	 * @returns provider object
	 */
	Activity.prototype.createProvider = function () {
	    var provider = {};

	    provider['@type'] = 'Organization';
	    provider['@id'] = this.clientId;
	    provider.url = document.URL;

	    for (var key in this.provider) {
	        if (this.provider.hasOwnProperty(key)) {
	            provider[key] = this.provider[key];
	        }
	    }

	    return provider;
	};

	/**
	 * Creates the scaffold for the activity object, including actor and provider
	 *
	 * @returns activity object
	 */
	Activity.prototype.createScaffold = function (full) {
	    var scaffold = {};

	    var contextExtra = {
	        spt:'http://schibsted.com',
	        'spt:sdkType': 'JS',
	        'spt:sdkVersion': '0.3.0'
	    };

	    scaffold['@context'] = ['http://www.w3.org/ns/activitystreams', contextExtra];
	    scaffold['@id'] = Utils.getUuidV4();
	    scaffold['spt:pageViewId'] = this.pageViewId;
	    scaffold.published = Utils.getTimestamp();
	    if (full) {
	        scaffold.actor = this.createActor();
	    } else {
	        scaffold.actor = this.createReducedActor();
	    }
	    scaffold.provider = this.createProvider();

	    return scaffold;
	};

	/**
	 * Function that return a pageViewId
	 *
	 * @returns {string} pageViewId
	 */
	Activity.prototype.getPageViewId = function() {
	    return this.pageViewId;
	};

	/**
	 * Function that return a sessionId
	 *
	 * @returns {string} sessionId
	 */
	Activity.prototype.getSessionId = function() {
	    return this.sessionId;
	};

	/**
	 * Function that return a visitorId
	 *
	 * @returns {string} visitorId
	 */
	Activity.prototype.getVisitorId = function() {
	    return this.visitorId;
	};

	// TODO: Test better when CIS is ready.
	/**
	 * Function that resets visitorID and userID. Typically called on login/logout
	 *
	 * @param {string | undefined} userId - The new userID or undefined on logout.
	 */
	Activity.prototype.refreshUserIds = function(userId) {
	    this.user.idObj.visitorId = undefined;
	    this.user.idObj.userId = userId || undefined;
	    this.visitorId = undefined;
	    this.userId = userId || undefined;

	    if (!userId) {
	        this.loggedIn = false;
	    } else {
	        this.loggedIn = true;
	    }
	    this.user.setUserIdInCookie(false);

	    var self = this;

	    this.user.getUserId(function(err, idObj) {
	        if (err) {
	            throw new Error('Could not fetch id');
	        }
	        if (!self.visitorId || typeof self.visitorId === 'undefined' || self.visitorId === 'undefined') {
	            self.visitorId = idObj.visitorId;
	        }
	        if (!self.userId) {
	            self.userId = idObj.userId;
	        }
	        self.envId = idObj.envId;
	        self.sessionId = idObj.sessionId;

	        if (self.waitingToTransmitQueue === true) {
	            self.sendQueue();
	            self.waitingToTransmitQueue = false;
	        }
	    });
	};

	module.exports = Activity;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports.pageLoad = function(activity) {
	    var pageload = activity.events.trackPageLoad();
	    appendPageMeta(pageload);
	    pageload.send();

	    function appendPageMeta(pageload) {
	        var metas = document.getElementsByTagName('meta');
	        var metaObject = {};
	        var ogObject = {};
	        var ogFlag = false;
	        var metaFlag = false;

	        for (var i = 0; i < metas.length; i++) {
	            var meta = metas[i];
	            if (meta.getAttribute('name') && meta.getAttribute('content')) {
	                metaObject['spt:' + meta.getAttribute('name')] = decodeURI(meta.getAttribute('content'));
	                metaFlag = true;
	            } else if (meta.getAttribute('property') && meta.getAttribute('content')) {
	                var prop = meta.getAttribute('property');
	                if (prop.indexOf('og:') > -1) {
	                    ogObject['spt:' + prop] = decodeURI(meta.getAttribute('content'));
	                    ogFlag = true;
	                }
	            }
	        }

	        if (ogFlag) {
	            pageload.addProperty('primary', 'spt:og', ogObject);
	        }
	        if (metaFlag) {
	            pageload.addProperty('primary', 'spt:meta', metaObject);
	        }
	    }
	};

	module.exports.hashChange = function(activity) {
	    document.addEventListener('hashchange', function() {
	        activity.events.trackPageLoad().send();
	    }, false);
	};

	module.exports.pageUnload = function(activity) {

	    var pageEnterTime = Date.now();
	    var unloadFlag = false;

	    document.addEventListener('click', function(e) {
	        if (!unloadFlag) {
	            unloadFlag = true;
	            var element = e.target;
	            if (element.tagName.toLowerCase() === 'a') {
	                var href = element.getAttribute('href');
	                var urlPattern = /^https?:\/\//i;
	                if (href.match(urlPattern) !== null) {
	                    activity.events.trackEngagementTime(Date.now() - pageEnterTime).queue();
	                    var exit = activity.events.trackExit('urn:exit:' + href, 'Page');
	                    exit.addProperty('secondary', 'url', href);
	                    exit.queue();
	                    activity.sendQueue();
	                }
	            }
	        }
	    }, false);

	    window.addEventListener('beforeunload', function() {
	        if (!unloadFlag) {
	            unloadFlag = true;
	            activity.events.trackEngagementTime(Date.now() - pageEnterTime).queue();
	            activity.events.trackExit().queue();
	            activity.sendQueue();
	        }
	    });

	    window.addEventListener('unload', function() {
	        if (!unloadFlag) {
	            unloadFlag = true;
	            activity.events.trackEngagementTime(Date.now() - pageEnterTime).queue();
	            activity.events.trackExit().queue();
	            activity.sendQueue();
	        }
	    }, false);
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports.button = function(activity) {
	    document.addEventListener('click', function(e) {
	        e = e || window.event;
	        var target = e.target || e.srcElement;

	        if (/.*track-click.*/.test(target.className)) {
	            activity.events.trackClick(target.id).send();
	        }

	    }, false);

	};

	module.exports.submit = function(activity) {

	    document.addEventListener('submit', function(e) {
	        var target = e.target || e.srcElement;
	        var result = searchTrackingClass(target);

	        if (result === null) {
	            return;
	        } else if (!result.obj.id) {
	            return;
	        } else if (result.type === 'track-form') {
	            activity.events.trackForm(result.obj.id, 'Note', 'Post').send();
	        } else if (result.type === 'track-comment') {
	            activity.events.trackComment(result.obj.id, 'Post').send();
	        } else if (result.type === 'track-poll') {
	            activity.events.trackPoll(result.obj.id, 'Post').send();
	        }

	        function searchTrackingClass(elem) {
	            if (elem.className.indexOf('track-comment') > -1) {
	                return {obj: elem, type: 'track-comment'};
	            } else if (elem.className.indexOf('track-poll') > -1) {
	                return {obj: elem, type: 'track-poll'};
	            } else {
	                return {obj: elem, type: 'track-form'};
	            }
	        }
	    }, false);
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports.trackScrollRelative = function(activity, interval) {

	    var lastRelative = 0;

	    document.addEventListener('scroll', function() {
	        var body = document.getElementsByTagName('body')[0];

	        var relative = body.scrollTop / (body.offsetHeight - window.innerHeight) * 100;

	        if (relative - lastRelative > interval * 1.5) {
	            lastRelative = Math.floor(relative / interval) * interval;
	        }

	        if (relative >= lastRelative + interval) {
	            lastRelative = lastRelative + interval;

	            activity.events.trackScroll(lastRelative, 'Arrive').send();

	            if (lastRelative > 100) {
	                lastRelative = 100;
	            }
	        } else if (relative <= lastRelative - interval) {
	            lastRelative = lastRelative - interval;

	            activity.events.trackScroll(lastRelative, 'Arrive').send();

	            if (lastRelative > 100) {
	                lastRelative = 100;
	            }
	        }
	    }, false);
	};

	module.exports.trackScrollItems = function(activity) {
	    var followElements = [];
	    var elems = document.getElementsByTagName('*'), i;
	    for (i = 0; i < elems.length; i++) {

	        if ((' ' + elems[i].className + ' ').indexOf(' ' + 'track-visibility' + ' ') > -1) {
	            followElements.push({
	                element: elems[i],
	                visible: false
	            });
	        }
	    }
	    document.addEventListener('scroll', function () {
	        for (i = 0; i < followElements.length; i++) {
	            var elem = followElements[i];
	            if (elementIsVisible(elem.element) !== elem.visible) {
	                if (elem.visible === false) {
	                    elem.visible = true;
	                    elem.timeStart = activity.utils.getTimestamp();

	                    activity.events.trackVisibility(elem.element.id, elem.timeStart).send();

	                } else if (elem.visible === true) {
	                    elem.visible = false;

	                    var time = {start: elem.timeStart, end: activity.utils.getTimestamp()};

	                    activity.events.trackVisibility(elem.element.id, time).send();

	                    elem.timeStart = null;
	                }
	            }
	        }
	    }, false);
	    function elementIsVisible(el) {
	        var top = el.offsetTop;
	        var left = el.offsetLeft;
	        var width = el.offsetWidth;
	        var height = el.offsetHeight;

	        while (el.offsetParent) {
	            el = el.offsetParent;
	            top += el.offsetTop;
	            left += el.offsetLeft;
	        }

	        return (
	            top < (window.pageYOffset + window.innerHeight) &&
	            left < (window.pageXOffset + window.innerWidth) &&
	            (top + height) > window.pageYOffset &&
	            (left + width) > window.pageXOffset
	        );
	    }

	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports.envVars = {
	    dataCollectorUrl: 'http://127.0.0.1:8002/api/v1/track',
	    userServiceUrl: 'https://cis.schibsted.com/api/v1/identify',
	    errorReportingUrl: '',
	    sdkVersion: '0.3.0'
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventObj = __webpack_require__(12);

	/**
	 * Events constructor
	 *
	 * @class
	 * @param {Activity} activity Activity object
	 */
	function Events(activity) {
	    if (!activity) {
	        throw new Error('activity required');
	    }

	    this.activity = activity;
	    this.pageId = activity.pageId;
	    this.pageType = activity.pageType;

	}

	/**
	 * Function for tracking a page load
	 *
	 * @param {string | object} [title=document.title] - Title of the page/article.
	 * @param {string} [activityType=Read] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackPageLoad = function(title, activityType) {
		var activityObj = this.activity.createScaffold(true);
		activityObj['@type'] = activityType || 'Read';
		activityObj.object = this.addPageStandards();
		activityObj.object.displayName = title || document.title;
		if (document.referrer) {
			activityObj.origin = {
				url: document.referrer
			};
		}

		return new EventObj(this.activity, activityObj, ['object', 'origin']);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} formId - The ID of the form, must be unique for the page.
	 * @param {string} contentType - The type of content that the form generates.
	 * @param {string} [activityType=Post] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackForm = function(formId, contentType, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'Post';
	    activityObj.object = {
	        '@id': this.getUrnIdWithPageType() + ':form:' + formId
	    };
	    activityObj.origin = this.addPageStandards();
	    activityObj.result = {
	        '@type':    contentType,
	        '@id':      this.getUrnIdWithPageType() + ':form:' + formId
	    };

	    return new EventObj(this.activity, activityObj, ['object', 'result', 'origin']);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} formId - The ID of the form, must be unique for the page.
	 * @param {string} [activityType=Post] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackComment = function(formId, activityType) {
	    return this.trackForm(formId, 'Note', activityType);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} formId - The ID of the form, must be unique for the page.
	 * @param {string} [activityType=Post] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackPoll = function(formId, activityType) {
	    return this.trackForm(formId, 'Question', activityType);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} elementId - The ID of the clicked element, must be unique for the page.
	 * @param {string} displayName - A human readable text describing the click event.
	 * @param {string} targetType - The type of page or action that the click results in.
	 * @param {string} targetId - The ID of the target. Must be prefixed with 'urn:<domain>:<page id>:<type>:... etc'
	 * @param {string} [activityType=Accept] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackClick = function(elementId, displayName, targetType, targetId, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'Accept';
	    activityObj.object = {
	        '@id':          this.getUrnIdWithPageType(targetId, targetType) + ':element:' + elementId,
	        '@type':        'Link',
	        displayName:  displayName
	    };

	    activityObj.target = {
	        '@id':          this.getUrnIdWithPageType(targetId, targetType),
	        '@type':        targetType
	    };

	    return new EventObj(this.activity, activityObj, ['object', 'target']);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} elementId - The ID of the clicked element, must be unique for the page.
	 * @param {string} networkName - The name of the SosMed service (Facebook, Twitter, Pintrest etc).
	 * @param {string} [activityType=Like] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackSocial = function(elementId, networkName, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'Like';
	    activityObj.object = this.addPageStandards();
	    activityObj.origin = {
	        '@id':          this.getUrnIdWithPageType() + ':element:' + elementId,
	        '@type':        'Link'
	    };
	    activityObj.target = {
	        '@id':          'urn:' + networkName.toLowerCase() + ':action:' + activityObj['@type'].toLowerCase(),
	        '@type':        'Service'
	    };

	    return new EventObj(this.activity, activityObj, ['object', 'origin', 'target']);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} mediaId - The ID of the media element, must be unique.
	 * @param {string} mediaType - ActivityStream 2.0 compatible name of the media element.
	 * @param {string} [activityType=Watch] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackMediaState = function(mediaId, mediaType, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'Watch';
	    activityObj.object = {
	        '@type': mediaType,
	        '@id': this.getUrnIdWithPageType() + ':' + mediaType + ':' + mediaId
	    };
	    activityObj.origin = this.addPageStandards();

	    return new EventObj(this.activity, activityObj, ['object', 'origin']);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} scrollDepth - The relative scroll distance that should be tracked (e.g 25%).
	 * @param {string} [activityType=Arrive] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackScroll = function(scrollDepth, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'Arrive';
	    activityObj.object = this.addPageStandards();
	    activityObj.result = {
	        '@type': 'Place',
	        '@id': this.getUrnIdWithPageType() + ':scroll:' + scrollDepth,
	        'spt:depth': scrollDepth
	    };

	    return new EventObj(this.activity, activityObj, ['object', 'result']);
	};

	/**
	 * Function for tracking when an element is visible in viewport.
	 *
	 * @param {string} elementId - A unique ID per page/element
	 * @param {object | string} time - If string, the time which the element entered
	 * the viewport (AS 2.0 approved timestamp). If object {start: <timestamp>, end: <timestamp>}
	 * @param {string} [activityType=View] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackVisibility = function(elementId, time, activityType) {
	    if (typeof time === 'undefined') {
	        throw new Error('No time parameter was passed to this function');
	    }
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'View';
	    activityObj.origin = this.addPageStandards();
	    activityObj.object = {
	        '@type': 'Content',
	        '@id': this.getUrnIdWithPageType() + ':element:' + elementId
	    };
	    if (time.start) {
	        activityObj.object.startTime = time.start;
	    } else if (time && !time.end) {
	        activityObj.object.startTime = time;
	    }
	    if (time.end) {
	        activityObj.object.endTime = time.end;
	    }

	    return new EventObj(this.activity, activityObj, ['origin', 'object']);
	};

	/**
	 * Function for tracking a page load
	 *
	 * @param {string} targetId - The ID of the target. Must be prefixed with 'urn:<domain>:<page id>:<type>:... etc'
	 * @param {string} targetType - The type of page or action that the user is exiting to.
	 * @param {string} [activityType=Leave] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackExit = function(targetId, targetType, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'Leave';
	    activityObj.object = this.addPageStandards();
	    activityObj.target = {};

	    if (typeof targetId !== 'undefined' && typeof targetType !== 'undefined') {
	        activityObj.target = {
	                '@type': targetType,
	                '@id': this.getUrnIdWithPageType(targetId, targetType)
	        };
	    }

	    return new EventObj(this.activity, activityObj, ['object', 'target']);
	};

	/**
	 * Function for tracking engagement time
	 *
	 * @param {int} duration - The duration of the engagement in seconds.
	 * @param {string} [activityType=View] - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackEngagementTime = function(duration, activityType) {
	    var activityObj = this.activity.createScaffold();
	    activityObj['@type'] = activityType || 'View';
	    activityObj.object = this.addPageStandards();
	    activityObj.duration = duration;

	    return new EventObj(this.activity, activityObj, ['object']);
	};

	/**
	 * Function for tracking any kind of event
	 *
	 * @param {object} obj - A object of Actvivtystream 2.0 objects (target, object, origin etc)
	 * @param {string} activityType - The type of activity that is tracked.
	 * @returns {object} Event object
	 */
	Events.prototype.trackCustomEvent = function(obj, activityType) {
	    var activityObj = this.activity.createScaffold();
	    var objectOrder = [];
	    if (!activityType || !obj) {
	        throw new Error('activityType and obj is required');
	    }
	    activityObj['@type'] = activityType;

	    for (var element in obj) {
	        activityObj[element] = obj[element];
	        objectOrder.push(element);
	    }

	    return new EventObj(this.activity, activityObj, objectOrder);
	};

	/**
	 * Function for getting standard page properties
	 *
	 * @returns {object} object of standard page properties
	 */
	Events.prototype.addPageStandards = function() {
	    var container = {};

	    container['@type']         = this.activity.pageType;
	    if (String(this.activity.pageId).indexOf('urn:') > -1) {
	        container['@id']       = this.activity.pageId;
	    } else {
	        container['@id'] = this.getUrnIdWithPageType(this.activity.pageId);
	    }
	    container.url              = document.URL;
	    container.displayName      = document.title;

	    return container;
	};

	/**
	 * Turn a pageId in to a pageId prefixed with urn, domain and pageType
	 *
	 * @returns {string} A prefixed ID. Or just a id if it allready contains urn.
	 */
	Events.prototype.getUrnIdWithPageType = function(id, pageType) {
	    var useId = id || this.activity.pageId;
	    if (String(useId).indexOf('urn:') === -1) {
	        var type = pageType || this.activity.pageType;
	        var domain = this.getDomainFromUrl(document.URL);
	        return 'urn:' + domain + ':' + type.toLowerCase() + ':' + useId;
	    } else {
	        return useId;
	    }
	};

	/**
	 * Function that
	 */
	Events.prototype.getDomainFromUrl = function(url) {
	    var matches = url.match(/^https?\:\/\/(www.)?([^\/:?#]+)(?:[\/:?#]|$)/i);
	    return matches && matches[2];
	};

	module.exports = Events;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var vars = {};
	try {
	    vars = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"vars\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	} catch (err) {
	    vars = __webpack_require__(6);
	}
	var transport = __webpack_require__(10);

	/**
	 * Retry given task n-times
	 *
	 * @param {int} times
	 * @param {function} task
	 * @param {function} callback
	 */
	module.exports.retry = function(times, task, callback) {
	    if (!times || typeof times !== 'number') {
	        throw new Error('times required');
	    }

	    if (!task || typeof task !== 'function') {
	        throw new Error('task required');
	    }

	    if (!callback || typeof callback !== 'function') {
	        throw new Error('callback required');
	    }

	    var attempts = 1;

	    var taskCallback = function() {
	        if (arguments[0] && attempts >= times) {
	            // TODO: Error reporting should be triggered here.
	            callback.apply(null, arguments);
	        } else if (arguments[0]) {
	            attempts += 1;

	            task(taskCallback);
	        } else {
	            callback.apply(null, arguments);
	        }
	    };

	    task(taskCallback);
	};

	/**
	 * Function for getting the viewport dimensions of a browser
	 *
	 * @returns {string} viewport dimensions in format (h)hhhx(w)www
	 */
	module.exports.getViewportDimensions = function() {
	    var viewportwidth;
	    var viewportheight;

	    if (typeof window.innerWidth !== 'undefined') {
	        viewportwidth = window.innerWidth;
	        viewportheight = window.innerHeight;
	    } else if (
	        typeof document.documentElement.clientWidth !== 'undefined' && document.documentElement.clientWidth !== 0) {
	        viewportwidth = document.documentElement.clientWidth;
	        viewportheight = document.documentElement.clientHeight;
	    } else {
	        viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
	        viewportheight = document.getElementsByTagName('body')[0].clientHeight;
	    }
	    return viewportwidth + 'x' + viewportheight;
	};

	/**
	 * Function for getting device language
	 *
	 * @returns {string} the device language of the users browser
	 */
	module.exports.getDeviceLanguage = function() {
	    var userLanguage;

	    if (navigator.userLanguage){
	        userLanguage = navigator.userLanguage;
	    } else if (navigator.language){
	        userLanguage = navigator.language;
	    }

	    return userLanguage;
	};

	/**
	 * Function that returns an activitystream 2.0 compatible timestamp
	 *
	 * @returns {string} in format YYYY-MM-DDTHH:mm:ss(+/-)HH:mm
	 */
	module.exports.getTimestamp = function() {
	    var now = new Date(),
	    timezoneOffset = -now.getTimezoneOffset(),
	    diff = timezoneOffset >= 0 ? '+' : '-',
	    padding = function(num) {
	        var norm = Math.abs(Math.floor(num));
	        return (norm < 10 ? '0' : '') + norm;
	    };
	    var timestamp = now.getFullYear() + '-' + padding(now.getMonth() + 1) + '-' + padding(now.getDate());
	    timestamp = timestamp + 'T' + padding(now.getHours()) + ':' + padding(now.getMinutes());
	    timestamp = timestamp + ':' + padding(now.getSeconds());
	    timestamp = timestamp + diff + padding(timezoneOffset / 60) + ':' + padding(timezoneOffset % 60);

	    return timestamp;
	};

	/**
	 * Function that generates a UUID v4
	 *
	 * @returns {string} in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
	 */
	module.exports.getUuidV4 = function() {
	    var uuid = '';

	    for (var i = 0; i < 36; i++) {
	        var numb = null;

	        if (i === 14) {
	            numb = 4;
	        } else if (i === 19) {
	            numb = Math.floor((Math.random() * 4) + 8).toString(16);
	        } else if (i === 8 || i === 13 || i === 18 || i === 23) {
	            numb = '-';
	        } else {
	            numb = Math.floor((Math.random() * 16)).toString(16);
	        }

	        uuid += numb;
	    }

	    return uuid;
	};

	module.exports.sendErrorReport = function(times) {
	    var errorObject = {
	        errorCode: 'GENERAL_ACTIVITY_ERROR',
	        errorMessage: 'Something went wrong',
	        sdkType: 'JS',
	        sdkVersion: vars.envVars.sdkVersion,
	        options: {
	            clientId: 'abc',
	            dataCollectorUrl: vars.envVars.dataCollectorUrl,
	            anonymousIdentityUrl: vars.envVars.userServiceUrl,
	            errorReportingUrl: vars.envVars.errorReportingUrl,
	            retries: times
	        }
	    };

	    transport(vars.envVars.errorReportingUrl, errorObject);

	};

	module.exports.getQueryVariable = function(variable) {
	    var query = window.location.search.substring(1);
	    var vars = query.split('&');
	    for (var i = 0; i < vars.length; i++) {
	        var pair = vars[i].split('=');
	        if (pair[0] === variable) {
	            return pair[1];
	        }
	    }
		vars = query.split('&amp');
	    for (i = 0; i < vars.length; i++) {
	        var pair2 = vars[i].split('=');
	        if (pair2[0] === variable) {
	            return pair2[1];
	        }
	    }
	    return undefined;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var transport = __webpack_require__(10);

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
		if (typeof this.idObj.sessionId === 'undefined') {

			this.getUserIdFromService(cookieId, function(err, data) {

				if (err) {
					return callback(err);
				}

				self.transferUserData(data);

				// Session ID should just be set after requests.
				self.setSessionIdInCookie();
				if (typeof self.activity.utils.getQueryVariable('failedToSetCookie') === 'undefined') {
					// If CIS can't find a CIS cookie, do a ping to CIS to see if it was set on last communication
					if (!data.cisCookieSet && self.cookiesAllowed && !self.activity.noRedirect) {
						self.getUserIdFromService({ping:'pong'}, function(err, pingData) {
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*global ActiveXObject*/
	'use strict';

	var Utils = __webpack_require__(8);

	/**
	 * Get XHR request object
	 *
	 * @return {object}
	 */
	function getXHR() {
	    if (XMLHttpRequest) {
	        return new XMLHttpRequest();
	    }

	    // IE6
	    try {
	        // The latest stable version.
	        return new ActiveXObject('MSXML2.XMLHTTP.6.0');
	    } catch (e) {
	        // Fallback
	        try {
	            return new ActiveXObject('MSXML2.XMLHTTP.3.0');
	        } catch (e) {
	            throw new Error('This browser does not support AJAX');
	        }
	    }
	}

	/**
	 * Browser AJAX transport
	 *
	 * @param {string} url
	 * @param {object} data
	 * @param {function} callback
	 * @param {boolean} credentials - flag for the withCredentials option
	 */
	function browserTransport(url, data, callback, credentials) {
	    if (!callback) {
	        throw new Error('callback required');
	    }

	    if (!url) {
	        return callback('url required');
	    }

	    if (!data || typeof data !== 'object') {
	        return callback('data required');
	    }

	    credentials = credentials || false;

	    Utils.retry(5, function(retryCallback) {
	        var request = getXHR();

	        request.onreadystatechange = function() {
	            if (this.readyState === 4) {
	                if (this.status === 200) {
	                    retryCallback(null, request);
	                } else {
	                    retryCallback('Failed with status ' + this.status);
	                }
	            }
	        };

	        request.open('POST', url);

	        request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	        request.withCredentials = credentials;

	        try {
	            var sendData = JSON.stringify(data);
	            request.send(sendData);
	        } catch (err) {
	            retryCallback(err.name + ': ' + err.message);
	        }
	    }, callback);
	}

	module.exports = browserTransport;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(13);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Use chrome.storage.local if we are in an app
	 */

	var storage;

	if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
	  storage = chrome.storage.local;
	else
	  storage = window.localStorage;

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      storage.removeItem('debug');
	    } else {
	      storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Event constructor
	 *
	 * @param {Activity} activity
	 * @param {object} data
	 */
	function Event(activity, data, objectOrder) {
	    if (!activity) {
	        throw new Error('activity required');
	    }

	    if (!data) {
	        throw new Error('data required');
	    }

	    this.activity = activity;
	    this.data = data;
	    this.objectOrder = objectOrder || [];
	}

	/**
	 * Add event to activity queue
	 */
	Event.prototype.queue = function() {
	    this.activity.addToQueue(this.data);
	};

	/**
	 * Send the event
	 *
	 * @param {function} callback
	 */
	Event.prototype.send = function(callback) {
	    this.activity.send(this.data, callback);
	};

	/**
	 * Add property to event
	 *
	 * @param {string} obj - Reference to the object you want to add property to (see Documentation)
	 * @param {string} property - The property you want to add
	 * @param {string | object} value - The value you want to give your property
	 * @returns this
	 */
	Event.prototype.addProperty = function(obj, property, value) {
	    var objKey = this.getObjectKey(obj);

	    this.data[objKey][property] = value;

	    return this;
	};

	/**
	 * Add data to the 'spt:custom' property in a object. PS! The function doesn't merge data
	 *
	 * @param {string} obj - Reference to the object you want to add property to (see Documentation)
	 * @param {string | object} data - The data you want to store in 'spt:custom'
	 * @returns this
	 */
	Event.prototype.addCustomData = function(obj, data) {
	    var objKey = this.getObjectKey(obj);

	    this.data[objKey]['spt:custom'] = data;

	    return this;
	};

	/**
	 * Function that helps addProperty and addCustomData determin right object to access.
	 * @param {string} obj - Reference to the object you want to add property to (see Documentation)
	 * @returns which object should be accessed.
	 */
	Event.prototype.getObjectKey = function(obj) {
	    if (obj === 'primary') {
	        return this.objectOrder[0];
	    } else if (obj === 'secondary') {
	        return this.objectOrder[1];
	    } else if (obj === 'tertiary') {
	        return this.objectOrder[2];
	    } else {
	        throw new Error('Object reference not valid');
	    }
	};

	module.exports = Event;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(14);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 's':
	      return n * s;
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ }
/******/ ])
});
