/** Sendanor REST client for Node.js */

var util = require('util');
var request = require('./request.js');
var Resource = require('./Resource.js');

/** Collection resource */
function CollectionResource(data) {
	var self = this;
	Resource.call(this, data);
}

util.inherits(CollectionResource, Resource);

// Exports

module.exports = CollectionResource;

/* EOF */
