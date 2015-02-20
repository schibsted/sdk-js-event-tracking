'use strict';

var Events = require('./events');
    // transport = require('./transport/browser');

/**
 * Activity constructor
 *
 * @class
 * @param {object} opts Options
 */
function Activity(opts) {
    if (!opts.clientId) {
        throw new Error('clientId is required');
    }

    if (!opts.siteId) {
        throw new Error('siteId is required');
    }

    this.events = new Events(this);
}

module.exports = Activity;
