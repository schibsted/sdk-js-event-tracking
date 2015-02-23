'use strict';

var expect = require('chai').expect,
    Activity = require('../lib/activity'),
    Events = require('../lib/events');

describe('Events', function() {
    beforeEach(function() {
        this.activity = new Activity({
            clientId: 1337,
            pageId: 1337
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

    it('should return a array with a object on trackPageLoad', function() {
        var testJSON = this.activity.events.trackPageLoad('test title');
        testJSON = JSON.stringify(testJSON[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: 'test title'
            }
        });
        expect(testJSON).to.eq(answerJSON);
    });

    it('should return a array with two objects on trackForm', function() {
        var retvar = this.activity.events.trackForm(1234, 'note');
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            result: {
                '@type': 'note',
                '@id': '1337:form:1234'
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackComment', function() {
        var retvar = this.activity.events.trackComment(1234);
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            result: {
                '@type': 'Note',
                '@id': '1337:form:1234'
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackComment', function() {
        var retvar = this.activity.events.trackPoll(1234, 'Question');
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            result: {
                '@type': 'Question',
                '@id': '1337:form:1234'
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with three objects on trackSocial', function() {
        var retvar = this.activity.events.trackSocial(1234, 'Facebook.com');
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            origin: {
                '@id': '1337:element:1234',
                '@type': 'Link'
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[2]);
        answerJSON = JSON.stringify({
            target: {
                '@id': 'urn:Facebook.com',
                '@type': 'Service'
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackMediaState', function() {
        var retvar = this.activity.events.trackMediaState(1234, 'video');
        var testJSON = JSON.stringify(retvar[1]);
        var answerJSON = JSON.stringify({
            origin: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[0]);
        answerJSON = JSON.stringify({
            object: {
                '@type': 'video',
                '@id': 1234
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackScroll', function() {
        var retvar = this.activity.events.trackScroll('25%');
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            result: {
                '@type': 'Place',
                '@id': '1337:scroll:25%',
                location: '25%'
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackClick', function() {
        var retvar = this.activity.events.trackClick(1234, 'Test Button', 'article', 98765);
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@id': '1337:element:1234',
                '@type': 'Link',
                displayName: 'Test Button'
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            target: {
                '@id': 98765,
                '@type': 'article'
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return a array with two objects on trackExit', function() {
        var retvar = this.activity.events.trackExit(1234, 'page');
        var testJSON = JSON.stringify(retvar[0]);
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title
            }
        });
        expect(testJSON).to.eq(answerJSON);

        testJSON = JSON.stringify(retvar[1]);
        answerJSON = JSON.stringify({
            target: {
                '@type': 'page',
                '@id': 1234
            }
        });
        expect(testJSON).to.eq(answerJSON);

    });

    it('should return true if a property is added to a object', function() {
        this.activity.events.trackSocial(1234, 'Facebook.com');

        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title,
                foo: 'bar'
            }
        });
        expect(this.activity.events.addProperty('primary', 'foo', 'bar')).to.eq(true);

        var testJSON = JSON.stringify(this.activity.events.primaryObj);
        expect(testJSON).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            origin: {
                '@id': '1337:element:1234',
                '@type': 'Link',
                foo: 'bar'
            }
        });
        expect(this.activity.events.addProperty('secondary', 'foo', 'bar')).to.eq(true);
        testJSON = JSON.stringify(this.activity.events.secondaryObj);
        expect(testJSON).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            target: {
                '@id': 'urn:Facebook.com',
                '@type': 'Service',
                foo: 'bar'
            }
        });
        expect(this.activity.events.addProperty('tertiary', 'foo', 'bar')).to.eq(true);
        testJSON = JSON.stringify(this.activity.events.tertiaryObj);
        expect(testJSON).to.eq(answerJSON);

        expect(function() {
            var ao = new Activity({
                clientId: 1337,
                pageId: 1337
            });
            ao.events.addProperty('object', 'foo', 'bar');
        }).to.Throw(Error, 'Object reference not valid');

    });

    it('should return true if a value is added to spt:custom', function() {
        this.activity.events.trackSocial(1234, 'Facebook.com');
        var answerJSON = JSON.stringify({
            object: {
                '@type': 'page',
                '@id': 1337,
                url: document.URL,
                displayName: document.title,
                'spt:custom': {
                    foo: 'bar'
                }
            }
        });
        expect(this.activity.events.addCustomData('primary', {foo:'bar'})).to.eq(true);

        var testJSON = JSON.stringify(this.activity.events.primaryObj);
        expect(testJSON).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            origin: {
                '@id': '1337:element:1234',
                '@type': 'Link',
                'spt:custom': {
                    foo: 'bar',
                    '@type': 'link'
                }
            }
        });
        expect(this.activity.events.addCustomData('secondary', {foo:'bar', '@type': 'link'})).to.eq(true);
        testJSON = JSON.stringify(this.activity.events.secondaryObj);
        expect(testJSON).to.eq(answerJSON);

        answerJSON = JSON.stringify({
            target: {
                '@id': 'urn:Facebook.com',
                '@type': 'Service',
                'spt:custom': {
                    foo: 'bar'
                }
            }
        });
        expect(this.activity.events.addCustomData('tertiary', {foo:'bar'})).to.eq(true);
        testJSON = JSON.stringify(this.activity.events.tertiaryObj);
        expect(testJSON).to.eq(answerJSON);

        expect(function() {
            var ao = new Activity({
                clientId: 1337,
                pageId: 1337
            });
            ao.events.addCustomData('object', {foo:'bar', '@type': 'link'});
        }).to.Throw(Error, 'Object reference not valid');

    });

    it('should do nothing (for now) when sending', function() {
        expect(this.activity.events.send()).to.eq(true);
    });
});
