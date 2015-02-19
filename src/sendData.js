'use strict';

var _opt = _opt || {};
var DataTracker = DataTracker || {};
var activityQueue = activityQueue || [];
var errorCount = errorCount || 0;
var sendDataQueue = sendDataQueue || [];

function createTrackerProcessData(activities, verb, callback) {
    // FIXME: This does not have to be created on each run.
    var tracker = new DataTracker(_opt, activities, verb);

    activityQueue.push(tracker.getActivity());

    return processActivityQueue(callback);
}

function processActivityQueue(callback) {
    var uri = _opt.trackingUrl || serverUri;

    var result = sendData(activityQueue, uri, callback);
    activityQueue = [];

    if (errorCount >= 5) {
        // TODO: Report to server
        console.log('data was not sent in ' + errorCount + ' tries');
    }

    return result;
}

function sendData(data, uri, callback) {
    var async = _opt.sendDataAsync || true;

    sentDataQueue.push(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', uri, async);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    try {
        xhr.send(data);
    } catch (err) {
        errorCount++;
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var sentData = sentDataQueue.shift();

            if (xhr.status === 200) {
                errorCount = 0;
            } else {
                activityQueue = activityQueue.concat(sentData);
                errorCount++;
            }

            if (callback !== undefined) {
                callback(xhr, sentData);
            }
        }
    };
}
