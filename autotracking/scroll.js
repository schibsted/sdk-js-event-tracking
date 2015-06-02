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
