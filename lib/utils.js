'use strict';

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

module.exports.getDeviceLanguage = function() {
    var userLanguage;

    if (navigator.userLanguage){
        userLanguage = navigator.userLanguage;
    } else if (navigator.language){
        userLanguage = navigator.language;
    }

    return userLanguage;
};

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
