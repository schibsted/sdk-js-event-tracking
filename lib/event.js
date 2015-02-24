'use strict';

/**
 * Event constructor
 *
 * @param {Activity} activity
 * @param {object} data
 */
function Event(activity, data) {
    if (!activity) {
        throw new Error('activity required');
    }

    if (!data) {
        throw new Error('data required');
    }

    this.activity = activity;
    this.data = data;
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
 * Update the data in the Event class
 *
 * @param {object} data
 */
Event.prototype.setData = function(data) {
    this.data = data;
};

module.exports = Event;
