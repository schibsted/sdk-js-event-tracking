/*global buster, describe, it, Activity*/
'use strict';

buster.spec.expose();

var assert = buster.assert;

describe('Activity', function() {
    it('should require clientId', function() {
        assert.exception(function() {
            var activity = new Activity({ siteId: 1337 });
        }, { name: 'Error', message: 'clientId is required'});
    });

    it('should require siteId', function() {
        assert.exception(function() {
            var activity = new Activity({ clientId: 1337 });
        }, { name: 'Error', message: 'siteId is required'});
    });
});
