"use strict";

// TODO: Manage IDs from external service and cookies
// TODO: Search tracking, could be done with only one parameter
// TODO: Create test/debug mode that doesn't send data but console logs it!
// TODO: Prettify!
// TODO: Add spt:customId to actor. Can be set via _opt
// TODO: Change _opt to something more unique.
// TODO: Define parameters that can be a part of _opt
// TODO: Write function that unset null values in activity objects

var _opt = _opt || {};
var activityQueue = [];
var errorCount = 0;
var serverUri = 'http://127.0.0.1:8002/api/v1/track';
var sentDataQueue = [];
