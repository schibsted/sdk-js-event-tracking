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
});
