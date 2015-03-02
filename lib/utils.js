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
