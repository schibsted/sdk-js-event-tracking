'use strict';

var expect = require('chai').expect,
    Activity = require('../lib/activity'),
    Events = require('../lib/events');

describe('Events', function() {
    beforeEach(function() {
        this.activity = new Activity({
            clientId: 1337,
            pageId: 1337,
            activityType: 'Read'
        });
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

        var testJSON = this.activity.events.activityObj;
        testJSON = JSON.stringify(testJSON.object);
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: 'test title'
        });
        expect(testJSON).to.eq(answerJSON);
    });

    it('should create activity with correct object on trackForm', function() {
        var retvar = this.activity.events.trackForm(1234, 'note');
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'note',
            '@id': '1337:form:1234'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);
    });

    it('should create activity with correct object on trackComment', function() {
        var retvar = this.activity.events.trackComment(1234);
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Note',
            '@id': '1337:form:1234'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackPoll', function() {
        var retvar = this.activity.events.trackPoll(1234);
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Question',
            '@id': '1337:form:1234'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackClick', function() {
        var retvar = this.activity.events.trackClick(1234, 'Test Button', 'article', 98765);
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@id': '1337:element:1234',
            '@type': 'Link',
            displayName: 'Test Button'
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 98765,
            '@type': 'article'
        });
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

    });

    it('should create activity with correct object on trackSocial', function() {
        var retvar = this.activity.events.trackSocial(1234, 'Facebook.com');
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': '1337:element:1234',
            '@type': 'Link'
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:Facebook.com',
            '@type': 'Service'
        });
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackMediaState', function() {
        var retvar = this.activity.events.trackMediaState(1234, 'video');
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'video',
            '@id': 1234
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);
    });

    it('should return a array with two objects on trackScroll', function() {
        var retvar = this.activity.events.trackScroll('25%');
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'Place',
            '@id': '1337:scroll:25%',
            location: '25%'
        });
        expect(JSON.stringify(testJSON.result)).to.eq(answerJSON);
    });

    it('should return a array with two objects on trackExit', function() {
        var retvar = this.activity.events.trackExit(1234, 'page');
        expect(retvar).to.be.a('object');

        var testJSON = this.activity.events.activityObj;
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title
        });
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1234
        });
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);
    });

    it('should update the object', function() {
        this.activity.events.trackSocial(1234, 'Facebook.com');

        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title,
            foo: 'bar'
        });
        this.activity.events.addProperty('primary', 'foo', 'bar');
        var testJSON = this.activity.events.activityObj;
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': '1337:element:1234',
            '@type': 'Link',
            foo: 'bar'
        });
        this.activity.events.addProperty('secondary', 'foo', 'bar');
        var testJSON = this.activity.events.activityObj;
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:Facebook.com',
            '@type': 'Service',
            foo: 'bar'
        });
        this.activity.events.addProperty('tertiary', 'foo', 'bar');
        var testJSON = this.activity.events.activityObj;
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

        expect(function() {
            var ao = new Activity({
                clientId: 1337,
                pageId: 1337,
                activityType: 'Read'
            });
            ao.events.addProperty('object', 'foo', 'bar');
        }).to.Throw(Error, 'Object reference not valid');
    });

    it('should update the object when a value is added to spt:custom', function() {
        this.activity.events.trackSocial(1234, 'Facebook.com');
        var answerJSON = JSON.stringify({
            '@type': 'page',
            '@id': 1337,
            url: document.URL,
            displayName: document.title,
            'spt:custom': {
                foo: 'bar'
            }
        });
        this.activity.events.addCustomData('primary', {foo:'bar'});
        var testJSON = this.activity.events.activityObj;
        expect(JSON.stringify(testJSON.object)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': '1337:element:1234',
            '@type': 'Link',
            'spt:custom': {
                foo: 'bar'
            }
        });
        this.activity.events.addCustomData('secondary', {foo:'bar'});
        var testJSON = this.activity.events.activityObj;
        expect(JSON.stringify(testJSON.origin)).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            '@id': 'urn:Facebook.com',
            '@type': 'Service',
            'spt:custom': {
                foo: 'bar'
            }
        });
        this.activity.events.addCustomData('tertiary', {foo:'bar'});
        var testJSON = this.activity.events.activityObj;
        expect(JSON.stringify(testJSON.target)).to.eq(answerJSON);

        expect(function() {
            var ao = new Activity({
                clientId: 1337,
                pageId: 1337,
                activityType: 'Read'
            });
            ao.events.addCustomData('object', {foo:'bar', '@type': 'link'});
        }).to.Throw(Error, 'Object reference not valid');

    });
});
