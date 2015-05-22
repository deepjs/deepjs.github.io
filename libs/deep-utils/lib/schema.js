/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require" /*, "../compiler"*/ ], function(require /*, compiler*/ ) {

	var schemaUtils = {};

	var digit = /^[0-9]*$/;
	schemaUtils.retrieveFullSchemaByPath = function(schema, path, delimitter) {
		path = path + "";
		if (path == '/')
			return schema;
		if (path[0] == "/" || path.substring(0, 1) == "./")
			delimitter = "/";
		var parts = path.split(delimitter || ".");
		if (delimitter == "/" && (parts[0] === "" || parts[0] == "."))
			parts.shift();
		if (parts.length == 0)
			return schema;
		var tmp = schema;
		while (parts.length > 1 && tmp) {
			var part = parts.shift();
			if (part.match(digit)) {
				if (tmp.type == "array") {
					tmp = tmp.items || null;
					continue;
				}
			}
			if (!tmp.properties || !tmp.properties[part])
				return null;
			tmp = tmp.properties[part];
		}
		if (!tmp)
			return null;

		var lastPart = parts.shift();
		var res = [];
		if (lastPart.match(/^[0-9]*$/)) {
			if (tmp.type == "array") {
				tmp = tmp.items || {};
				res.push(tmp);
			}
			// TODO : gestion pattern items
		} else {
			if (tmp.properties && tmp.properties[lastPart])
				res.push(tmp.properties[lastPart]);
			/*if (tmp.patternProperties)
				for (var i in tmp.patternProperties)
					if (new RegExp(i).test(lastPart))
						res.push(tmp.patternProperties[i]);*/
			if (res.length === 0)
				if (tmp.additionalProperties === undefined || tmp.additionalProperties === false)
					return null;
				else
					return tmp.additionalProperties;
		}

		var finalSchema = {};
		/*if (res.length > 1)
			res.forEach(function(e) {
				finalSchema = compiler.aup(e, finalSchema);
			});
		else */
		if (res.length == 1)
			finalSchema = res[0];
		else
			return null;
		return finalSchema;
	};

	schemaUtils.schemaByValuePath = function(schema, path, pathDelimiter) {
		//console.log("retrieveSchemaByPath : ", schema, path);
		if (path[0] == "/" || path.substring(0, 1) == "./")
			pathDelimiter = "/";
		var parts = path.split(pathDelimiter || ".");
		if (pathDelimiter == "/" && (parts[0] === "" || parts[0] == "."))
			parts.shift();
		var tmp = schema;
		while (parts.length > 1) {
			var part = parts.shift();
			if (!tmp.properties || !tmp.properties[part])
				return undefined;
			tmp = tmp.properties[part];
		}
		if (tmp && tmp.properties)
			return tmp.properties[parts.shift()];
		else
			return undefined;
	};

	schemaUtils.getValuesQueryBySchemaPath = function(object, schemaPath, pathDelimiter) {
		if (path[0] == "/" || path.substring(0, 1) == "./")
			pathDelimiter = "/";

		if (pathDelimiter == '/') {
			schemaPath = schemaPath.replace(/\/properties/, '');
			schemaPath = schemaPath.replace(/\/items/, '[]');
		} else {
			schemaPath = schemaPath.replace(/\./, '/');
			schemaPath = schemaPath.replace(/\/properties/, '');
			schemaPath = schemaPath.replace(/\/items/, '[]');
			schemapPath = '/' + schemaPath;
		}
		return schemaPath;
	};


	return schemaUtils;
});