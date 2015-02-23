'use strict';

var expect = require('chai').expect,
    Activity = require('../lib/activity');

describe('Activity', function() {
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

    it('should create a actor', function() {
        var activity = new Activity({ pageId: 1, clientId: 2 });

        var actor = activity.createActor();

        expect(actor['@type']).to.eq('Person');
        expect(actor['@id']).to.eq(1337);
        expect(actor['spt:userAgent']).to.eq(navigator.userAgent);
        expect(actor['spt:screenSize']).to.eq(window.screen.width + 'x' + window.screen.height);
        expect(actor['spt:viewportSize']).to.match(/([0-9]{1,4})x([0-9]{1,4})/);
        expect(actor['spt:acceptLanguage']).to.match(/([a-z|A-Z][a-z|A-Z])/);
    });
});
