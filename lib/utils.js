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
