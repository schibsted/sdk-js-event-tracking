/*jshint -W030, -W024 */
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/
'use strict';

var Activity = require('../lib/activity'),
    User = require('../lib/user'),
    browserTransport = require('../lib/transport/browser');

describe('Activity', function() {
    before(function() {
        this.stub = sinon.stub(User.prototype, 'getUserId');
    });

    after(function() {
        User.prototype.getUserId.restore();
    });

    describe('constructor', function() {
        it('should require clientId and pageId', function() {
            expect(function() {
                new Activity({ pageId: 1337, activityType: 'Read' });
            }).to.Throw(Error, 'clientId is required');

            expect(function() {
                new Activity({ clientId: 1337, activityType: 'Read' });
            }).to.Throw(Error, 'pageId is required');
        });

        it('should set clientId and pageId on activity object', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            expect(activity.pageId).to.eq(1);
            expect(activity.clientId).to.eq('urn:spid.no:2');
        });

        it('should have a default url', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            expect(activity.url).to.match(/^http:\/\//);
        });

        it('should be possible to override url', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, url: 'http://foo', activityType: 'Read' });

            expect(activity.url).to.eq('http://foo/urn:spid.no:2');
        });

        it('should use browser transport by default', function() {
            var activity = new Activity({ pageId: 1, clientId: 1, activityType: 'Read'  });

            expect(activity.transport).to.eq(browserTransport);
        });

        it('should be possible to override transport', function() {
            var transport = function() {};

            var activity = new Activity({
                pageId: 1,
                clientId: 1,
                transport: transport,
                activityType: 'Read'
            });

            expect(activity.transport).to.eq(transport);
        });

        it('should take a bool for respectDoNotTrack', function() {
            var activity = new Activity({
                pageId: 1,
                clientId: 1,
                transport: this.transportStub,
                url: 'http://test',
                activityType: 'Read',
                respectDoNotTrack: true
            });
            expect(activity.opts.respectDoNotTrack).to.eq(true);
        });

    });

    describe('initIds', function() {

        it('should fetch Ids from user object', function() {
            var err = null;
            var data = {
                userId: 'abcd1234',
                sessionId: 'abcd2345',
                visitorId: 'abcd3456',
                envId: 'abcd4567',
                cisCookiesSet: true
            };
            this.stub.yield(err, data);

            var activity = new Activity({
                pageId: 1,
                clientId: 1,
                activityType: 'Read'
            });

            activity.initIds(function(y) {
                expect(y.userId).to.eq(data.userId);
            });

        });
    });

    describe('addToQueue', function() {
        it('should be possible to add items to the queue', function() {
            var object1 = { foo: 'bar' };
            var object2 = { bar: 'baz' };

            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read'  });

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
                url: 'http://test',
                activityType: 'Read',
                userId: 1337,
                visitorId: 1337
            });
        });

        afterEach(function() {
            this.sinon.restore();
        });

        it('should return if queue is empty', function(done) {
            this.activity.sendQueue(function(err) {
                expect(err).to.not.be.ok;

                done();
            });
        });

        it('should send all the items in the queue', function(done) {
            var objects = [this.activity.createScaffold()];

            this.activity.addToQueue(objects[0]);

            var stub = this.transportStub;

            stub.yields();

            this.activity.sendQueue(function(err) {
                expect(err).to.not.be.ok;

                expect(stub).to.be.called;
                expect(stub).to.have.been.calledWith('http://test/urn:spid.no:2', objects);

                done();
            });
        });

        it('should empty the queue after send succesfully', function(done) {
            this.activity.addToQueue(this.activity.createScaffold());

            this.transportStub.yields();

            var activity = this.activity;

            this.activity.sendQueue(function() {
                expect(activity.queue).to.be.empty;

                done();
            });
        });

        it('should keep the queue when failing to send', function(done) {
            var queue = [this.activity.createScaffold(), this.activity.createScaffold()];

            this.activity.addToQueue(queue[0]);
            this.activity.addToQueue(queue[1]);

            this.transportStub.yields('Fail');

            var activity = this.activity;

            this.activity.sendQueue(function() {
                expect(activity.queue).to.deep.eq(queue);

                done();
            });
        });

        it('should not require callback', function() {
            var activity = this.activity;

            expect(function() {
                activity.sendQueue();
            }).to.not.Throw();
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
                url: 'http://test',
                activityType: 'Read',
                userId: 1337,
                visitorId: 1337
            });
        });

        afterEach(function() {
            this.sinon.restore();
        });

        it('should send the item', function(done) {
            var obj = this.activity.createScaffold();

            this.transportStub.yields();

            var stub = this.transportStub;

            this.activity.send(obj, function(err) {
                expect(err).to.not.be.ok;
                expect(stub).to.have.been.calledWith('http://test/urn:spid.no:2', [obj]);

                done();
            });
        });

        it('should add the item to the queue on fail', function(done) {
            this.activity.addToQueue({ foo: 'bar' });

            this.transportStub.yields('Fail');

            var obj = this.activity.createScaffold();
            var activity = this.activity;

            this.activity.send(obj, function(err) {
                expect(err).to.eq('Fail');

                expect(activity.queue[1]).to.eq(obj);

                done();
            });
        });

        it('should not require callback', function() {
            this.transportStub.yields('Fail');

            var activity = this.activity;

            expect(function() {
                activity.send(activity.createScaffold());
            }).to.not.Throw();
        });
    });

    describe('createActor', function() {
        it('should create a actor', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            var actor = activity.createActor();

            expect(actor['@type']).to.eq('Person');
            expect(actor['spt:userAgent']).to.eq(navigator.userAgent);
            expect(actor['spt:screenSize']).to.eq(window.screen.width + 'x' + window.screen.height);
            expect(actor['spt:viewportSize']).to.match(/([0-9]{1,4})x([0-9]{1,4})/);
            expect(actor['spt:acceptLanguage']).to.match(/([a-z|A-Z][a-z|A-Z])/);
        });
    });

    describe('getPageViewId', function() {
        it('should return a pageViewId in UUID v4 format', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            var pageViewId = activity.getPageViewId();

            expect(pageViewId).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });
    });

    describe('createScaffold', function() {
        it('return full scaffold object', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            var scaffold = activity.createScaffold(true);
            var contextExtra = {
                spt:'http://spid.no',
                'spt:sdkType': 'JS',
                'spt:sdkVersion': '0.1.0'
            };

            expect(scaffold['@context']).to.deep
                .eq(['http://www.w3.org/ns/activitystreams', contextExtra]);
            expect(scaffold['@id']).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(scaffold.actor).to.deep.eq(activity.createActor());
            expect(scaffold.provider).to.deep.eq(activity.createProvider());
        });
    });

    describe('createScaffold', function() {
        it('return full scaffold object', function() {
            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            var scaffold = activity.createScaffold();
            var contextExtra = {
                spt:'http://spid.no',
                'spt:sdkType': 'JS',
                'spt:sdkVersion': '0.1.0'
            };

            expect(scaffold['@context']).to.deep
                .eq(['http://www.w3.org/ns/activitystreams', contextExtra]);
            expect(scaffold['@id']).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(scaffold.actor).to.deep.eq(activity.createReducedActor());
            expect(scaffold.provider).to.deep.eq(activity.createProvider());
        });
    });

    describe('createProvider', function() {
        it('should be possible to override provider options', function() {
            var activity = new Activity({
                pageId: 1,
                clientId: 2,
                activityType: 'Read',
                provider: {
                    'spt:test': 'foo',
                    bar: 'baz'
                }
            });

            var provider = activity.createProvider();

            expect(provider['spt:test']).to.eq('foo');
            expect(provider.bar).to.eq('baz');
        });
    });

    describe('Queue', function() {
        it('should keep each single activity separate', function() {

            var activity = new Activity({ pageId: 1, clientId: 2, activityType: 'Read' });

            activity.events.trackPageLoad('Bacon ipsum', 'Read').queue();
            activity.events.trackPageLoad('Lorum ipsum').queue();
            activity.events.trackPageLoad('Starwars ipsum').queue();

            activity.events.trackPoll(1234).queue();
            activity.events.trackPoll(2345).queue();
            activity.events.trackPoll(3456).queue();

            var activity2 = new Activity({ pageId: 3, clientId: 2, activityType: 'Watch' });

            activity2.events.trackPageLoad('Bacon ipsum', 'Watch').queue();
            var ev = activity2.events.trackPageLoad('Lorum ipsum');
            activity2.events.trackPageLoad('Lorum ipsum').queue();

            activity2.events.trackPoll(1234).queue();
            activity2.events.trackPoll(2345).queue();
            activity2.events.trackPoll(3456).queue();

            ev.addCustomData('primary', { foo: 'bar' });
            ev.queue();

            expect(JSON.stringify(activity2.queue[0])).to.not.eq(JSON.stringify(activity.queue[0]));

            expect(activity2.queue[0]['@type']).to.eq('Watch');
            expect(activity.queue[0]['@type']).to.eq('Read');

            expect(JSON.stringify(activity2.queue[1])).to.not.eq(JSON.stringify(activity.queue[1]));
            expect(JSON.stringify(activity2.queue[2])).to.not.eq(JSON.stringify(activity.queue[2]));
            expect(JSON.stringify(activity2.queue[3])).to.not.eq(JSON.stringify(activity.queue[3]));
            expect(JSON.stringify(activity2.queue[4])).to.not.eq(JSON.stringify(activity.queue[4]));
            expect(JSON.stringify(activity2.queue[5])).to.not.eq(JSON.stringify(activity.queue[5]));

            expect(JSON.stringify(activity2.queue[1])).to.not.eq(JSON.stringify(activity2.queue[2]));
        });
    });

    describe('refreshUserIds', function() {
        beforeEach(function() {
            this.sinon = sinon.sandbox.create();
            this.transportStub = this.sinon.stub();

            this.activity = new Activity({
                pageId: 1,
                clientId: 2,
                transport: this.transportStub,
                url: 'http://test',
                activityType: 'Read',
                userId: 1337,
                visitorId: 1337
            });
        });

        it('should unset the userIds and vistorIds', function() {

            this.transportStub.yields();

            this.activity.refreshUserIds();

            expect(this.activity.visitorId).to.be.undefined;
            expect(this.activity.userId).to.be.undefined;
        });

        it('should set a new userId if available', function() {
            this.transportStub.yields();

            this.activity.refreshUserIds('userId1337');

            expect(this.activity.visitorId).to.be.undefined;
            expect(this.activity.userId).to.eq('userId1337');
        });

        /*it('should request a new ID', function() {
            this.transportStub.yields();

            var stub = this.transportStub;

            this.activity.refreshUserIds('userId1337');

            expect(stub).to.have.been.called;
        });*/
    });
});
