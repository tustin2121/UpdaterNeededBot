// debugxml.js
//

const zlib = require('zlib');

const ITEMS = require('./newspress/ledger');

let DICT = ``;
for (let item in ITEMS) {
	if (item === 'Ledger') continue;
	if (item === 'LedgerItem') continue;
	DICT += `${item} `;
}
DICT += `LedgerItem `;
DICT += `<boolean </boolean><number </number><string </string>`;
DICT += `<pokemon </pokemon>name species type gender nature ability caughtIn hp item move level storedIn pokerus shiny traded sparkly`;
DICT += `" imp="" name="" key="`;
DICT = Buffer.from(DICT, 'utf8');
console.log(DICT);

module.exports = {
	createDebugUrl(xml) {
		if (!xml) return '';
		console.log('1 - '+xml.length);
		let info = zlib.deflateRawSync(xml, {
			dictionary: DICT,
		});
		console.log('2 - '+info.length);
		info = info.toString('base64');
		console.log('3 - '+info.length);
		info = info.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		return `https://u.tppleague.me/?x=${info}`;
	},
};