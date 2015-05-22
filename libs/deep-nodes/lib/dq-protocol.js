/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * deep-query protocol for local inheritance (this::../brother) and deep-sheets.
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "./query"], function(require, Querier) {
	/**
	 * deep-query protocol.
	 * options must contain the entry from where start query.
	 *
	 * @param  {String} request a deep-query
	 * @param  {Object} options options object
	 * @return {*}       query result(s).
	 */
	return {
		get: function(request, options) {
			// console.log("dq protocol : get : ", request);
			options = options || {};
			options.keepCache = false;
			var entry = options.entry;
			if (!entry)
				return null;
			var root = entry.root || entry,
				uri = request;
			if (request._deep_request_)
				uri = request.uri;
			if (uri[0] == '#')
				uri = uri.substring(1);
			var res = null;
			if (uri.substring(0, 3) == "../") {
				uri = ((entry.path != "/") ? (entry.path + "/") : "") + uri;
				res = Querier.query(root, uri, options);
			} else if (uri[0] == '/')
				res = Querier.query(root, uri, options);
			else
				res = Querier.query(entry, uri, options);
			return res;
		}
	};
});