'use strict';

function Events(activity) {
    if (!activity) {
        throw new Error('activity required');
    }

    this.activity = activity;
}

module.exports = Events;
