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
 * @param {boolean} credentials - flag for the withCredentials option
 */
function browserTransport(url, data, callback, credentials) {
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

    Utils.retry(5, function(retryCallback) {
        var request = getXHR();

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
            var sendData = JSON.stringify(data);
            request.send(sendData);
        } catch (err) {
            retryCallback(err.name + ': ' + err.message);
        }
    }, callback);
}

module.exports = browserTransport;
