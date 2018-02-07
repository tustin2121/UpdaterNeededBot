// newspress/typesetter/index.js
// The TypeSetter, and the phrasebook, that translates LedgerItems into English Language

const { Pokemon } = require('../../api/pokedata');
const { LedgerItem } = require('../ledger');

const LOGGER = getLogger('TypeSetter');

const phrasebook = Object.assign({}, ...[
	require('./Pokemon'),
	require('./Location'),
]);

////////////////////////////////////////////////////////////////////////////////////////////////////

const determineIndefiniteArticle = require('./indefiniteArticle').query;
const determineGender = (male, female, neuter, plural)=>{
	return (obj)=>{
		if (obj instanceof Pokemon) {
			switch(obj.gender.toLowerCase()) {
				case 'm': case 'male': return male;
				case 'f': case 'female': return female;
				case 't': case 'they': case 'plural': return plural;
				default: return neuter;
			}
		}
	}
};

const FORMAT_FNS = {
	'an': (obj)=>{
		let name = obj.toString();
		return determineIndefiniteArticle(name);
	},
	'An': (obj)=>{
		let name = obj.toString();
		let art = determineIndefiniteArticle(name);
		if (art.length > 1) return 'An';
		return 'A';
	},
	'he': determineGender('he', 'she', 'it', 'they'),
	'him': determineGender('him', 'her', 'it', 'them'),
	'his': determineGender('his', 'her', 'its', 'their'),
	// 'his': determineGender('his', 'hers', 'its', 'theirs'),
	'they': determineGender('he', 'she', 'it', 'they'),
	'them': determineGender('him', 'her', 'it', 'them'),
	'their': determineGender('his', 'her', 'its', 'their'),
	'theirs': determineGender('his', 'hers', 'its', 'theirs'),
	
	'uppercase': (obj)=>obj.toString().toUpperCase(),
	'lowercase': (obj)=>obj.toString().toLowerCase(),
};

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Replaces all items in a phrase with their proper variable values.
 * @param {string} text - The string to format.
 * @param {LedgerItem} item - The ledger item to use as context
 */
function fillText(text, item) {
	return text.replace(/\{\{([\w\d\|]+)\}\}/gi, (match, key)=>{
		let args = key.split('|');
		let obj = (()=>{
			let a = args[0].split('.');
			let o = item;
			for (let b of a) {
				o = o[b];
			}
			return o;
		})();
		for (let i = 1; i < args.length; i++) {
			let fn = FORMAT_FNS[args[i]];
			let obj = fn(obj);
		}
		return obj;
	});
}

function fillMulti(text, items) {
	// {{#}} or {{#|separator}} or {{#|separator|and/or}}
	return text.replace(/{{#(?:\|([^\|}]+)(?:\|([^\|}]+))?)?}}/gi, (match, sep, and)=>{
		// sep = separator string ', ' - str.join(sep)
		// and = and string 'and' - prepend to ' '+list[list.length-1]
	});
}

/**
 * @param {LedgerItem[]} items - List of ledger items to make into a phrase
 */
function getPhrase(items) {
	let ritem = items[0]; //Representitive item
	
	let pdict = phrasebook[ritem.name];
	if (pdict === undefined) {
		LOGGER.error(`LedgerItem ${ritem.name} has no phrase dictionary in the phrasebook!`);
		return null;
	}
	if (pdict === null) return null; //Skip this item
	
	//TODO phrase could be an object which has keys 'single', 'multi', and 'item'.
	// If it does not have this object or these keys, it is assumed it is a single object,
	// and all items will be done as single items
	
	let phrase = pdict[ritem.flavor || 'default'];
	if (typeof phrase === 'function') {
		phrase = phrase(item, { fillText });
	}
	if (Array.isArray(phrase)) {
		phrase = phrase[Math.floor(Math.random()*phrase.length)];
	}
	if (phrase === null) return null; //Skip this item
	if (typeof phrase !== 'string') {
		LOGGER.error(`LedgerItem ${item.name}'s phrase dictionary has returned an illegal value!`, phrase);
		return null;
	}
	
	phrase = fillText(phrase, item);
	return phrase;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Collates all of the LedgerItems in the ledger into collections of items, and sorts them
 * into an order of apperance. Every item that is the same type of item with the same flavor
 * is put into an array.
 */
function collateItems(ledger) {
	let dict = {};
	let order = [];
	
	// Collate
	for (let item of ledger.list) {
		let itemname = `${item.name}/${item.flavor||'default'}`;
		if (!dict[itemname]) {
			order.push(itemname);
			dict[itemname] = [];
		}
		dict[itemname].push(item);
	}
	// Sort each collection, so the highest sorted item is first
	for (let key in dict) {
		dict[key].sort(LedgerItem.compare);
	}
	// Then sort the collections
	order.sort((a,b)=>{
		let ai = dict[a][0];
		let bi = dict[b][0];
		return LedgerItem.compare(ai, bi);
	});
	// Return the collected items
	return order.map(x=>dict[x]);
}


/**
 * The main function of the TypeSetter.
 */
function typeset(ledger) {
	let list = collateItems(ledger);
	
	let update = [];
	//TODO Collate items of the same type and flavor together, and handle multiple items as one phrase
	// by adding another layer to the phrase book for "single" and "multiple".
	for (let items of list) {
		let phrase = getPhrase(items);
		if (phrase === null) continue;
		update.push(phrase);
	}
	if (!update.length) return null;
	return update.join(' ');
}

/** A function that formats the data from the html tags into reddit text formatting. */
function formatReddit(text) {
	// Replace the info tag with hover link information
	text = text.replace(/<info ext="([^\"]+)">(.+?)<\/info>/ig, (match, ext, txt)=>{
		return `[${txt}](#info ${ext})`;
	});
	return { text };
}

/** A function that formats the data from the html tags into discord text formatting. */
function formatDiscord(text) {
	let embeds = [];
	
	// Replace the info tag with a pointer to the discord embed
	// If there's more than one, number them.
	text = text.replace(/<info ext="([^\"]+)">(.+?)<\/info>/ig, (match, ext, txt)=>{
		embeds.push({
			name: txt,
			value: ext,
		});
		return txt;
	});
	return { text, embeds };
}

module.exports = {
	typeset,
	formatFor: {
		reddt: formatReddit,
		discord: formatDiscord,
	},
};
