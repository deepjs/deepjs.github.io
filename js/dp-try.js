/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function')
	var define = require('amdefine')(module);
define(["require", "deepjs/deep", "deep-views/index"], function(require, deep) {
	var stringify = function(key, value) {
		if (typeof value === 'function')
			return 'Function';
		if (value instanceof Date)
			return value.toString();
		if (value instanceof RegExp)
			return value.toString();
		if (typeof jQuery !== 'undefined' && value instanceof jQuery)
			return "jquery:" + value.selector;
		return value;
	};
	var render = function(args) {
		args = Array.prototype.slice.call(args);
		if (args && args.forEach && args[0] == "dp:success : ")
			args.shift();
		var rendered = args.map(function(s) {
			if (s == 'dp:success : ') return '';
			if (typeof s === 'object') return JSON.stringify(s, stringify, ' ');
			return s;
		}).join(" ");
		rendered = hljs.highlight("javascript", rendered).value;
		return rendered;
	};
	var createLogger = function(output) {
		return {
			log: function() {
				$(output).append('<div class="deep-log">' + render(arguments) + '</div>')
			},
			warn: function() {
				$(output).append('<div class="deep-warn">' + render(arguments) + '</div>')
			},
			error: function() {
				$(output).append('<div class="deep-error">' + render(arguments) + '</div>')
			},
			debug: function() {
				$(output).append('<div class="deep-error">' + render(arguments) + '</div>')
			}
		};
	};
	return function() {
		var node = this;
		// todo modes edit by default
		var closure = {},
			editor,
			id = "dp-try-" + Date.now().valueOf();

		closure.code = $(this).text().trim();
		console.log('closure.code : ', "|" + closure.code + "|");
		$(this).empty();

		var textNode = $('<div class="dp-try-code"></div>').appendTo(node);
		var editorNode = $('<div class="dp-try-editor" id="' + id + '"></div>').appendTo(node).hide();

		$(editorNode).text(closure.code);
		$(textNode).html(hljs.highlight("javascript", closure.code).value);


		var buttonRow = $('<div class="dp-button-row"></div>').appendTo(node);
		$('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-flash"></span></button>')
			.appendTo(buttonRow)
			.click(function() {
				deep.when(1)
					.toContext("logger", closure.logger)
					.done(function() {
						output.html("").slideDown(100);
						if (editor)
							eval(editor.getValue());
						else
							eval(closure.code);
					});
			})
			.hide().fadeIn();

		$('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-edit"></span></button>')
			.appendTo(buttonRow)
			.click(function() {
				if (!editor) {
					$(editorNode).show();
					$(textNode).hide();
					editor = ace.edit(id);
					var heightUpdateFunction = function() {
						// http://stackoverflow.com/questions/11584061/
						var newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
						$(editorNode).height(newHeight.toString() + "px");
						// This call is required for the editor to fix all of
						// its inner structure for adapting to a change in size
						editor.resize();
					};
					// Set initial size to match initial content
					heightUpdateFunction();
					// Whenever a change happens inside the ACE editor, update
					// the size again
					editor.getSession().on('change', heightUpdateFunction);
					editor.setTheme("ace/theme/twilight");
					editor.getSession().setMode("ace/mode/javascript");
				}
			})
			.hide().fadeIn();
		$('<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-refresh"></span></button>')
			.appendTo(buttonRow)
			.click(function() {
				$(editorNode).hide();
				$(textNode).show();
				if (editor) {
					editor.setValue(closure.code, -1);
					editor.destroy();
				}
				editor = null;
				$(editorNode).text(closure.code);
				output.slideUp(100);
			})
			.hide().fadeIn();


		var output = $('<pre class="dp-try-output"></pre>').appendTo(node).hide();
		closure.logger = createLogger(output);
	};
});
