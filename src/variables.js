"use strict";

// TODO: Manage IDs from external service and cookies
// TODO: Create option for bulk sending
// TODO: Search tracking, could be done with only one parameter
// TODO: Create test/debug mode that doesn't send data but console logs it!
// TODO: Prettify!
// TODO: Set up Grunt to change return types in functions on build.
// TODO: Figure out how IPs should be handled.
// TODO: Should timestamp have millisecond resolution?
// TODO: Split in to several files and let grunt combine in to one.

var _opt = _opt || {};
var activityQueue = [];
var errorCount = 0;
var serverUri = 'http://127.0.0.1:8002/api/v1/track';
