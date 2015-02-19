'use strict';

var _opt = _opt || {};

function getTimeStamp() {
    var now = new Date(),
    timezoneOffset = -now.getTimezoneOffset(),
    diff = timezoneOffset >= 0 ? '+' : '-',
    padding = function(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    };

    // Put date in timestamp
    var timestamp = now.getFullYear() + '-' + padding(now.getMonth() + 1) + '-' + padding(now.getDate());
    // Add time
    timestamp = timestamp + 'T' + padding(now.getHours()) + ':' + padding(now.getMinutes())
    timestamp = timestamp + ':' + padding(now.getSeconds());
    // Add timezone offset
    timestamp = timestamp + diff + padding(timezoneOffset / 60) + ':' + padding(timezoneOffset % 60);

    return timestamp;
}
function getParameter(name, queryString) {
    var searchString = queryString || location.search;
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]').toLowerCase();
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(searchString);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getViewportDimensions() {
    var viewportwidth;
    var viewportheight;

    if (typeof window.innerWidth !== 'undefined') {
        viewportwidth = window.innerWidth;
        viewportheight = window.innerHeight;
    } else if (
        typeof document.documentElement.clientWidth !== 'undefined'
        && document.documentElement.clientWidth !== 0) {
        viewportwidth = document.documentElement.clientWidth;
        viewportheight = document.documentElement.clientHeight;
    } else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
        viewportheight = document.getElementsByTagName('body')[0].clientHeight;
    }
    return viewportwidth + 'x' + viewportheight;
}
function checkMandatoryOptions() {
    if (_opt.clientId === undefined || _opt.clientId === null || _opt.clientId === '') {
        return false;
    }
    if (_opt.pageId === undefined || _opt.pageId === null || _opt.pageId === '') {
        return false;
    }
    return true;
}
