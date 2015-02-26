/*jshint -W030, -W024, -W079 */
/*
 We can not just require sinon because of a bug (webpack/webpack/issues/177).
 So we use the karma plugin sinon-chai to inject them as globals as a workaround
 */
/*globals sinon, expect*/
'use strict';

var User = require('../lib/user');
