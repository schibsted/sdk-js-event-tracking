/*global buster, describe, it, before, Activity, Events*/
'use strict';

buster.spec.expose();

var assert = buster.assert;

describe('Events', function() {
    before(function() {
        this.activity = new Activity({
            clientId: 1337,
            siteId: 1337
        });
    });

    it('should be available on Activity instance', function() {
        assert.isObject(this.activity.events);
    });

    it('should have a reference to the Activity instance', function() {
        assert.same(this.activity, this.activity.events.activity);
    });
});
