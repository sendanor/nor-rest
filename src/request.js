
"use strict";

var Q = require('q');
var HTTPError = require('nor-errors').HTTPError;
var debug = require('nor-debug');
var is = require('nor-is');

/** Parse arguments */
function do_args(url, opts) {

	// url
	if(is.string(url)) {
		url = require('url').parse(url, true);
	}
	debug.assert(url).is('object');

	// opts
	opts = opts || {};
	debug.assert(opts).is('object');

	opts.url = url;
	opts.body = opts.body ? opts.body : undefined;

	debug.log('opts.body = ' , opts.body);
	debug.assert(opts.body).ignore(undefined).is('string');

	url.method = opts.method || 'GET';
	url.headers = url.headers || {};

	if(opts.body && (url.method === 'POST')) {
		url.headers['Content-Type'] = url.headers['Content-Type'] || 'text/plain';
		url.headers['Content-Length'] = opts.body.length;
	}

	url.agent = opts.agent;

	if(is.object(opts.params)) {
		url.query = opts.params;
	}

	opts.protocol = (''+url.protocol).split(':').shift() || 'http';

	return opts;
}

/** Performs generic request */
function do_plain(url, opts) {
	opts = do_args(url, opts);
	var d = Q.defer();
	var req = require(opts.protocol).request(opts.url, function(res) {
		var buffer = "";
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('end', function() {
			var content_type = res.headers['content-type'] || undefined;
			debug.log('content_type = ' , content_type);
			d.resolve( Q.fcall(function() {
				if(res.statusCode !== 200) {
					throw new HTTPError(res.statusCode, ((content_type === 'application/json') ? JSON.parse(buffer) : buffer) );
				}
				return buffer;
			}) );
		});

	}).on('error', function(e) {
		d.reject(new TypeError(''+e));
	});

	if(opts.body && (url.method !== 'GET')) {
		req.write( opts.body );
	}
	req.end();

	return d.promise;
}

/** JSON request */
function do_json(url, opts) {
	if(is.object(opts) && is.defined(opts.body)) {
		opts.body = JSON.stringify(opts.body);
	}
	opts = do_args(url, opts);
	opts.url.headers['Content-Type'] = 'application/json';
	return do_plain(opts.url, opts).then(function(buffer) {
		return JSON.parse(buffer);
	});
}

/** Generic HTTP/HTTPS request */
var mod = module.exports = {};
mod.plain = do_plain;
mod.json = do_json;

/* EOF */
