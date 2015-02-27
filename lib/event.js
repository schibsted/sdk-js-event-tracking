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
