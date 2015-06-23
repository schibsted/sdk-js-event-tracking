'use strict';
/* global requirejs */
/* global define */

requirejs.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min',
		pulse2: 'http://127.0.0.1:8080/dist/autoTracker.min',
		sinon: 'sinon-1.14.1',
		sinSetup: 'sinonSetup'
	},
	shim: {
		sinon: {
			exports: 'sinon'
		},
		sinSetup: {
			deps: ['sinon']
		},
		pulse2: {
			deps: ['sinon', 'sinSetup']
		}
	}
});

requirejs(['sinon', 'sinSetup']);

var AutoTrack;

define(['pulse2'], function(at) {
	AutoTrack = at;
});
