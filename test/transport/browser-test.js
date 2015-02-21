/*jshint -W030, -W024 */
'use strict';
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/

var browserTransport = require('../../lib/transport/browser');

function mockActiveXObject() {
    window.ActiveXObject.prototype = {
        open: function() {},
        setRequestHeader: function() {},
        send: function() {}
    };

    sinon.mock(window.ActiveXObject.prototype);
}

describe('Browser transport', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
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

        browserTransport('http://test', body, sinon.spy());

        expect(requests).to.have.length(1);
        expect(requests[0].url).to.eq('http://test');
        expect(requests[0].method).to.eq('POST');
        expect(requests[0].async).to.be.true;
        expect(requests[0].requestBody).to.eq(body);

        xhr.restore();
    });

    it('should succeed on 200 response', function(done) {
        var xhr = sinon.useFakeXMLHttpRequest();
        var requests = [];

        xhr.onCreate = function (req) { requests.push(req); };

        browserTransport('http://test', [], function(err) {
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

        requests[0].respond(400);

        xhr.restore();
    });

    it('should return with error when failing to send data', function(done) {
        var xhr = sinon.useFakeXMLHttpRequest();

        sinon.stub(xhr.prototype, 'send').throws();

        browserTransport('http://test', [], function(err) {
            expect(err).to.be.ok;

            done();
        });
    });

    it('should use ActiveXObject when XMLHttpRequest is not available', function() {
        window.XMLHttpRequest = undefined;

        window.ActiveXObject = sinon.spy();

        mockActiveXObject();

        browserTransport('http://test', [], sinon.spy());

        expect(window.ActiveXObject.calledWith('MSXML2.XMLHTTP.6.0'))
            .to.be.ok;

        window.ActiveXObject = undefined;
    });

    it('should use ActiveXObject 3.0 when 6.0 is not available', function() {
        window.XMLHttpRequest = undefined;

        window.ActiveXObject = sinon.stub();
        window.ActiveXObject.onFirstCall().throws();

        mockActiveXObject();

        browserTransport('http://test', [], sinon.spy());

        expect(window.ActiveXObject.calledWith('MSXML2.XMLHTTP.3.0'))
            .to.be.ok;

        window.ActiveXObject = undefined;
    });

    it('should throw exception when no transport is available', function() {
        window.XMLHttpRequest = undefined;

        expect(function() {
            browserTransport('http://test', [], sinon.spy());
        }).to.Throw(Error, 'This browser does not support AJAX');
    });

    afterEach(function() {
        this.sinon.restore();
    });
});
