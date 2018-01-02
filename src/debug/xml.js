// debug/xml.js
//

const zlib = require('zlib');

const ITEMS = require('../newspress/ledger');

let DICTS = {
	// Version 0: Locked
	'0': undefined, //No dictionary used
	// Version A: Open
	a: (()=>{
		let dict = ``;
		for (let item in ITEMS) {
			if (item === 'Ledger') continue;
			if (item === 'LedgerItem') continue;
			dict += `${item} `;
		}
		dict += `LedgerItem `;
		dict += `<boolean </boolean><number </number><string </string>`;
		dict += `<pokemon </pokemon>name species type gender nature ability caughtIn hp item move level storedIn pokerus shiny traded sparkly`;
		dict += `" imp="" name="" key="`;
		return Buffer.from(dict, 'utf8');
	})(),
};
let LATEST_DICT = 'a';


function compressDebugXml(xml) {
	if (!xml) return '';
	let len = xml.length;
	let info = zlib.deflateRawSync(xml, {
		dictionary: DICTS[LATEST_DICT],
	});
	info = info.toString('base64');
	info = info.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
	console.log(`Compession ratio: ${info.length / len}%`);
	return `${LATEST_DICT}=${info}`;
}

function createDebugUrl(xml) {
	return `https://u.tppleague.me/?${compressDebugXml(xml)}`;
}

function decompressDebugXml(str) {
	if (!str) throw new ReferenceError('No compressed debug info passed!');
	if (str.startsWith('https://')) str = str.slice(8);
	if (str.startsWith('http://')) str = str.slice(7);
	if (str.startsWith('u.tppleague.me/?')) str = str.slice(16);
	
	if (!/^[a-z0]=/i.test(str)) throw new TypeError('No decompression key provided!');
	let key = str[0];
	str = str.slice(2);
	
	let diff = str.length % 4;
	for (let i = 0; i < diff; i++) str += '=';
	str = str.replace(/\-/g, '+').replace(/\_/g, '/')
	
	let xml = zlib.inflateRawSync(Buffer.from(str, 'base64'), {
		dictionary: DICTS[key],
	});
	return xml.toString();
}

module.exports = {
	createDebugUrl, compressDebugXml,
	decompressDebugXml,
};