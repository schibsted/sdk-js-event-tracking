'use strict';

var expect = require('chai').expect,
    Activity = require('../lib/activity'),
    Events = require('../lib/events');

describe('Events', function() {
    beforeEach(function() {
        this.activity = new Activity({
            clientId: 1337,
            siteId: 1337
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
});
