'use strict';

var generateMetaEvents = function generateMetaEvents(tags) {
    var data = {
            meta: {},
            og: {}
        },
        metaTag,
        name,
        content,
        property,
        isOGTag;

    for (var i = 0; i < tags.length; i++) {
        metaTag = tags[i];

        name    = metaTag.getAttribute('name');
        content = metaTag.getAttribute('content');
        property = metaTag.getAttribute('property');

        isOGTag =  property && property.indexOf('og:') > -1;

        if (name && content) {
            data.meta['spt:' + name] = decodeURI(content);
        } else if (isOGTag) {
            data.og['spt:' + property] = decodeURI(content);
        }
    }

    return data;
};

module.exports.pageLoad = function(activity) {
    var pageload = activity.events.trackPageLoad(),
        metaTags = document.querySelectorAll('meta'),
        data = generateMetaEvents(metaTags);

    if (data.meta) {
        pageload.addProperty('primary', 'spt:meta', data.meta);
    }

    if (data.og) {
        pageload.addProperty('primary', 'spt:og', data.og);
    }

    pageload.send();
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
