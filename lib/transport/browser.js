/*global ActiveXObject*/
'use strict';

var Utils = require('../utils');

/**
 * Get XHR request object
 *
 * @return {object}
 */
function getXHR() {
    if (XMLHttpRequest) {
        return new XMLHttpRequest();
    }

    // IE6
    try {
        // The latest stable version.
        return new ActiveXObject('MSXML2.XMLHTTP.6.0');
    } catch (e) {
        // Fallback
        try {
            return new ActiveXObject('MSXML2.XMLHTTP.3.0');
        } catch (e) {
            throw new Error('This browser does not support AJAX');
        }
    }
}

/**
 * Browser AJAX transport
 *
 * @param {string} url
 * @param {object} data
 * @param {function} callback
 */
function browserTransport(url, data, callback) {
    if (!callback) {
        throw new Error('callback required');
    }

    if (!url) {
        return callback('url required');
    }

    if (!data || typeof data !== 'object') {
        return callback('data required');
    }

    Utils.retry(5, function(retryCallback) {
        var request = getXHR();

        request.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    retryCallback();
                } else {
                    retryCallback('Failed with status ' + this.status);
                }
            }
        };

        request.open('POST', url, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        try {
            request.send(data);
        } catch (err) {
            retryCallback(err.name + ': ' + err.message);
        }
    }, callback);
}

module.exports = browserTransport;
