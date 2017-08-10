var jsPDF = require('jspdf');
var defaultCards = require('./cards.json');

// Inches
var PAGE_W = 8.5;
var PAGE_H = 11;
var CARD_W = 2.4;
var TEXT_BORDER = 0.1;
var CARD_H = 3.4;
var CARDS_WIDE = 3; // TODO: Make dynamic
var CARDS_HIGH = 3;
var GUTTER_W = (PAGE_W - (CARDS_WIDE * CARD_W)) / 2;
var GUTTER_H = (PAGE_H - (CARDS_HIGH * CARD_H)) / 2;
var COLOR = true;

function createPDF() {
	try {
		var cards = JSON.parse(document.getElementById('cards').value);
	} catch (e) {
		alert("JSON parse error: " + e);
		return;
	}
	var doc = new jsPDF({ unit: 'in', format: 'letter' });
	addLines(doc);
	cards.forEach(function(card) { addCard(doc, card); });
	doc.save('cards.pdf');
}

var mm = 25.4; // 8.5 / mm converts 8.5 from inches to mm;

function addLines(doc, width) {

	// Should this use roundedRect instead?

	doc.setLineWidth(width || 0.04);

	let i;
	for(i = 0; i <= CARDS_WIDE; i++) {
		var x = GUTTER_W + (i * CARD_W);
		doc.lines([[0, PAGE_H]], x, 0);
	}

	for(i = 0; i <= CARDS_HIGH; i++) {
		var y = GUTTER_H + (i * CARD_H);
		doc.lines([ [PAGE_W, 0] ], 0, y);
	}
}

let numCardsAddedPage = 0;
function addCard(doc, card) {
	if(numCardsAddedPage === CARDS_HIGH * CARDS_WIDE) {
		doc.addPage();
		addLines(doc);
		numCardsAddedPage = 0;
	}

	var grid_y = Math.floor(numCardsAddedPage / CARDS_HIGH);
	var grid_x = (numCardsAddedPage - grid_y) % CARDS_WIDE;

	var p_x = GUTTER_W + (grid_x * CARD_W);
	var p_y = GUTTER_H + (grid_y * CARD_H);

	var textOffset = 0;

	Object.keys(card).forEach(function(key, i) {
		if(key === 'count') {
			return;
		}

		var val = card[key];
		setStyle(doc, key, val);
		var lines = [];

		if(!willFitCard(doc, val)) {
			lines = lineBreak(doc, val);
		} else {
			lines = [val];
		}

		var offsetPerTextLine = doc.internal.getLineHeight() / 72;
		if(i === 0) {
			p_y += offsetPerTextLine;
		}
		doc.text(lines, p_x + TEXT_BORDER, p_y + textOffset);
		if(i > 0) {
			doc.setLineWidth(0.02);
			doc.line(p_x, p_y + textOffset - offsetPerTextLine, p_x + CARD_W, p_y + textOffset - offsetPerTextLine);
		}
		textOffset += (lines.length * offsetPerTextLine) + TEXT_BORDER;
	});

	numCardsAddedPage++;

	if(card.count && --card.count > 0) {
		addCard(doc, card);
	}
}

// Breaks a string into an array of lines which will fit on a card.
function lineBreak(doc, str) {
	var result = [];
	var tokens = str.split(" ");

	while(tokens.length > 0) {
		var line = tokens.shift();

		while(tokens.length > 0) {
			var word = tokens.shift();
			if(!willFitCard(doc, line + " " + word)) {
				tokens.unshift(word);
				break;
			}
			line += " " + word;
			// TODO: prevent going infinite here if a token is longer than a line.
		}

		result.push(line);
	}

	return result;
}

// Sets the text style for given card params
function setStyle(doc, key, value) {
		doc.setFontSize(12);
		doc.setFontStyle("normal");
		if(key === "title") {
			doc.setFontSize(16);
			doc.setFontStyle("bold");
		} else if (key === "flavor") {
			doc.setFontSize(10);
			doc.setFontStyle("italic");
		}

		doc.setTextColor(0, 0, 0);
		// TODO: Move this color into the json somehow
		if(key === "alignment" && COLOR) {
			if(value === "Town") {
				doc.setTextColor(51, 204, 51);
			} else if (value === "Mafia") {
				doc.setTextColor(204, 51, 51);
			} else {
				doc.setTextColor(51, 51, 204);
			}
		}
}

function willFitCard(doc, text, fontSize) {
	return doc.getStringUnitWidth(text) * doc.internal.getFontSize() / 72 < CARD_W - (TEXT_BORDER * 2);
}

window.onload = function () {
	var button = document.getElementById('saveBtn');
	var textarea = document.getElementById('cards');
	button.addEventListener ("click", createPDF, false);
	textarea.value = JSON.stringify(defaultCards, null, '\t');
}