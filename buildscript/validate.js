/* */
'use strict';
var Type = require('type-of-is');

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
	if (!Type.is(client, String)) {
		throw new Error('Client ID not valid for ' + this.fileName);
	}
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
	if (!Array.isArray(config)) {
		throw new Error('Config should be an array in ' + this.fileName);
	}
	if (config.length < 1) {
		throw new Error('There should be at lease one object in config ' + this.fileName);
	}
};

/**
 * Throws error if config.throttle property is NaN or is not between 1 and 0
 */
Validate.prototype.hasValidThrottles = function() {
	var configs = this.config.config;
	var self = this;
	configs.map(function(obj) {
		if (!Type.is(obj.throttle, Number)){
			throw new Error('Throttle is undefined or not a number' + self.fileName);
		}
		if (obj.throttle > 1 || obj.throttle < 0) {
			throw new Error('Throttle must be between 0 and 1 ' + self.fileName);
		}
	});
};

/**
 * Throws error if config.cis or config.datacollector is not a valid url as a string
 */
Validate.prototype.hasValidEndpoints = function() {
	var configs = this.config.config;
	var self = this;
	configs.map(function(obj) {
		if (!Type.is(obj.dataCollector, undefined)) {
			var dc = obj.dataCollector;
			if (!Type.is(dc, String)) {
				throw new Error('data-collector is not a string ' + self.fileName);
			}
			if (!self.isValidUrl(dc)) {
				throw new Error('data-collector is not a URL ' + self.fileName);
			}
		}
		if (!Type.is(obj.cis, undefined)) {
			var cis = obj.cis;
			if (!Type.is(cis, String)) {
				throw new Error('cis is not a string ' + self.fileName);
			}
			if (!self.isValidUrl(cis)) {
				throw new Error('cis is not a URL ' + self.fileName);
			}
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
	if (pattern.test(url)) {
		return true;
	}
	return false;
};

module.exports = Validate;
