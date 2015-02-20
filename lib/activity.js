'use strict';

function Activity(opts) {
    if (!opts.clientId) {
        throw new Error('clientId is required');
    }

    if (!opts.siteId) {
        throw new Error('siteId is required');
    }
}

module.exports = Activity;
