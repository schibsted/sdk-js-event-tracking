/* global sinon */
/* jshint unused: false */
'use strict';
var requests = [];
var server = sinon.fakeServer.create();
var input = {
	data: {
		userId: 'abcd1234',
		sessionId: 'abcd2345',
		visitorId: 'abcd3456',
		environmentId: 'abcd4567',
		cisCookieSet: true
	}
};
server.respondWith([200, {'Content-Type': 'application/json; charset=utf-8}'}, JSON.stringify(input)]);

server.autoRespond = true;
server.autoRespondAfter = 100;
