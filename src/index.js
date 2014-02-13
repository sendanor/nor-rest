/** Sendanor REST client for Node.js */

var is = require('nor-is');
var debug = require('nor-debug');
var DATA = require('nor-data');

var rest = module.exports = {};
rest.request = require('./request.js');
rest.Resource = require('./Resource.js');
rest.CollectionResource = require('./CollectionResource.js');
rest.ElementResource = require('./ElementResource.js');

/* EOF */
