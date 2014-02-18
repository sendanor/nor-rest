/** Sendanor REST client for Node.js */

var util = require('util');
var request = require('./request.js');
var Resource = require('./Resource.js');

/** Element resource */
function ElementResource(data) {
	var self = this;
	Resource.call(this, data);
}

util.inherits(ElementResource, Resource);

// Exports
module.exports = ElementResource;

/* EOF */
