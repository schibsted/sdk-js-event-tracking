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

    describe('addParameter', function() {
        it('should update the object', function() {
            var activity = { foo: 'bar' };
            var data = {
                object: {
                    '@id': 1234
                },
                origin: {
                    '@id': 1234
                },
                target: {
                    '@id': 1234
                }
            };

            var event = new Event(activity, data, ['object', 'origin', 'target']);

            var answerJSON = JSON.stringify({
                '@id': 1234,
                foo: 'bar'
            });
            event.addProperty('primary', 'foo', 'bar');
            var testJSON = event.data;
            expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

            event.addProperty('secondary', 'foo', 'bar');
            testJSON = event.data;
            expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

            event.addProperty('tertiary', 'foo', 'bar');
            testJSON = event.data;
            expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

            expect(function() {
                var event = new Event(activity, data);
                event.addProperty('object', 'foo', 'bar');
            }).to.Throw(Error, 'Object reference not valid');

        });
    });

    describe('addCustomData', function() {
        it('should create spt:custom property with data', function() {
            var activity = { foo: 'bar' };
            var data = {
                object: {
                    '@id': 1234
                },
                origin: {
                    '@id': 1234
                },
                target: {
                    '@id': 1234
                }
            };

            var event = new Event(activity, data, ['object', 'origin', 'target']);

            var answerJSON = JSON.stringify({
                '@id': 1234,
                'spt:custom': {
                    foo: 'bar'
                }
            });
            event.addCustomData('primary', { foo: 'bar' });
            var testJSON = event.data;
            expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

            event.addCustomData('secondary', { foo: 'bar' });
            testJSON = event.data;
            expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

            event.addCustomData('tertiary', { foo: 'bar' });
            testJSON = event.data;
            expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

            expect(function() {
                var event = new Event(activity, data);
                event.addCustomData('object', 'foo', 'bar');
            }).to.Throw(Error, 'Object reference not valid');

        });
    });
});
