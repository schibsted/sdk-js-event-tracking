/*jshint -W030, -W024, -W079 */
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/
'use strict';

var Event = require('../lib/event');

describe('Event', function() {
    describe('constructor', function() {
        it('should require activity and data', function() {
            expect(function() {
                new Event();
            }).to.Throw(Error, 'activity required');

            expect(function() {
                new Event({});
            }).to.Throw(Error, 'data required');
        });

        it('should set activity and data on object', function() {
            var activity = { foo: 'bar' };
            var data = { bar: 'baz' };

            var event = new Event(activity, data);

            expect(event.activity).to.eq(activity);
            expect(event.data).to.eq(data);
        });
    });

    describe('queue', function() {
        it('should add event to the activity queue', function() {
            var activity = {
                addToQueue: function() {}
            };
            var stub = sinon.stub(activity, 'addToQueue');

            var data = { foo: 'bar' };

            var event = new Event(activity, data);

            event.queue();

            expect(stub).to.have.been.calledWith(data);
        });
    });

    describe('send', function() {
        it('should send the event', function(done) {
            var activity = {
                send: function() {}
            };
            var stub = sinon.stub(activity, 'send').yields();

            var data = { foo: 'bar' };

            var event = new Event(activity, data);

            event.send(function() {
                expect(stub).to.have.been.calledWith(data);

                done();
            });
        });

        it('should not require a callback', function() {
            var activity = {
                send: function() {}
            };

            sinon.stub(activity, 'send');

            var event = new Event(activity, {});

            expect(function() {
                event.send();
            }).to.not.Throw();
        });
    });
});
