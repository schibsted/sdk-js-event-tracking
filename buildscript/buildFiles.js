/* global process */
'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var Validate = require('./validate');
var assert = require('assert');

/**
 * Build constructor
 *
 * @class
 */
function Build() {
	this.configPath = './configs/';
	this.fs = fs;
	this.mkdirp = mkdirp;
}

/**
 * Start build process
 */
Build.prototype.doBuild = function() {
	this.fs.exists(this.configPath, function(exists) {
		if (exists) {
			this.tryToCreateOutFolder();
			this.getAllConfigFiles(this.fs.readdirSync(this.configPath));
		} else {
			console.log('path not found');
		}
	}.bind(this));
};

/**
 * Iterates through an array of config filenames and concatenates them with the tracking source
 *
 * @param {Array} fileNameArray
 */
Build.prototype.getAllConfigFiles = function(fileNameArray) {
	var self = this;
	fileNameArray.map(function(file) {
		var fileName = self.configPath + file;
		self.isValidFile(fileName);
		console.log('building: ' + fileName);
		self.doFileConcatenate(fileName);
	});
};

/**
 * Checks if file is valid. Uses the Validate object for this
 *
 * @param {String} fileName
 */
Build.prototype.isValidFile = function(fileName) {
	var data = this.readAndParseFile(fileName);
	var validate = new Validate(data, fileName);
	validate.validateConfig();
};

/**
 * Concatenates config, manifest and tracking source
 *
 * @param {String} fileName
 */
Build.prototype.doFileConcatenate = function(fileName) {

	var buildFileName = './out/' + this.getBuildFileName(fileName);
	var manifest = '/* SPT */';

	this.fs.writeFileSync(buildFileName, manifest);
	this.fs.appendFileSync(buildFileName, this.readFile('./dist/autoTracker.min.js'));
	this.fs.appendFileSync(buildFileName, 'var pulse2config = ' + this.readFile(fileName) + ';');
};

/**
 * Attempts to create the output directoru
 */
Build.prototype.tryToCreateOutFolder = function() {
	this.mkdirp('./out', function(err) {
		assert(!err, 'Error creating output dir: ' + err);
	});
};

/**
 * Handles naming of built files
 *
 * @param {String} fileName
 * @returns filename for the build
 */
Build.prototype.getBuildFileName = function(fileName) {
	return 'autoTracker' + this.getClientId(fileName) + '.min.js';
};

/**
 * Gets client ID from config file
 *
 * @param {String} fileName
 * @returns client name with capitalized first letter.
 */
Build.prototype.getClientId = function(fileName) {
	var client = this.readAndParseFile(fileName).client;
	return this.capitalizeFirstLetter(client);
};

/**
 * Changes first letter to upper case and all other letters to lowe rcase
 *
 * @param {String} text
 * @returns lower case string with first letter in upper case
 */
Build.prototype.capitalizeFirstLetter = function(text) {
	text = text.toLowerCase();
	return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Reads a JSON file and parses it to an object
 *
 * @param {String} fileName
 * @returns parsed JSON file
 */
Build.prototype.readAndParseFile = function(fileName) {
	var data = this.readFile(fileName);
	return JSON.parse(data);
};

/**
 * Reads a file
 *
 * @param {String} fileName
 * @returns the contet of the file
 */
Build.prototype.readFile = function(fileName) {
	return this.fs.readFileSync(fileName, 'utf8');
};

module.exports = Build;

// Get commandline argument and start build

process.argv.forEach(function (val, index) {
	if (index > 1) {
		switch (val) {
			case '--build':
				var build = new Build();
				build.doBuild();
				break;
			case '--help':
				console.log('use --build to build script');
				break;
			default:
				console.log('No command given, run with --help for list of commands');
		}
	}
});

if (process.argv.length <= 2) {
	console.log('No command given, run with --help for list of commands');
}
