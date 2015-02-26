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

Event.prototype.addProperty = function(obj, property, value) {
    var objKey = this.getObjectKey(obj);

    this.data[objKey][property] = value;
};

Event.prototype.addCustomData = function(obj, data) {
    var objKey = this.getObjectKey(obj);

    this.data[objKey]['spt:custom'] = data;
};

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
