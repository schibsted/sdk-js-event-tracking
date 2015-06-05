/*jshint -W030, -W024 */
'use strict';
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/

var browserTransport = require('../../lib/transport/browser');

describe('Browser transport', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should require callback', function() {
        expect(function() {
            browserTransport('foo', 'bar');
        }).to.Throw(Error, 'callback required');
    });

    it('should require url', function(done) {
        browserTransport(null, 'bar', function(err) {
            expect(err).to.eq('url required');
            done();
        });
    });

    it('should require data', function(done) {
        browserTransport('foo', null, function(err) {
            expect(err).to.eq('data required');

            // The function wants a object/array
            browserTransport('foo', 'test', function(err) {
                expect(err).to.eq('data required');
                done();
            });
        });
    });

    it('should make a request', function() {
        var xhr = sinon.useFakeXMLHttpRequest();
        var requests = [];

        xhr.onCreate = function (req) { requests.push(req); };

        var body = [{ test: 'bar' }];

        browserTransport('http://test', body, this.sinon.spy());

        expect(requests).to.have.length(1);
        expect(requests[0].url).to.eq('http://test');
        expect(requests[0].method).to.eq('POST');
        expect(requests[0].async).to.be.true;
        expect(requests[0].requestBody).to.eq(JSON.stringify(body));
        expect(requests[0].requestHeaders['Content-Type']).to.eq('application/json;charset=utf-8');

        xhr.restore();
    });

    it('should succeed on 200 response', function(done) {
        var xhr = sinon.useFakeXMLHttpRequest();
        var requests = [];

        xhr.onCreate = function (req) { requests.push(req); };

        browserTransport('http://test!!', [], function(err) {
            expect(err).to.be.not.ok;

            done();
        });

        requests[0].respond(200);

        xhr.restore();
    });

    it('should fail on responses other then 200', function(done) {
        var xhr = sinon.useFakeXMLHttpRequest();
        var requests = [];

        xhr.onCreate = function (req) { requests.push(req); };

        browserTransport('http://test', [], function(err) {
            expect(err).to.equal('Failed with status 400');

            done();
        });

        for (var i = 0; i < requests.length; i++) {
            requests[i].respond(400);
        }

        xhr.restore();
    });

    it('should return with error when failing to send data', function(done) {
        var xhr = sinon.useFakeXMLHttpRequest();

        this.sinon.stub(xhr.prototype, 'send').throws();

        browserTransport('http://test', [], function(err) {
            expect(err).to.be.ok;

            done();
        });

        xhr.restore();
    });

    it('should retry five times when failing', function(done) {
        var xhr = sinon.useFakeXMLHttpRequest();

        var callCount = 0;

        xhr.prototype.send = function() {
            callCount += 1;

            throw new Error('Fail');
        };

        browserTransport('http://test', [], function(err) {
            expect(err).to.be.ok;
            expect(callCount).to.eq(5);

            done();
        });

        xhr.restore();
    });
});
