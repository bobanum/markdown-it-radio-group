/*! markdown-it-radio-group 0.0.1 https://github.com/bobanum/markdown-it-radio-group#readme by Martin Boudreau @license ISC \*/ 
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitRadiogroup = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Markdown-it plugin to render radio groups based on GitHub-style task lists; see
//

var disableInputs = true;
var useLabelWrapper = false;
var useLabelAfter = false;

module.exports = function(md, options) {
	if (options) {
		disableInputs = !options.enabled;
		useLabelWrapper = !!options.label;
		useLabelAfter = !!options.labelAfter;
	}

	md.core.ruler.after('inline', 'github-radio-group', function(state) {
		var tokens = state.tokens;
		for (var i = 2; i < tokens.length; i++) {
			if (isTodoItem(tokens, i)) {
				todoify(tokens[i], state.Token);
				attrSet(tokens[i-2], 'class', 'radio-group-item' + (!disableInputs ? ' enabled' : ''));
				attrSet(tokens[parentToken(tokens, i-2)], 'class', 'contains-radio-group');
			}
		}
	});
};

function attrSet(token, name, value) {
	var index = token.attrIndex(name);
	var attr = [name, value];

	if (index < 0) {
		token.attrPush(attr);
	} else {
		token.attrs[index] = attr;
	}
}

function parentToken(tokens, index) {
	var targetLevel = tokens[index].level - 1;
	for (var i = index - 1; i >= 0; i--) {
		if (tokens[i].level === targetLevel) {
			return i;
		}
	}
	return -1;
}

function isTodoItem(tokens, index) {
	return isInline(tokens[index]) &&
	       isParagraph(tokens[index - 1]) &&
	       isListItem(tokens[index - 2]) &&
	       startsWithTodoMarkdown(tokens[index]);
}

function todoify(token, TokenConstructor) {
	token.children.unshift(makeCheckbox(token, TokenConstructor));
	token.children[1].content = token.children[1].content.slice(3);
	token.content = token.content.slice(3);

	if (useLabelWrapper) {
		if (useLabelAfter) {
			token.children.pop();

			// Use large random number as id property of the checkbox.
			var id = 'radio-group-item-' + Math.ceil(Math.random() * (10000 * 1000) - 1000);
			token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
			token.children.push(afterLabel(token.content, id, TokenConstructor));
		} else {
			token.children.unshift(beginLabel(TokenConstructor));
			token.children.push(endLabel(TokenConstructor));
		}
	}
}

function makeCheckbox(token, TokenConstructor) {
	var radio = new TokenConstructor('html_inline', '', 0);
	var disabledAttr = disableInputs ? ' disabled="" ' : '';
	if (token.content.indexOf('( ) ') === 0) {
		radio.content = '<input class="radio-group-item-input"' + disabledAttr + 'type="radio">';
	} else if (token.content.indexOf('(x) ') === 0 || token.content.indexOf('(X) ') === 0) {
		radio.content = '<input class="radio-group-item-input" checked=""' + disabledAttr + 'type="radio">';
	}
	return radio;
}

// these next two functions are kind of hacky; probably should really be a
// true block-level token with .tag=='label'
function beginLabel(TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '<label>';
	return token;
}

function endLabel(TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '</label>';
	return token;
}

function afterLabel(content, id, TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '<label class="radio-group-item-label" for="' + id + '">' + content + '</label>';
	token.attrs = [{for: id}];
	return token;
}

function isInline(token) { return token.type === 'inline'; }
function isParagraph(token) { return token.type === 'paragraph_open'; }
function isListItem(token) { return token.type === 'list_item_open'; }

function startsWithTodoMarkdown(token) {
	// leading whitespace in a list item is already trimmed off by markdown-it
	return token.content.indexOf('( ) ') === 0 || token.content.indexOf('(x) ') === 0 || token.content.indexOf('(X) ') === 0;
}

},{}]},{},[1])(1)
});
