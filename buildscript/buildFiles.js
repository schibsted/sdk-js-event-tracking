/* global process */
'use strict';

var fs = require('fs'),
	mkdirp = require('mkdirp'),
	Validate = require('./validate');

function Build() {
	this.configPath = './configs/';
	this.fs = fs;
	this.mkdirp = mkdirp;
}

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

Build.prototype.getAllConfigFiles = function(fileNameArray) {
	if (fileNameArray.length <= 0) {
		return;
	}
	var fileName = this.configPath + fileNameArray.pop();
	console.log('building: ' + fileName);

	if (!this.isValidFile(fileName)) {
		throw new Error ('Invalid file: ' + fileName);
	}
	this.doFileConcatenate(fileName);
	return this.getAllConfigFiles(fileNameArray);
};

Build.prototype.isValidFile = function(fileName) {
	var data = this.readAndParseFile(fileName);
	var validate = new Validate(data, fileName);
	validate.validateConfig();
	return true;
};

Build.prototype.doFileConcatenate = function(fileName) {

	var buildFileName = './out/' + this.getBuildFileName(fileName);
	var manifest = '/* SPT */';

	this.fs.writeFileSync(buildFileName, manifest);
	this.fs.appendFileSync(buildFileName, this.readFile('./dist/autoTracker.min.js'));
	this.fs.appendFileSync(buildFileName, 'var pulse2config = ' + this.readFile(fileName) + ';');
};

Build.prototype.tryToCreateOutFolder = function() {
	this.mkdirp('./out', function(err) {
		if (err) {
			throw new Error('Error creating output dir: ' + err);
		}
	});
};

Build.prototype.getBuildFileName = function(fileName) {
	return 'autoTracker' + this.getClientId(fileName) + '.min.js';
};

Build.prototype.getClientId = function(fileName) {
	var client = this.readAndParseFile(fileName).client;
	return this.capitalizeFirstLetter(client);
};

Build.prototype.capitalizeFirstLetter = function(text) {
	text = text.toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
};

Build.prototype.readAndParseFile = function(fileName) {
	var data = this.readFile(fileName);
	return JSON.parse(data);
};

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
