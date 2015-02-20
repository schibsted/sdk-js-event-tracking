var ao = require('./ActivityObject.js');

var _opt = _opt || {};
_opt.clientId = 'sp_2342';
_opt.pageId = 'urn:test.no:page01';

console.log(ao.activity(_opt));
