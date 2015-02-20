'use strict';

var Events = require('./events');

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
