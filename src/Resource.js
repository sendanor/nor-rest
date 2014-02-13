/** Sendanor REST client for Node.js */

var is = require('nor-is');
var debug = require('nor-debug');
var DATA = require('nor-data');
var REQUEST = require('./request.js');

/** Generic resource */
function Resource(data) {
	var self = this;
	Object.keys(data).forEach(function(key) {
		self[key] = data[key];
	});
}

/** Converts plain resource as a Resource object with methods */
Resource.parse = function resource_parse(body) {
	var rest = require('./index.js');
	var obj;
	if(is.array(body)) {
		return body.map(resource_parse);
    } else if(body instanceof rest.Resource) {
		return body;
	} else if(is.object(body) && is.defined(body.$ref) && is.array(body.items)) {
		return new rest.CollectionResource( DATA.object(body).map(resource_parse) );
	} else if(is.object(body) && is.defined(body.$ref)) {
		return new rest.ElementResource( DATA.object(body).map(resource_parse) );
	} else if(is.object(body)) {
		return DATA.object(body).map(resource_parse);
	} else {
		return body;
	}
}

/** Smart hypermedia request  */
Resource.request = function(url, opts) {
	return REQUEST.json(url, opts).then(function(body) {
		return Resource.parse(body);
	});
};

/** Request the same resource again */
Resource.prototype._request = function(opts) {
	var self = this;
	debug.assert(self).is('object');
	debug.assert(self.$ref).is('string');
	return Resource.request(self.$ref, opts);
};

/** Request the same resource with GET method with params */
Resource.prototype.GET = function(params, opts) {
	var self = this;
	opts = opts || {};
	debug.assert(self).is('object');
	debug.assert(opts).is('object');
	debug.assert(self._request).is('function');
	opts.method = 'GET';
	opts.params = params;
	return self._request(opts);
};

/** Request the same resource with POST method with body */
Resource.prototype.POST = function(body, opts) {
	var self = this;
	opts = opts || {};
	debug.assert(self).is('object');
	debug.assert(opts).is('object');
	debug.assert(self._request).is('function');
	opts.method = 'POST';
	opts.body = body;
	return self._request(opts);
};

/** Request the same resource with POST method with body */
Resource.prototype.PUT = function(body, opts) {
	var self = this;
	opts = opts || {};
	debug.assert(self).is('object');
	debug.assert(opts).is('object');
	debug.assert(self._request).is('function');
	opts.method = 'PUT';
	opts.body = body;
	return self._request(opts);
};

/** Request the same resource with DELETE method with body */
Resource.prototype.DELETE = function(body, opts) {
	var self = this;
	opts = opts || {};
	debug.assert(self).is('object');
	debug.assert(opts).is('object');
	debug.assert(self._request).is('function');
	opts.method = 'DELETE';
	opts.body = body;
	return self._request(opts);
};

// Exports

module.exports = Resource;

/* EOF */
