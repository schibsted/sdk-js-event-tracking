/*jshint -W030, -W024 */
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/
'use strict';

var Activity = require('../lib/activity'),
    browserTransport = require('../lib/transport/browser');

describe('Activity', function() {
    describe('constructor', function() {
        it('should require clientId and pageId', function() {
            expect(function() {
                new Activity({ pageId: 1337 });
            }).to.Throw(Error, 'clientId is required');

            expect(function() {
                new Activity({ clientId: 1337 });
            }).to.Throw(Error, 'pageId is required');
        });

        it('should set clientId and pageId on activity object', function() {
            var activity = new Activity({ pageId: 1, clientId: 2 });

            expect(activity.pageId).to.eq(1);
            expect(activity.clientId).to.eq(2);
        });

        it('should have a default url', function() {
            var activity = new Activity({ pageId: 1, clientId: 2 });

            expect(activity.url).to.match(/^http:\/\//);
        });

        it('should be possible to override url', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, url: 'http://foo' });

            expect(activity.url).to.eq('http://foo');
        });

        it('should use browser transport by default', function() {
            var activity = new Activity({ pageId: 1, clientId: 1 });

            expect(activity.transport).to.eq(browserTransport);
        });

        it('should be possible to override transport', function() {
            var transport = function() {};

            var activity = new Activity({
                pageId: 1,
                clientId: 1,
                transport: transport
            });

            expect(activity.transport).to.eq(transport);
        });
    });

    describe('addToQueue', function() {
        it('should be possible to add items to the queue', function() {
            var object1 = { foo: 'bar' };
            var object2 = { bar: 'baz' };

            var activity = new Activity({ pageId: 1, clientId: 2 });

            activity.addToQueue(object1);
            activity.addToQueue(object2);

            expect(activity.queue).to.have.length(2);
            expect(activity.queue[0]).to.eq(object1);
            expect(activity.queue[1]).to.eq(object2);
        });
    });

    describe('sendQueue', function() {
        beforeEach(function() {
            this.sinon = sinon.sandbox.create();
            this.transportStub = this.sinon.stub();

            this.activity = new Activity({
                pageId: 1,
                clientId: 2,
                transport: this.transportStub,
                url: 'http://test'
            });
        });

        afterEach(function() {
            this.sinon.restore();
        });

        it('should return queue is empty', function(done) {
            this.activity.sendQueue(function(err) {
                expect(err).to.not.be.ok;

                done();
            });
        });

        it('should send all the items in the queue', function(done) {
            var objects = [{ foo: 'bar '}];

            this.activity.addToQueue(objects[0]);

            var stub = this.transportStub;

            stub.yields();

            this.activity.sendQueue(function(err) {
                expect(err).to.not.be.ok;

                expect(stub).to.be.called;
                expect(stub).to.have.been.calledWith('http://test', objects);

                done();
            });
        });

        it('should empty the queue after send succesfully', function(done) {
            this.activity.addToQueue({ foo: 'bar' });

            this.transportStub.yields();

            var activity = this.activity;

            this.activity.sendQueue(function() {
                expect(activity.queue).to.be.empty;

                done();
            });
        });

        it('should keep the queue when failing to send', function(done) {
            var queue = [{ foo: 'bar' }, { bar: 'baz' }];

            this.activity.addToQueue(queue[0]);
            this.activity.addToQueue(queue[1]);

            this.transportStub.yields('Fail');

            var activity = this.activity;

            this.activity.sendQueue(function() {
                expect(activity.queue).to.deep.eq(queue);

                done();
            });
        });
    });

    describe('send', function() {
        beforeEach(function() {
            this.sinon = sinon.sandbox.create();
            this.transportStub = this.sinon.stub();

            this.activity = new Activity({
                pageId: 1,
                clientId: 2,
                transport: this.transportStub,
                url: 'http://test'
            });
        });

        afterEach(function() {
            this.sinon.restore();
        });

        it('should send the item', function(done) {
            var obj = { foo: 'bar' };

            this.transportStub.yields();

            var stub = this.transportStub;

            this.activity.send(obj, function(err) {
                expect(err).to.not.be.ok;
                expect(stub).to.have.been.calledWith('http://test', [obj]);

                done();
            });
        });

        it('should add the item to the queue on fail', function(done) {
            this.activity.addToQueue({ foo: 'bar' });

            this.transportStub.yields('Fail');

            var obj = { item: 'failed' };
            var activity = this.activity;

            this.activity.send(obj, function(err) {
                expect(err).to.eq('Fail');

                expect(activity.queue[1]).to.eq(obj);

                done();
            });
        });
    });
});
