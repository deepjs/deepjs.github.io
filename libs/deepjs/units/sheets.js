/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(["require", "../deep"], function(require, deep) {

	//_______________________________________________________________ GENERIC STORE TEST CASES


	var unit = {
		title: "deepjs/units/sheets",
		stopOnError: false,
		setup: function() {},
		tests: {
			base: function() {
				var sheet = {
					_deep_sheet_: true,
					"dq.up::./!": {
						hello: "world",
						array: ["from up"]
					},
					"dq.bottom::./!": {
						array: ["from bottom"]
					},
					"dq.up::./a": {
						test: 123,
						other: true
					}
				};

				var obj = {
					array: ["base entry"],
					a: {
						test: 1
					}
				};
				deep.sheet(obj, sheet);
				return deep.nodes(obj).equal({
					"array": ["from bottom", "base entry", "from up"],
					"a": {
						"test": 123,
						"other": true
					},
					"hello": "world"
				});
			},
			map: function() {
				var sheet = {
					_deep_sheet_: true,
					"dq.map::./*": function(input) {
						return "e" + input.value;
					}
				};
				return deep.nodes([1, 2, 3, 4, 5])
					.sheet(sheet)
					.equal(["e1", "e2", "e3", "e4", "e5"]);
			},
			sheets_as__backgrounds: function() {
				// no effect
				return deep.nodes({
						test: false,
						_backgrounds: [{
							_deep_sheet_: true,
							"dq.bottom::./!": {
								hello: "world"
							}
						}]
					})
					.flatten()
					.equal({
						hello: "world",
						test: false
					});
			},
			sheets_as_backgrounds3: function() {
				return deep.nodes({
						test: false,
						_backgrounds: [{
							base: "yes"
						}, {
							_deep_sheet_: true,
							"dq.bottom::./!": {
								hello: "world"
							}
						}]
					})
					.flatten()
					.equal({
						hello: "world",
						base: "yes",
						test: false
					});
			},
			/*
			DEPRECATED TO USE backgrounds in sheets application

			sheets_as_backgrounds_twice:function(){
				return deep.nodes({
					test:false,
					_backgrounds:[{ 
						base:"yes" 
					}, {
						_deep_sheet_:true,
						"dq.bottom::./!":{
							_backgrounds:[{ doubleBack:true }],
							hello:"world"
						}
					}]
				})
				.flatten()
				.equal({
					doubleBack:true,
					hello:"world",
					base:"yes",
					test:false
				});
			},*/


			sheet_up_sheet: function() {
				var a = deep.aup({
					_deep_sheet_: true,
					"dq.bottom::.//!": {
						bloup: true
					}
				}, {
					_deep_sheet_: true,
					"dq.bottom::.//!": {
						hello: "world"
					}
				});
				return deep.nodes(a).equal({
					_deep_sheet_: true,
					"dq.bottom::.//!": {
						hello: "world",
						bloup: true
					}
				});
			},
			sheet_bottom_sheet: function() {
				var a = deep.abottom({
					_deep_sheet_: true,
					"dq.bottom::.//!": {
						bloup: true
					}
				}, {
					_deep_sheet_: true,
					"dq.bottom::.//!": {
						hello: "world"
					}
				});
				return deep.nodes(a).equal({
					_deep_sheet_: true,
					"dq.bottom::.//!": {
						bloup: true,
						hello: "world"
					}
				});
			},
			/*sheets_in_classes:function(){

				var C = deep.Classes(function(){

				}, {
					test:false
				},
				{
					_deep_sheet_:true,
					"dq.bottom::.//!":{ hello:"tulip" }
				});
				return deep.nodes(new C())
				.equal({
					hello:"tulip",
					test:false
				});
			},
			sheets_in_compile:function(){
				var c = deep.bottom({
					test:false
				},
				{
					_deep_sheet_:true,
					"dq.bottom::.//!":{ hello:"tulip" }
				}, { yop:14 });
				return deep.nodes(c)
				.equal({
					hello:"tulip",
					test:false,
					yop:14
				});
			},*/
			sheets_foregrounds: function() {
				var a = {
					_foregrounds: [{
						_deep_sheet_: true,
						"dq.bottom::.//!": {
							hello: "tulip"
						}
					}],
					bloup: true
				};
				return deep.nodes(a).flatten()
					.equal({
						hello: "tulip",
						bloup: true
					});
			},
			sheeter_up: function() {
				return deep.nodes({
						test: {
							hello: "world"
						}
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./test": deep.compose.nodes.up({
							hello: "deepjs"
						})
					})
					.equal({
						test: {
							hello: "deepjs"
						}
					});
			},
			sheeter_bottom: function() {
				return deep.nodes({
						test: {
							hello: "world"
						}
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./test": deep.compose.nodes.bottom({
							bloup: "deepjs"
						})
					})
					.equal({
						test: {
							bloup: "deepjs",
							hello: "world"
						}
					});
			},
			sheeter_sheet: function() {
				return deep.nodes({
						test: {
							hello: "world"
						}
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./test": deep.compose.nodes.sheet({
							"dq.up::./hello": "deepjs"
						})
					})
					.equal({
						test: {
							hello: "deepjs"
						}
					});
			},
			sheeter_chain: function() {
				return deep.nodes({
						test: {
							hello: "world"
						}
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./test": deep.compose.nodes.bottom({
							bloup: "deepjs"
						}).up({
							lolipop: true
						})
					})
					.equal({
						test: {
							bloup: "deepjs",
							hello: "world",
							lolipop: true
						}
					});
			},
			sheeter_map: function() {
				return deep.nodes({
						test: {
							hello: "world"
						}
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./test": deep.compose.nodes.map(function(node) {
							// console.log("node : ", node)
							node.value.bloup = true;
							return node.value;
						})
					})
					.equal({
						test: {
							hello: "world",
							bloup: true
						}
					});
			},
			sheeter_flatten: function() {
				return deep.nodes({
						_backgrounds: [{
							bloup: true
						}],
						test: {
							hello: "world"
						}
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./!": deep.compose.nodes.flatten()
					})
					.equal({
						bloup: true,
						test: {
							hello: "world"
						}
					});
			},
			sheeter_interpret: function() {
				return deep.nodes({
						test: "hello { name }"
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./test": deep.compose.nodes.interpret({
							name: "John"
						})
					})
					.equal({
						test: "hello John"
					});
			},
			sheeter_after: function() {
				return deep.nodes({
						test: "hello"
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./!": deep.compose.nodes.each(function(entry, options) {
							entry.value.bloup = true;
						})
					})
					.equal({
						test: "hello",
						bloup: true
					});
			},
			sheeter_after_before: function() {
				return deep.nodes({
						test: "hello"
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./!": deep.compose.nodes.after(function(entry, options) {
							entry.value.bloup = true;
						}).before(function(entry, options) {
							entry.value.lolipop = true;
						})
					})
					.equal({
						test: "hello",
						lolipop: true,
						bloup: true
					});
			},
			sheeter_after_before_around: function() {
				return deep.nodes({
						test: "hello"
					})
					.sheet({
						_deep_sheet_: true,
						"dq::./!": deep.compose.nodes.after(function(entry, options) {
								entry.value.bloup = true;
							}).before(function(entry, options) {
								entry.value.lolipop = true;
							})
							.around(function(old) {
								return function(entry, options) {
									entry.value.blap = true;
									old.call(this, entry, options);
									entry.value.ploutch = true;
								}
							})
					})
					.equal({
						test: "hello",
						blap: true,
						lolipop: true,
						bloup: true,
						ploutch: true
					});
			},
			sheeter_merge: function() {
				var sheet = deep.bottom({
					_deep_sheet_: true,
					"dq::./!": deep.compose.nodes.after(function(entry, options) {
						entry.value.bloup = true;
					})
				}, {
					_deep_sheet_: true,
					"dq::./!": deep.compose.nodes.before(function(entry, options) {
						entry.value.lolipop = true;
					})
				}, {
					_deep_sheet_: true,
					"dq::./!": deep.compose.nodes.around(function(old) {
						return function(entry, options) {
							entry.value.blap = true;
							old.call(this, entry, options);
							entry.value.ploutch = true;
						}
					})
				});
				return deep.nodes({
						test: "hello"
					})
					.sheet(sheet)
					.equal({
						test: "hello",
						blap: true,
						lolipop: true,
						bloup: true,
						ploutch: true
					});
			}
		}
	};

	return unit;
});