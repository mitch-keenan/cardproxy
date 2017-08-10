import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
require('svg-url-loader!jsoneditor/dist/img/jsoneditor-icons.svg');
import all from 'jsoneditor/dist/jsoneditor.css';
var JSONEditor = require('jsoneditor/dist/jsoneditor.min.js');

require('./styles.css');

var cardProxy = require('./cardproxy.js');
var defaultCards = require('./cards.json');

window.onload = function () {
	
	var container = document.getElementById("cardsJSON");
	var options = {
			mode: 'code',
			modes: ['code', 'tree'],
	};
	var editor = new JSONEditor(container, options);
	editor.set(defaultCards);

	var button = document.getElementById('saveBtn');
	button.addEventListener ("click", function() {
		let cards;
		try {
			cards = editor.get();
		} catch (e) {
			alert("JSON parse error: " + e);
			return;
		}
		cardProxy(cards);
	}, false);
}