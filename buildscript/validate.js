'use strict';
var assert = require('assert');

/**
 * Validate constructor
 *
 * @class
 * @param {object} config
 * @param {string} filename
 */
function Validate(config, filename) {
	this.config = config;
	this.fileName = filename;
}

/**
 * Initiates validation
 */
Validate.prototype.validateConfig = function() {
	this.hasValidClient();
	this.hasValidConfigArray();
	this.hasValidThrottles();
	this.hasValidEndpoints();
};

/**
 * Throws error if the client property in config is not a lowercase a-z string.
 */
Validate.prototype.hasValidClient = function() {
	var client = this.config.client;
	assert(typeof client === 'string', 'Client ID not valid for ' + this.fileName);
	if (!/^[a-z]+$/.test(client)) {
		if (client !== '') {
			throw new Error('Client ID should only be lowercase a-z ' + this.fileName);
		}
	}
};

/**
 * Throws error if config property is not an array or has zero elements.
 */
Validate.prototype.hasValidConfigArray = function() {
	var config = this.config.config;
	assert(Array.isArray(config), 'Config should be an array in ' + this.fileName);
	assert(config.length > 0, 'There should be at lease one object in config ' + this.fileName);
};

/**
 * Throws error if config.throttle property is NaN or is not between 1 and 0
 */
Validate.prototype.hasValidThrottles = function() {
	var configs = this.config.config;
	var self = this;
	configs.map(function(obj) {
		var throttle = obj.throttle;
		assert(typeof throttle === 'number', 'Throttle is undefined or not a number' + self.fileName);
		assert(throttle <= 1 && throttle >= 0, 'Throttle must be between 0 and 1 ' + self.fileName);
	});
};

/**
 * Throws error if config.cis or config.datacollector is not a valid url as a string
 */
Validate.prototype.hasValidEndpoints = function() {
	var configs = this.config.config;
	var self = this;
	configs.map(function(obj) {
		if (obj.dataCollector) {
			var dc = obj.dataCollector;
			assert(typeof dc === 'string', 'data-collector is not a string ' + self.fileName);
			assert(self.isValidUrl(dc), 'data-collector is not a URL ' + self.fileName);
		}
		if (obj.cis) {
			var cis = obj.cis;
			assert(typeof cis === 'string', 'cis is not a string ' + self.fileName);
			assert(self.isValidUrl(cis), 'cis is not a URL ' + self.fileName);
		}
	});
};

/**
 * Checks if a URL is valid
 *
 * @param {String} url
 * @returns bool
 */
Validate.prototype.isValidUrl = function(url) {
	// jscs:disable
	var pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
	// jscs:enable
	return pattern.test(url);
};

module.exports = Validate;
