'use strict';

var expect = require('chai').expect,
    Activity = require('../lib/activity');

describe('Activity', function() {
    it('should require clientId and siteId', function() {
        expect(function() {
            new Activity({ siteId: 1337 });
        }).to.Throw(Error, 'clientId is required');

        expect(function() {
            new Activity({ clientId: 1337 });
        }).to.Throw(Error, 'siteId is required');
    });
});
