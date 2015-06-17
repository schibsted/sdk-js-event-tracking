/* */
'use strict';

function Validate(config, filename) {
	this.config = config;
	this.fileName = filename;
}

Validate.prototype.validateConfig = function() {
	this.hasValidClient();
	this.hasValidConfigArray();
	this.hasValidThrottles();
	this.hasValidEndpoints();
};

Validate.prototype.hasValidClient = function() {
	var client = this.config.client;
	if (typeof client !== 'string') {
		throw new Error('Client ID not valid for ' + this.fileName);
	}
	if (!/^[a-z]+$/.test(client)) {
		if (client !== '') {
			throw new Error('Client ID should only be lowercase a-z ' + this.fileName);
		}
	}
};

Validate.prototype.hasValidConfigArray = function() {
	var config = this.config.config;
	if (!Array.isArray(config)) {
		throw new Error('Config should be an array in ' + this.fileName);
	}
	if (config.length < 1) {
		throw new Error('There should be at lease one object in config ' + this.fileName);
	}
};

Validate.prototype.hasValidThrottles = function() {
	var configs = this.config.config;
	for (var i = 0; i < configs.length; i++) {
		var config = configs[i];
		if (typeof config.throttle !== 'number'){
			throw new Error('Throttle is undefined or not a number' + this.fileName);
		}
		if (config.throttle > 1 || config.throttle < 0) {
			throw new Error('Throttle must be between 0 and 1 ' + this.fileName);
		}
	}
};

Validate.prototype.hasValidEndpoints = function() {
	var configs = this.config.config;
	for (var i = 0; i < configs.length; i++) {
		var config = configs[i];
		if (typeof config.dataCollector !== 'undefined') {
			var dc = config.dataCollector;
			if (typeof dc !== 'string') {
				throw new Error('data-collector is not a string ' + this.fileName);
			}
			if (!this.isValidUrl(dc)) {
				throw new Error('data-collector is not a URL ' + this.fileName);
			}
		}
		if (typeof config.cis !== 'undefined') {
			var cis = config.cis;
			if (typeof cis !== 'string') {
				throw new Error('cis is not a string ' + this.fileName);
			}
			if (!this.isValidUrl(cis)) {
				throw new Error('cis is not a URL ' + this.fileName);
			}
		}
	}
};

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
