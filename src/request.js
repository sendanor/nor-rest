
"use strict";

var Q = require('q');
var HTTPError = require('nor-errors').HTTPError;
var debug = require('nor-debug');
var is = require('nor-is');
var _cookies = require('./cookies.js');
var FUNCTION = require('nor-function');

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

	//debug.log('opts.body = ' , opts.body);
	debug.assert(opts.body).ignore(undefined).is('string');

	url.method = opts.method || 'GET';
	url.headers = opts.headers || {};

	if(opts.body && (url.method === 'POST')) {
		url.headers['Content-Type'] = url.headers['Content-Type'] || 'text/plain;charset=utf8';
		url.headers['Content-Length'] = new Buffer(opts.body, 'utf8').length;
	}

	url.agent = opts.agent;

	if(is.object(opts.params)) {
		url.path += '?' + require('querystring').stringify(opts.params);
	}

	opts.protocol = (''+url.protocol).split(':').shift() || 'http';

	var cookies = _cookies.get(url);
	if(cookies && (cookies.length >= 1)) {
		url.headers.cookie = cookies.join(';');
	}

	return opts;
}

/** Performs generic request */
function do_plain(url, opts) {
	opts = do_args(url, opts);
	if(opts.redirect_loop_counter === undefined) {
		opts.redirect_loop_counter = 10;
	}
	var buffer;
	var d = Q.defer();
	var req = require(opts.protocol).request(opts.url, function(res) {
		var buffer = "";
		res.setEncoding('utf8');
		function collect_chunks(chunk) {
			buffer += chunk;
		}
		res.on('data', collect_chunks);
		res.once('end', function() {

			res.removeListener('data', collect_chunks);

			var content_type = res.headers['content-type'] || undefined;
			//debug.log('content_type = ' , content_type);
			d.resolve( Q.fcall(function() {

				//debug.log('buffer = ', buffer);
				//debug.log('res.headers = ', res.headers);

				if(res.headers && res.headers['set-cookie']) {
					_cookies.set(opts.url, res.headers['set-cookie']);
				}

				if( (res.statusCode >= 301) && (res.statusCode <= 303) ) {
					if(opts.redirect_loop_counter < 0) {
						throw new Error('Redirect loop detected');
					}
					opts.redirect_loop_counter -= 1;
					//debug.log('res.statusCode = ', res.statusCode);
					//debug.log('res.headers.location = ', res.headers.location);
					return do_plain(res.headers.location, {
						'method': 'GET',
						'headers': {
							'accept': opts.url.headers && opts.url.headers.accept
						}
					});
				}
				if(!((res.statusCode >= 200) && (res.statusCode < 400))) {
					throw new HTTPError(res.statusCode, ((content_type === 'application/json') ? JSON.parse(buffer) : buffer) );
				}
				return buffer;
			}) );
		});

	}).once('error', function(e) {
		d.reject(new TypeError(''+e));
	});

	if(opts.body && (url.method !== 'GET')) {
		buffer = is.string(opts.body) ? opts.body : JSON.stringify(opts.body);
		//debug.log('Writing buffer = ', buffer);
		req.end( buffer, 'utf8' );
	} else {
		req.end();
	}

	return d.promise;
}

/** JSON request */
function do_json(url, opts) {
	opts = opts || {};
	if(is.object(opts) && is.defined(opts.body)) {
		opts.body = JSON.stringify(opts.body);
	}
	opts.headers = opts.headers || {};
	if(opts.body) {
		opts.headers['Content-Type'] = 'application/json;charset=utf8';
	}
	opts.headers.Accept = 'application/json';
	return do_plain(url, opts).then(function(buffer) {
		return JSON.parse(buffer);
	});
}

/** JavaScript function request */
function do_js(url, opts) {
	opts = opts || {};
	if(is.object(opts) && is['function'](opts.body)) {
		opts.body = FUNCTION.stringify(opts.body);
	} else if(is.object(opts) && is.string(opts.body)) {
	} else {
		throw new TypeError('opts.body is not function nor string');
	}
	opts.headers = opts.headers || {};
	if(opts.body) {
		opts.headers['Content-Type'] = 'application/javascript;charset=utf8';
	}

	// Default method should be POST since JavaScript code usually might change something.
	if(!opts.method) {
		opts.method = 'post';
	}

	opts.headers.Accept = 'application/json';
	return do_plain(url, opts).then(function(buffer) {
		return JSON.parse(buffer);
	});
}

/** Generic HTTP/HTTPS request */
var mod = module.exports = {};
mod.plain = do_plain;
mod.json = do_json;
mod.js = do_js;

/* EOF */
