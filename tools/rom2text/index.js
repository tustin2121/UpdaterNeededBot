// rom2text.js
// Converts a whole gen 2 ROM into searchable plain text.

const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

const ROM_IN_PATH = process.argv[2];
const ROM_OUT_PATH = ROM_IN_PATH+".text";

const CHARMAP = [];
populateCharMap(CHARMAP);

const ROM_IN = fs.createReadStream(ROM_IN_PATH)
const ROM_OUT = fs.createWriteStream(ROM_OUT_PATH);
const ROM_TRANS = new Transform({
	transform(chunk, encoding, next){
		for (let i = 0; i < chunk.length; i++) {
			chunk[i] = CHARMAP[chunk[i]];
		}
		this.push(chunk);
		next();
	},
});

ROM_IN.pipe(ROM_TRANS).pipe(ROM_OUT);

function populateCharMap(c) {
	c[0x4A] = 0x1D; //'πµ';
	c[0x4F] = '='
	c[0x50] = 0x0;
	c[0x51] = '*';
	c[0x54] = 0x1F;
	c[0x55] = '+';
	c[0x57] = '#';
	c[0x58] = '$';
	c[0x5B] = 0x0F;
	c[0x5C] = 0x09;
	c[0x5D] = 0x0B;
	c[0x5E] = 0x1E;
	c[0x7F] = ' ';
	c[0x80] = 'A';
	c[0x81] = 'B';
	c[0x82] = 'C';
	c[0x83] = 'D';
	c[0x84] = 'E';
	c[0x85] = 'F';
	c[0x86] = 'G';
	c[0x87] = 'H';
	c[0x88] = 'I';
	c[0x89] = 'J';
	c[0x8A] = 'K';
	c[0x8B] = 'L';
	c[0x8C] = 'M';
	c[0x8D] = 'N';
	c[0x8E] = 'O';
	c[0x8F] = 'P';
	c[0x90] = 'Q';
	c[0x91] = 'R';
	c[0x92] = 'S';
	c[0x93] = 'T';
	c[0x94] = 'U';
	c[0x95] = 'V';
	c[0x96] = 'W';
	c[0x97] = 'X';
	c[0x98] = 'Y';
	c[0x99] = 'Z';
	c[0x9A] = '(';
	c[0x9B] = ')';
	c[0x9C] = ':';
	c[0x9D] = ';';
	c[0x9E] = '[';
	c[0x9F] = ']';
	c[0xA0] = 'a';
	c[0xA1] = 'b';
	c[0xA2] = 'c';
	c[0xA3] = 'd';
	c[0xA4] = 'e';
	c[0xA5] = 'f';
	c[0xA6] = 'g';
	c[0xA7] = 'h';
	c[0xA8] = 'i';
	c[0xA9] = 'j';
	c[0xAA] = 'k';
	c[0xAB] = 'l';
	c[0xAC] = 'm';
	c[0xAD] = 'n';
	c[0xAE] = 'o';
	c[0xAF] = 'p';
	c[0xB0] = 'q';
	c[0xB1] = 'r';
	c[0xB2] = 's';
	c[0xB3] = 't';
	c[0xB4] = 'u';
	c[0xB5] = 'v';
	c[0xB6] = 'w';
	c[0xB7] = 'x';
	c[0xB8] = 'y';
	c[0xB9] = 'z';
	c[0xD0] = "'d";
	c[0xD1] = '|';
	c[0xD2] = '~';
	c[0xD3] = '%';
	c[0xD4] = '&';
	c[0xD5] = '}';
	c[0xD6] = '@';
	c[0xE0] = "'";
	c[0xE1] = 'π';
	c[0xE2] = 'µ';
	c[0xE3] = '-';
	c[0xE4] = '_';
	c[0xE5] = '_';
	c[0xE6] = '?';
	c[0xE7] = '!';
	c[0xE8] = '.';
	c[0xE9] = '+';
	c[0xEA] = 'é';
	c[0xEB] = '→';
	c[0xEF] = '♂';
	c[0xF0] = '$';
	c[0xF1] = '×';
	c[0xF2] = '.';
	c[0xF3] = '/';
	c[0xF4] = ',';
	c[0xF5] = '♀';
	c[0xF6] = '0';
	c[0xF7] = '1';
	c[0xF8] = '2';
	c[0xF9] = '3';
	c[0xFA] = '4';
	c[0xFB] = '5';
	c[0xFC] = '6';
	c[0xFD] = '7';
	c[0xFE] = '8';
	c[0xFF] = '9';
	for (let i = 0; i < 0xFF; i++) {
		if (typeof c[i] === 'string')
			c[i] = c[i].charCodeAt(0) & 0xFF;
		else if (typeof c[i] === 'undefined')
			c[i] = 0x00;
	}
}