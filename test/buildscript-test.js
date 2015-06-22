/*jshint -W030, -W024 */
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/
'use strict';

var Build = require('../buildscript/buildFiles');
var configs = require('../buildscript/resources/mockConfigs');
var build = new Build();
var okConfigs = configs.okConfigs;
var faultyConfigs = configs.faultyConfigs;

describe('buildscript', function() {
	describe('getAllConfigFiles', function() {
		beforeEach(function() {
			this.doFileConcatenate = sinon.stub(Build.prototype, 'doFileConcatenate');
			this.isValidFile = sinon.stub(Build.prototype, 'isValidFile');
		});
		afterEach(function() {
			Build.prototype.doFileConcatenate.restore();
			Build.prototype.isValidFile.restore();
		});
		it('should recurse through an array until nothing is left', function () {
			var testArr = ['one', 'two', 'three'];
			this.isValidFile.returns(true);

			build.getAllConfigFiles(testArr);

			expect(this.doFileConcatenate).to.have.been.calledThrice;
			expect(this.isValidFile).to.have.been.calledThrice;
			expect(this.doFileConcatenate).to.have.been.calledWith('./configs/one');
			expect(this.doFileConcatenate).to.have.been.calledWith('./configs/two');
			expect(this.doFileConcatenate).to.have.been.calledWith('./configs/three');
			expect(this.isValidFile).to.have.been.calledWith('./configs/one');
			expect(this.isValidFile).to.have.been.calledWith('./configs/two');
			expect(this.isValidFile).to.have.been.calledWith('./configs/three');
			expect(testArr.length).to.eq(0);

		});
		it('should throw error on invalid file', function() {
			this.isValidFile.returns(false);
			var testArr = ['one', 'two', 'three'];

			expect(function() {
				build.getAllConfigFiles(testArr);
			}).to.throw(Error);

			expect(this.isValidFile).to.have.been.calledOnce;
			expect(this.doFileConcatenate).to.not.have.been.called;
			expect(this.isValidFile).to.have.been.calledWith('./configs/three');
			expect(testArr.length).to.eq(2);
		});
	});
	describe('getBuildFileName and getClientId', function() {
		beforeEach(function() {
			this.stub = sinon.stub(Build.prototype, 'readAndParseFile');
		});
		afterEach(function() {
			Build.prototype.readAndParseFile.restore();
		});
		it('should return a camelcased filename', function() {
			this.stub.returns(okConfigs.blocket);
			var fileName = build.getBuildFileName('./configs/blocket.json');
			expect(fileName).to.eq('autoTrackerBlocket.min.js');

			this.stub.returns(okConfigs.generic);
			fileName = build.getBuildFileName('./configs/generic.json');
			expect(fileName).to.eq('autoTracker.min.js');
		});
	});
	describe('capitalizeFirstLetter', function() {
		it('should always be just uppercase first letter', function() {
			expect(build.capitalizeFirstLetter('blocket')).to.eq('Blocket');
			expect(build.capitalizeFirstLetter('Blocket')).to.eq('Blocket');
			expect(build.capitalizeFirstLetter('BLOCKET')).to.eq('Blocket');
			expect(build.capitalizeFirstLetter('bLOCKET')).to.eq('Blocket');
		});
	});
	describe('isValidFile', function() {
		beforeEach(function() {
			this.stub = sinon.stub(Build.prototype, 'readAndParseFile');
		});
		afterEach(function() {
			Build.prototype.readAndParseFile.restore();
		});
		it('should return true if no errors', function() {
			this.stub.returns(okConfigs.blocket);
			expect(build.isValidFile('')).to.eq(true);
			this.stub.returns(okConfigs.generic);
			expect(build.isValidFile('')).to.eq(true);
			this.stub.returns(okConfigs.finn);
			expect(build.isValidFile('')).to.eq(true);
			this.stub.returns(okConfigs.vg);
			expect(build.isValidFile('')).to.eq(true);
			this.stub.returns(okConfigs.bt);
			expect(build.isValidFile('')).to.eq(true);
		});
		it('should throw error when config is faulty', function() {
			this.stub.returns(faultyConfigs.blocket);
			expect(function() {
				build.isValidFile('');
			}).to.throw('Client ID should only be lowercase a-z');
			this.stub.returns(faultyConfigs.generic);
			expect(function() {
				build.isValidFile('');
			}).to.throw('Throttle must be between 0 and 1');
			this.stub.returns(faultyConfigs.finn);
			expect(function() {
				build.isValidFile('Throttle is undefined or not a number');
			}).to.throw(Error);
			this.stub.returns(faultyConfigs.vg);
			expect(function() {
				build.isValidFile('');
			}).to.throw('Config should be an array in');
			this.stub.returns(faultyConfigs.bt);
			expect(function() {
				build.isValidFile('');
			}).to.throw('Throttle is undefined or not a number');
			this.stub.returns(faultyConfigs.prisjakt);
			expect(function() {
				build.isValidFile('');
			}).to.throw('Client ID not valid');
			this.stub.returns(faultyConfigs.lendo);
			expect(function() {
				build.isValidFile('');
			}).to.throw('There should be at lease one object in config');
			this.stub.returns(faultyConfigs.lbc);
			expect(function() {
				build.isValidFile('');
			}).to.throw('data-collector is not a string');
			this.stub.returns(faultyConfigs.aftonbladet);
			expect(function() {
				build.isValidFile('');
			}).to.throw('cis is not a string');
			this.stub.returns(faultyConfigs.svd);
			expect(function() {
				build.isValidFile('');
			}).to.throw('data-collector is not a URL');
			this.stub.returns(faultyConfigs.aftenposten);
			expect(function() {
				build.isValidFile('');
			}).to.throw('cis is not a URL');
		});
	});
});
