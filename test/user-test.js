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
        sinon.stub(User.prototype, 'getUserIdFromService');

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
        User.prototype.getUserIdFromService.restore();
    });

    it('should send given data to CIS', function(done) {
        var ids = {environmentId: '32425'};
        var user = new User(this.activity);

        var stub = this.transportStub;

        var input = {
            data: {
                userId: 'abcd1234',
                sessionId: 'abcd2345',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                cisCookieSet: true
            }
        };

        stub.yields(JSON.stringify(input));

        user.getUserIdFromService(ids, function() {
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
                sessionId: 'abcd2345',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                cisCookieSet: true
            }
        };

        stub.yields(null, {response: JSON.stringify(input)});

        user.getUserIdFromService(ids, function(err, idObj) {

            expect(idObj.userId).to.eq('abcd1234');
            expect(idObj.sessionId).to.eq('abcd2345');
            expect(idObj.visitorId).to.eq('abcd3456');
            expect(idObj.environmentId).to.eq('abcd4567');
            done();
        });
    });

    it('should set IDs in the idObj 2', function(done) {
        var user = new User(this.activity);

        var stub = this.transportStub;

        var input = {
            data: {
                userId: 'abcd1234',
                sessionId: 'abcd2345',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                cisCookieSet: true,
            }
        };

        stub.yields(null, {response: JSON.stringify(input)});

        user.getUserId(function(err, idObj) {

            expect(idObj.userId).to.eq('abcd1234');
            expect(idObj.sessionId).to.eq('abcd2345');
            expect(idObj.visitorId).to.eq('abcd3456');
            expect(idObj.envId).to.eq('abcd4567');
            done();
        });
    });

    it('should understand a temporary ID', function(done) {
        var user = new User(this.activity);

        var stub = this.transportStub;

        var input = {
            data: {
                userId: 'abcd1234',
                sessionId: 'abcd2345',
                visitorId: 'abcd3456',
                environmentId: 'abcd4567',
                environmentIdTemporary: true,
                cisCookieSet: true
            }
        };

        stub.yields(null, {response: JSON.stringify(input)});

        user.getUserId(function(err, idObj) {

            expect(idObj.temporaryId).to.eq(true);
            done();
        });
    });

});
