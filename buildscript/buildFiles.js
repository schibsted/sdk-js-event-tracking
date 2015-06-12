'use strict';

var fs = require('fs'),
	mkdirp = require('mkdirp'),
	configPath = './configs/';

console.log('Starting file build');

fs.exists(configPath, function(exists) {
	if (exists) {
		getConfigFiles(configPath);
	} else {
		console.log('path not found');
	}
});

function getConfigFiles(configPath) {
	tryToCreateOutFolder();
	getAllConfigFiles(fs.readdirSync(configPath));
}

function getAllConfigFiles(fileNameArray) {
	if (fileNameArray.length > 0) {
		var fileName = configPath + fileNameArray.pop();
		console.log('building: ' + fileName);
		if (isValidFile(fileName)) {
			doFileMerge(fileName);
			return getAllConfigFiles(fileNameArray);
		}
	} else {
		return;
	}
}

function isValidFile(fileName) {

	var data = fs.readFileSync(fileName, 'utf8');
	if (data) {
		return true;
	} else {
		return false;
	}
}

function doFileMerge(fileName) {

	var buildFileName = './out/' + getBuildFileName(fileName);
	var manifest = '/* SPT */';

	fs.writeFileSync(buildFileName, manifest);
	fs.appendFileSync(buildFileName, readFile('./dist/autoTracker.min.js'));
	fs.appendFileSync(buildFileName, 'var pulse2config = ' + readFile(fileName) + ';');
}

function tryToCreateOutFolder() {
	mkdirp('./out', function(err) {
		if (err) {
			return false;
		} else {
			return true;
		}
	});
}

function getBuildFileName(fileName) {
	return 'autoTracker' + getClientId(fileName) + '.min.js';
}

function getClientId(fileName) {
	var client = readAndParseFile(fileName).client;
	return capitalizeFirstLetter(client);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function readAndParseFile(fileName) {
	var data = readFile(fileName);
	return JSON.parse(data);
}

function readFile(fileName) {
	return fs.readFileSync(fileName, 'utf8');
}
