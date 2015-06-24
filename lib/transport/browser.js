'use strict';

var Utils = require('../utils');

/**
 * Browser AJAX transport
 *
 * @param {string} url
 * @param {object} data
 * @param {function} callback
 * @param {boolean} credentials - flag for the withCredentials option
 */
function post(url, data, callback, credentials) {
    if (!callback) {
        throw new Error('callback required');
    }

    if (!url) {
        return callback('url required');
    }

    if (!data || typeof data !== 'object') {
        return callback('data required');
    }

    credentials = credentials || false;

    Utils.retry(3, function(retryCallback) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    retryCallback(null, request);
                } else {
                    retryCallback('Failed with status ' + this.status);
                }
            }
        };

        request.open('POST', url);

        request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.withCredentials = credentials;

        try {
            request.send(JSON.stringify(data));
        } catch (err) {
            retryCallback(err.name + ': ' + err.message);
        }
    }, callback);
}

module.exports = post;
