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
            attempts = attempts + 1;

            task(taskCallback);
        } else {
            callback.apply(null, arguments);
        }
    };

    task(taskCallback);
};
