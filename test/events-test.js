'use strict';
/*globals sinon*/

var expect = require('chai').expect,
    Activity = require('../lib/activity'),
    Events = require('../lib/events');

describe('Events', function() {
    beforeEach(function() {

        this.sinon = sinon.sandbox.create();
        this.transportStub = this.sinon.stub();

        this.activity = new Activity({
            pageId: 1337,
            clientId: 1337,
            transport: this.transportStub,
            url: 'http://test',
            activityType: 'Read',
            userId: 1337
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should required Activity instance', function() {
        expect(function() {
            new Events();
        }).to.Throw(Error, 'activity required');
    });

    it('should be available on Activity instance', function() {
        expect(this.activity.events).to.be.an.instanceOf(Events);
    });

    it('should have a reference to the Activity instance', function() {
        expect(this.activity).to.eq(this.activity.events.activity);
    });

    it('should create activity with correct object on trackPageLoad', function() {
        var retvar = this.activity.events.trackPageLoad('test title');
        expect(retvar).to.be.a('object');

        var testJSON = JSON.stringify(retvar.data.object);
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: 'test title'
        });
        expect(testJSON).to.eq(answerJSON);

        retvar = this.activity.events.trackPageLoad();
        testJSON = JSON.stringify(retvar.data.object);
        answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(testJSON).to.eq(answerJSON);
    });

    it('should create activity with correct object on trackForm', function() {
        var retvar = this.activity.events.trackForm(1234, 'note');
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'note',
            '@id': 'urn:localhost:page:1337:form:1234'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:localhost:page:1337:form:1234'
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackComment', function() {
        var retvar = this.activity.events.trackComment(1234);
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Note',
            '@id': 'urn:localhost:page:1337:form:1234'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:localhost:page:1337:form:1234'
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackPoll', function() {
        var retvar = this.activity.events.trackPoll(1234);
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Question',
            '@id': 'urn:localhost:page:1337:form:1234'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:localhost:page:1337:form:1234'
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackClick', function() {
        var retvar = this.activity.events.trackClick(1234, 'Test Button', 'article', 98765);
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@id': 'urn:localhost:article:98765:element:1234',
            '@type': 'Link',
            displayName: 'Test Button'
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:localhost:article:98765',
            '@type': 'article'
        });
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackSocial', function() {
        var retvar = this.activity.events.trackSocial(1234, 'Facebook.com');
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:localhost:page:1337:element:1234',
            '@type': 'Link'
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:facebook.com:action:like',
            '@type': 'Service'
        });
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackMediaState', function() {
        var retvar = this.activity.events.trackMediaState(1234, 'video');
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'video',
            '@id': 'urn:localhost:page:1337:video:1234'
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);
    });

    it('should return a array with two objects on trackScroll', function() {
        var retvar = this.activity.events.trackScroll('25%');
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Place',
            '@id': 'urn:localhost:page:1337:scroll:25%',
            'spt:depth': '25%'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);
    });

    it('should return a array with two objects on trackExit', function() {
        var retvar = this.activity.events.trackExit(1234, 'Page');
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1234'
        });
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);
    });

    it('should return a array with two objects on trackEngagement', function() {
        var retvar = this.activity.events.trackEngagementTime(3600);
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        expect(JSON.stringify(testJSON.duration)).to.eq('3600');
    });

    it('should return a array with two objects on trackVisibility', function() {
        var retvar = this.activity.events.trackVisibility('testbox01', {start: 1426153788086, end: 1426153888086});
        expect(retvar).to.be.a('object');

        var testJSON = retvar.data;
        var answerJSON = JSON.stringify({
            '@type': 'Content',
            '@id': 'urn:localhost:page:1337:element:testbox01',
            startTime: 1426153788086,
            endTime: 1426153888086
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        retvar = this.activity.events.trackVisibility('testbox01', 1426153788086);
        testJSON = retvar.data;
        answerJSON = JSON.stringify({
            '@type': 'Content',
            '@id': 'urn:localhost:page:1337:element:testbox01',
            startTime: 1426153788086
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        retvar = this.activity.events.trackVisibility('testbox01', {start: 1426153788086});
        testJSON = retvar.data;
        answerJSON = JSON.stringify({
            '@type': 'Content',
            '@id': 'urn:localhost:page:1337:element:testbox01',
            startTime: 1426153788086
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);
    });

    it('should return standard values on add page standards', function() {
        var retvar = this.activity.events.addPageStandards();
        var answerJSON = JSON.stringify({
            '@type': 'Page',
            '@id': 'urn:localhost:page:1337',
            url: document.URL,
            displayName: document.title
        });

        expect(JSON.stringify(retvar)).to.eq(answerJSON);
    });

    it('should be able to take a custom event', function() {
        var obj = {
            object: {
                foo: 'bar'
            },
            target: {
                foo: 'baz'
            }
        };
        var retvar = this.activity.events.trackCustomEvent(obj, 'Read');
        expect(retvar).to.be.a('object');

        expect(retvar.data.object).to.deep.equal(obj.object);
        expect(retvar.data.target).to.deep.equal(obj.target);

        expect(retvar.data['@type']).to.eq('Read');

        var self = this;

        expect(function() {
            self.activity.events.trackCustomEvent();
        }).to.Throw(Error, 'activityType and obj is required');

        expect(function() {
            self.activity.events.trackCustomEvent(obj);
        }).to.Throw(Error, 'activityType and obj is required');

        expect(function() {
            self.activity.events.trackCustomEvent(undefined, 'Read');
        }).to.Throw(Error, 'activityType and obj is required');

        expect(retvar.objectOrder).to.deep.equal(['object', 'target']);

    });

    it('should return an ID with urn prefix at getUrnIdWithPageType', function() {
        var retvar = this.activity.events.getUrnIdWithPageType();
        expect(retvar).to.eq('urn:localhost:page:1337');

        retvar = this.activity.events.getUrnIdWithPageType(2345);
        expect(retvar).to.eq('urn:localhost:page:2345');

        retvar = this.activity.events.getUrnIdWithPageType('2345');
        expect(retvar).to.eq('urn:localhost:page:2345');

        retvar = this.activity.events.getUrnIdWithPageType('urn:localhost:page:2345');
        expect(retvar).to.eq('urn:localhost:page:2345');

        this.activity.pageId = 'urn:localhost:page:1337';
        retvar = this.activity.events.getUrnIdWithPageType();
        expect(retvar).to.eq('urn:localhost:page:1337');
        this.activity.pageId = 1337;

        retvar = this.activity.events.getUrnIdWithPageType(2345, 'Article');
        expect(retvar).to.eq('urn:localhost:article:2345');
    });

    it('should return a domain from a URL on getDomainFromUrl', function() {

        var urls = [
            {
                url: 'http://vg.no',
                answer: 'vg.no'
            },
            {
                url: 'http://vg.no/23423/test/foo/bar/2134',
                answer: 'vg.no'
            },
            {
                url: 'http://www.vg.no/23423/test/foo/bar/2134',
                answer: 'vg.no'
            },
            {
                url: 'http://127.0.0.1/23423/test/foo/bar/2134',
                answer: '127.0.0.1'
            },
            {
                url: 'http://127.0.0.1:80/23423/test/foo/bar/2134',
                answer: '127.0.0.1'
            },
            {
                url: 'http://pluss.vg.no/#!/23423/2131',
                answer: 'pluss.vg.no'
            },
            {
                url: 'https://finn.no/23423/test/foo/bar/2134',
                answer: 'finn.no'
            },
            {
                url: 'https://www.finn.no/23423/test/foo/bar/2134',
                answer: 'finn.no'
            }
        ];

        for (var i = 0; i < urls.length; i++) {
            var retvar = this.activity.events.getDomainFromUrl(urls[i].url);
            expect(retvar).to.eq(urls[i].answer);
        }
    });
});
