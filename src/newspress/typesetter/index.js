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

class TypeSetter {
	/**
	 * @param {string} formattingType - The type of formatting structure to use. html|reddit|discord
	 */
	constructor(formattingType='html') {
		this.formattingType = formattingType;
	}
	
	/**
	 * The main function of the TypeSetter.
	 */
	typeset(ledger) {
		for (let item of ledger.list) {
			let phrase = this.getPhrase(item);
			if (phrase === null) continue;
		}
	}
	
	getPhrase(item) {
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
		
		phrase = this.formatText(phrase, item);
		return phrase;
	}
	
	/**
	 * Formats a peice of text.
	 * @param {string} text - The string to format.
	 * @param {LedgerItem} item - The ledger item to use as context
	 */
	formatText(text, item) {
		// Step 1, replace all values
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
		
		// Step 2, replace all formatting tags
		
	}
}

module.exports = TypeSetter;
