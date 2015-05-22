/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deep-utils/index"], function(require, utils) {
	"use strict";

	function getJSPrimitiveType(obj) {
		if (obj && obj.forEach)
			return "array";
		return typeof obj;
	}

	var compiler = {};
	compiler.Shared = function(datas) {
		datas._deep_shared_ = true;
		return datas;
	};
	compiler.compile = function() {
		var base = utils.copy(arguments[0]);
		var len = arguments.length;
		for (var i = 1; i < len; ++i)
			compiler.aup(arguments[i], base);
		return base;
	};
	compiler.decorateUpFrom = function(src, target, properties) {
		properties.forEach(function(prop) {
			if (typeof src[prop] !== 'undefined')
				target[prop] = compiler.aup(src[prop], target[prop]);
		});
	};
	compiler.decorateBottomFrom = function(src, target, properties) {
		properties.forEach(function(prop) {
			if (typeof src[prop] !== 'undefined')
				target[prop] = compiler.abottom(src[prop], target[prop]);
		});
	};
	compiler.upFromArgs = function(base, args, opt) {
		for (var len = args.length - 1; len > -1; --len)
			base = compiler.aup(args[len], base, opt);
		return base;
	};
	compiler.bottomFromArgs = function(base, args, opt) {
		for (var len = args.length - 1; len > -1; --len)
			base = compiler.abottom(args[len], base, opt);
		return base;
	};

	compiler.aup = function(src, target, opt) {
		if (typeof src === 'undefined')
			return target;
		if (src === null)
			return null;
		opt = opt || {};
		if (typeof target === 'undefined' || target === null)
			return utils.copy(src, false, opt.excludeGrounds);
		if (target._deep_compiler_) {
			target = target._up(src);
			return target;
		}
		if (src._deep_compiler_) {
			if (src._clone)
				src = src._clone();
			return src._bottom(target);
		}
		if (src._deep_shared_) {
			src._deep_shared_ = false;
			target = compiler.abottom(target, src);
			src._deep_shared_ = true;
			return target;
		}
		if (target._deep_shared_) {
			target._deep_shared_ = false;
			target = compiler.abottom(target, src);
			target._deep_shared_ = true;
			return target;
		}
		var srcType = getJSPrimitiveType(src);
		var targetType = getJSPrimitiveType(target);
		if (srcType !== targetType) {
			target = utils.copy(src, false, opt.excludeGrounds);
			return target;
		}
		switch (srcType) {
			case 'array':
				var result = compiler.upArray(src, target);
				return result;
			case 'object':
				if (src instanceof RegExp)
					return src;
				if (src instanceof Date) {
					target = new Date(src.valueOf());
					return target;
				}
				for (var i in src) {
					if (i == '_backgrounds' || i == '_foregrounds' || i == "_transformations")
						if (opt.excludeGrounds)
							continue;
						else {
							target[i] = target[i] ? target[i].concat(src[i]) : src[i].slice();
							continue;
						}
					if (typeof target[i] === 'undefined') {
						target[i] = utils.copy(src[i]);
						continue;
					}
					if (src[i] === null) {
						target[i] = null;
						continue;
					}

					if (typeof src[i] === 'object' || typeof src[i] === 'function') {
						target[i] = compiler.aup(src[i], target[i]); //, target, i);
					} else
						target[i] = src[i];
					if (target[i] && target[i]._deep_remover_)
						delete target[i];
				}
				return target;
			default:
				return src;
		}
	};
	compiler.abottom = function(src, target, opt) {
		opt = opt || {};
		if (src === null || typeof src === "undefined")
			return target;
		if (target === null)
			return target;
		if (typeof target === 'undefined') {
			target = utils.copy(src, false, opt.excludeGrounds);
			return target;
		}
		if (target._deep_compiler_) {
			target = target._bottom(src);
			return target;
		}
		if (src._deep_compiler_) {
			if (src._clone)
				src = src._clone();
			src._up(target);
			return src;
		}
		if (src._deep_shared_) {
			src._deep_shared_ = false;
			src = compiler.aup(target, src);
			src._deep_shared_ = true;
			return src;
		}
		if (target._deep_shared_) {
			target._deep_shared_ = false;
			src = compiler.aup(target, src); //, parent, key);
			target._deep_shared_ = true;
			return src;
		}
		var srcType = getJSPrimitiveType(src);
		var targetType = getJSPrimitiveType(target);
		if (srcType !== targetType)
			return target;
		switch (srcType) {
			case 'array':
				var result = compiler.bottomArray(src, target);
				return result;
			case 'object':

				for (var i in src) {
					if (i == '_backgrounds' || i == '_foregrounds' || i == "_transformations")
						if (opt.excludeGrounds)
							continue;
						else {
							target[i] = target[i] ? src[i].concat(target[i]) : src[i].slice();
							continue;
						}
					if (src[i] !== null) {
						if (typeof target[i] === 'undefined')
							target[i] = utils.copy(src[i]);
						else if (typeof src[i] === 'object' || typeof src[i] === 'function')
							target[i] = compiler.abottom(src[i], target[i]); //, target, i);
						if (target[i] && target[i]._deep_remover_)
							delete target[i];
					}
				}
				var copied = utils.shallowCopy(target);
				for (i in target)
					delete target[i];
				for (i in src) {
					if ((i == '_backgrounds' || i == '_foregrounds' || i == '_transformations') && opt.excludeGrounds)
						continue;
					target[i] = copied[i];
					delete copied[i];
				}
				for (i in copied)
					target[i] = copied[i];
				return target;
			default:
				return target;
		}
	};

	/**
	 * up : merge object from up
	 * @return {Dynamic}      the merged object
	 */
	compiler.up = function() {
		var target = arguments[0];
		for (var i = 1, len = arguments.length; i < len; i++)
			target = compiler.aup(arguments[i], target);
		return target;
	};
	/**
	 * bottom : merge object from bottom
	 * @return {Dynamic}        the merged object
	 */
	compiler.bottom = function() {
		var target = arguments[arguments.length - 1],
			src = arguments[0];
		for (var i = arguments.length - 2; i > 0; i--)
			target = compiler.abottom(arguments[i], target);
		return compiler.abottom(src, target);
	};

	compiler.bottomArray = function(src, target, mergeOn, excludeGrounds) {
		if (src.length === 0)
			return target;
		var map = {};
		var len = src.length,
			val = null,
			i = 0;
		for (; i < len; ++i) {
			var a = src[i];
			if (a && mergeOn)
				val = utils.fromPath(a, mergeOn);
			else if (a && a.id)
				val = a.id;
			else
				val = String(a);
			map[val] = {
				ref: a,
				index: i
			};
		}
		Array.prototype.unshift.apply(target, src); // prepend src to target
		var elem = target[i]; // check target from target[src.length]
		while (i < target.length) // seek after collision in target, apply it, and remove given element from target
		{
			// catch current value
			if (elem && mergeOn)
				val = utils.fromPath(elem, mergeOn);
			else if (elem && elem.id)
				val = elem.id;
			else
				val = String(elem);
			if (map[val]) {
				target[map[val.index]] = compiler.aup(elem, map[val].ref, {
					excludeGrounds: excludeGrounds
				});
				target.splice(i, 1); // remove collided element from t
			}
			elem = target[++i];
		}
		return target;
	};

	compiler.upArray = function(src, target, mergeOn, excludeGrounds) {
		if (src.length === 0)
			return target;
		var map = {};
		var len = target.length,
			val = null,
			i = 0;
		for (; i < len; ++i) {
			var a = target[i];
			if (a && mergeOn)
				val = utils.fromPath(a, mergeOn);
			else if (a && a.id)
				val = a.id;
			else
				val = String(a);
			map[val] = {
				ref: a,
				index: i
			};
		}
		i = 0;
		var elem = src[i],
			length = src.length; // check target from target[src.length]
		while (i < length) // seek after collision in target, apply it, and remove given element from target
		{
			// catch current value
			if (elem && mergeOn)
				val = utils.fromPath(elem, mergeOn);
			else if (elem && elem.id)
				val = elem.id;
			else
				val = String(elem);
			if (map[val])
				target[map[val.index]] = compiler.aup(elem, map[val].ref, {
					excludeGrounds: excludeGrounds
				});
			else
				target.push(elem);
			elem = src[++i];
		}
		return target;
	};
	return compiler;
});