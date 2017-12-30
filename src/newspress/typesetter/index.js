// newspress/typesetter/index.js
// The TypeSetter, and the phrasebook, that translates LedgerItems into English Language

const { Pokemon } = require('../../api/pokedata');

const LOGGER = getLogger('TypeSetter');

const phrasebook = Object.assign({}, ...[
	require('./Pokemon'),
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
	text.replace(/\{\{([\w\d\|]+)\}\}/gi, (match, key)=>{
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

function getPhrase(item) {
	let pdict = phrasebook[item.name];
	if (pdict === undefined) {
		LOGGER.error(`LedgerItem ${item.name} has no phrase dictionary in the phrasebook!`);
		return null;
	}
	if (pdict === null) return null; //Skip this item
	
	let phrase = pdict[item.flavor || 'default'];
	if (typeof phrase === 'function') {
		phrase = phrase(item);
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
 * The main function of the TypeSetter.
 */
function typeset(ledger) {
	let update = [];
	for (let item of ledger.list) {
		let phrase = getPhrase(item);
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
