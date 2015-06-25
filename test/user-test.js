/* global expect */
/* global sinon */

'use strict';

var User = require('../lib/user');
var Activity = require('../lib/activity');
var browserTransport = require('../lib/transport/browser');

describe('User', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.transportStub = this.sinon.stub();

        this.activity = new Activity({
            pageId: 1,
            clientId: 2,
            transport: this.transportStub,
            url: 'http://test',
            userServiceUrl: 'http://test',
            activityType: 'Read',
            userId: 1337,
            visitorId: 1337
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should be able to take a transport from opts or not', function() {
        var user = new User(this.activity);

        expect(user.transport).to.eq(this.transportStub);

        sinon.stub(User.prototype, 'getUserId');
        sinon.stub(User.prototype, 'getIdsFromService');

        var act = new Activity({
            pageId: 1,
            clientId: 2,
            activityType: 'Read',
            url: 'http://test',
            userServiceUrl: 'http://test',
            userId: 1337,
            visitorId: 1337
        });

        var user2 = new User(act);

        expect(user2.transport).to.eq(browserTransport);

        User.prototype.getUserId.restore();
        User.prototype.getIdsFromService.restore();
    });

    it('should send given data to CIS', function(done) {
        var ids = {environmentId: '32425'};
        var user = new User(this.activity);

        var stub = this.transportStub;

        var input = {
            data: {
                userId: 'abcd1234',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                cisCookieSet: true
            }
        };

        stub.yields(JSON.stringify(input));

        user.getIdsFromService(ids, function() {
            expect(stub).to.have.been.calledWith('http://test', ids);
            done();
        });
    });

    it('should set IDs in the idObj', function(done) {
        var ids = {environmentId: '32425'};
        var user = new User(this.activity);

        var stub = this.transportStub;

        var input = {
            data: {
                userId: 'abcd1234',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                cisCookieSet: true
            }
        };

        stub.yields(null, {response: JSON.stringify(input)});

        user.getIdsFromService(ids, function(err, idObj) {

            expect(idObj.visitorId).to.eq('abcd3456');
            expect(idObj.environmentId).to.eq('abcd4567');
            done();
        });
    });

    it('should set IDs in the idObj 2', function(done) {

		resetEnvId();

        var user = new User(this.activity);

        var stub = this.transportStub;

        var input = {
            data: {
                userId: 'abcd1234',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                cisCookieSet: true
            }
        };

        stub.yields(null, {response: JSON.stringify(input)});

        user.getUserId(function(err, idObj) {

            expect(idObj.visitorId).to.eq('abcd3456');
            expect(idObj.envId).to.eq('abcd4567');
            done();
        });
    });

    it('should return IDs or delete cookies', function() {
       var getCookie = this.sinon.stub(User.prototype, 'getCookie');
       var deleteCookie = this.sinon.stub(User.prototype, 'deleteCookie');
       getCookie.returns('abcd,1234');
       var user = new User(this.activity);
       var targetObj = {
           environmentId: 'abcd',
           visitorId: '1234'
       };

       var retObj = user.getIdsFromCookie();

       expect(retObj).to.deep.eq(targetObj);

       getCookie.returns('abcd,undefined');
       retObj = user.getIdsFromCookie();
       expect(deleteCookie).to.have.been.calledWith('_pulse2data');

       getCookie.returns('abcd');
       retObj = user.getIdsFromCookie();
       expect(deleteCookie).to.have.been.calledWith('_pulse2data');

       getCookie.returns('abcd,1234,xcvb');
       retObj = user.getIdsFromCookie();
       expect(deleteCookie).to.have.been.calledWith('_pulse2data');

       User.prototype.getCookie.restore();
       User.prototype.deleteCookie.restore();
    });

});

function resetEnvId() {
	document.cookie = '_DataTrackerEnv=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}
