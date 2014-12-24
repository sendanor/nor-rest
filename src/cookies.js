
"use strict";

var ARRAY = require('nor-array');
var debug = require('nor-debug');
var is = require('nor-is');

/** Simple host-based global cookie cache
 * @FIXME: Global things are bad.
 */
var _cookies = {};

/** Get Cookie header line for an URL
 * @params url {object} The parsed object
 */
function get_cookies(url) {
	debug.assert(url).is('object');
	debug.assert(url.host).is('string');

	if(!is.array(_cookies[url.host])) {
		//debug.log('No cookies for host ', url.host);
		return undefined;
	}

	var cookies = ARRAY(_cookies[url.host]).map(function(cookie) {
		var i = cookie.indexOf(';');
		return cookie.substr(0, ((i >= 1) ? i : cookie.length));
	}).valueOf();

	//debug.log('Cookies found (for host ', url.host ,'): ', cookies);

	return cookies;
}

/** Update cookie cache
 * @params url {object} The parsed URL object
 * @params cookies {array|string} The array of cookies or single cookie
 */
function set_cookies(url, cookies) {
	if(is.string(cookies)) {
		cookies = [cookies];
	}
	debug.assert(url).is('object');
	debug.assert(url.host).is('string');
	debug.assert(cookies).is('array');

	//debug.log('Saving cookies for host = ', url.host);

	if(!is.array(_cookies[url.host])) {
		_cookies[url.host] = cookies;
		//debug.log('Saved new cookies as: ', _cookies[url.host]);
		return;
	}

	var tmp = {};

	function save_cookie(cookie) {
		var i = cookie.indexOf('=');
		var name = cookie.substr(0, ((i >= 1) ? i : cookie.length));
		tmp[name] = cookie;
	}

	ARRAY(_cookies[url.host]).forEach(save_cookie);
	ARRAY(cookies).forEach(save_cookie);

	_cookies[url.host] = ARRAY(Object.keys(tmp)).map(function(key) { return tmp[key]; }).valueOf();

	//debug.log('Saved new cookies as: ', _cookies[url.host]);
}


/** Generic cookie support */
var mod = module.exports = {};
mod.get = get_cookies;
mod.set = set_cookies;

/* EOF */
