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
DICT += `" imp="" name="" key="`;
DICT = Buffer.from(DICT);

module.exports = {
	createDebugUrl(xml) {
		if (!xml) return '';
		let info = zlib.gzipSync(xml, {
			dictionary: DICT,
		});
		info = info.toString('base64');
		info = info.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		return `https://u.tppleague.me/?x=${info}`;
	},
};