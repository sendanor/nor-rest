/** Sendanor REST client for Node.js */

"use strict";

//var is = require('nor-is');
//var debug = require('nor-debug');
//var DATA = require('nor-data');

var Resource = require('./Resource.js');

function rest(url, opts) {
	return Resource.request(url, opts);
}

var rest = module.exports = rest;
rest.request = require('./request.js');
rest.Resource = Resource;
rest.CollectionResource = require('./CollectionResource.js');
rest.ElementResource = require('./ElementResource.js');

/* EOF */
