/*jshint -W030, -W024 */
'use strict';

var expect = require('chai').expect,
    Utils = require('../lib/utils');

describe('Utils', function() {
    describe('retry', function() {
        it('should required times param', function() {
            expect(function() {
                Utils.retry();
            }).to.Throw(Error, 'times required');

            expect(function() {
                Utils.retry('fail');
            }).to.Throw(Error, 'times required');
        });

        it('should required task param', function() {
            expect(function() {
                Utils.retry(5);
            }).to.Throw(Error, 'task required');

            expect(function() {
                Utils.retry(5, 'fail');
            }).to.Throw(Error, 'task required');
        });

        it('should require callback', function() {
            expect(function() {
                Utils.retry(5, function() {});
            }).to.Throw(Error, 'callback required');

            expect(function() {
                Utils.retry(5, function() {}, 'foo');
            }).to.Throw(Error, 'callback required');
        });

        it('should call callback on success', function(done) {
            Utils.retry(5, function(callback) {
                callback(null, 'test');
            }, function(err, text) {
                expect(err).to.not.be.ok;
                expect(text).to.eq('test');

                done();
            });
        });

        it('should call callback n-times on error', function(done) {
            var timesCalled = 0;

            Utils.retry(5, function(callback) {
                timesCalled += 1;

                callback('fail');
            }, function(err) {
                expect(timesCalled).to.eq(5);
                expect(err).to.eq('fail');

                done();
            });
        });

        it('should return early on first success', function(done) {
            var timesCalled = 0;

            Utils.retry(5, function(callback) {
                timesCalled += 1;

                if (timesCalled === 3) {
                    callback(null, 'success');
                } else {
                    callback('fail');
                }
            }, function(err, status) {
                expect(timesCalled).to.eq(3);
                expect(err).to.not.be.ok;
                expect(status).to.eq('success');

                done();
            });
        });
    });
});
