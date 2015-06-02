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
