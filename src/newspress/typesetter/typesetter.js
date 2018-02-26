// newspress/typesetter/index.js
// The TypeSetter, and the phrasebook, that translates LedgerItems into English Language

const { Pokemon, SortedLocation, Item } = require('../../api/pokedata');
const { LedgerItem } = require('../ledger');

const LOGGER = getLogger('TypeSetter');

const PHRASEBOOK = Object.assign({}, ...[
	require('./Battle'),
	require('./E4'),
	require('./Item'),
	require('./Location'),
	require('./Others'),
	require('./Party'),
	require('./PC'),
	require('./Pokemon'),
]);
const FORMAT_FNS = {};
/***************************************************************************************************
Replacement Format: {{func|param|param|param...}}

Prefixes:
- @ = item property
	If func is prefixed with an @, it is simply a toString of the item property.
	If any param is prefixed with an @, that item property is passed to the func.
	Cannot be used alone.

- $ = subject
	If $ prefixes a param, that param is set as the subject.
	If $ prefixes a func, that function determines what to set as the subject.
	If $ is in the func slot alone, the subject will be toString'ed.
	If $ is in the param slot alone, the subject object will be passed as the parameter.
	Subjects assigned for the first time are named, but subjects reassigned will be pronouned.
	
- # = noun
	If # prefixes a param, that param is set as the noun.
	If # prefixes a func, that function determines what to set as the noun.
	If # is in the func slot alone, the noun will be toString'ed.
	If # is in the param slot alone, the noun object will be passed as the parameter.


`We toss {{some nouns|@item}} at the trainer's pokemon, but {{they|@trainer}} {{verb|blocks|block}} the ball.`;
***************************************************************************************************/
////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions

/** Checks a function to see if it is a toString with desireable output. */
function isValidToString(fn) {
	if (fn === Object.prototype.toString) return false;
	if (fn === Function.prototype.toString) return false;
	//String and Number's toString functions produce desireable output
	return true;
}
{
	const pluralize = require('pluralize');
	pluralize.addUncountableRule('pokemon');
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Format Functions: Articles and Prepositions
{
	Object.assign(FORMAT_FNS, {
		'meta': ()=>'', //do nothing
	});
}{
	function printLocationPhrase(capitalize=false, usePreposition=true) {
		const cap = (capitalize)? (p)=> p.charAt(0).toUpperCase() + p.substr(1) : (p)=>p;
		return function(loc) {
			loc = loc || this.noun || this.subject;
			if (!(loc instanceof SortedLocation)) {
				LOGGER.warn('printLocationPhrase must take a location!');
				return 'in the area'; //error
			}
			let on='', the='';
			if (usePreposition) {
				on = loc.get('preposition');
				if (usePreposition === 'to') {
				 	if (/in|on/i.test(on)) on += 'to';
					else return false; //can't use this phrase
				}
				on += ' ';
			}
			if (loc.has('the')) {
				the = loc.get('the');
				if (the === true) the = 'the';
				the += ' ';
			}
			return cap(`${on}${the}${loc.name}`);
		}
	}
	
	function determineOnIn(captial=false) {
		const cap = (captial)? (p)=> p.charAt(0).toUpperCase() + p.substr(1) : (p)=>p;
		return function(obj) {
			obj = obj || this.noun || this.subject;
			if (obj instanceof SortedLocation) {
				return cap(obj.get('preposition'));
			}
			return cap('on');
		}
	}
	Object.assign(FORMAT_FNS, {
		'On': determineOnIn(false),
		'on': determineOnIn(true),
		
		'in the location': printLocationPhrase(false, true),
		'In the location': printLocationPhrase(true, true),
		'into the location': printLocationPhrase(false, 'to'),
		'Into the location': printLocationPhrase(true, 'to'),
		'on the location': printLocationPhrase(false, true),
		'On the location': printLocationPhrase(true, true),
		'onto the location': printLocationPhrase(false, 'to'),
		'Onto the location': printLocationPhrase(true, 'to'),
		'the location': printLocationPhrase(false, false),
		'The location': printLocationPhrase(false, false),
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Format Functions: Nouns and Verbs
{
	const WORD_NUMS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
	const SOME_NUMS = ['no', '{an}', 'a couple', 'a few', 'a few', 'a few', 'several', 'several', 'several', 'several', 'several', 'several', 'a dozen', 'a dozen'];
	const AN_NUMS = [undefined, '{an}'];
	const NUM_NUMS = []; //off the end of the array are normal numbers, thus empty array
	const determineIndefiniteArticle = require('./indefiniteArticle').query;
	const { plural:makePlural } = require('pluralize');
	
	function printDefiniteNoun(numArray) {
		return function(obj, num=1) {
			// Get the noun we're going to use for this object
			let noun = (()=>{
				if (obj === undefined) return 'undefined';
				if (obj === null) return 'null';
				// If the object has overridden the toString function, use it.
				if (isValidToString(obj.toString)) return obj.toString();
				// If the object has a name propery, use it.
				if (obj.displayName) return obj.displayName;
				if (obj.name) return obj.name;
				// Return a default string
				return 'thing';
			})();
			// If the noun is plural:
			if (num !== 1) {
				// See if the object's custom toString takes plural numbers as an argument
				if (obj.toString.length == 1) noun = obj.toString(num);
				// See if the object has a plural name property
				else if (obj.pluralName) noun = obj.pluralName;
				// Add an 's' at the end as a default
				else noun = makePlural(noun);
			}
			let article = numArray[num] || (num).toString();
			if (article === '{an}') article = determineIndefiniteArticle(noun);
			
			if (this._setNoun) this.noun = obj;
			if (this._setSubject) this.subject = obj;
			return `${article} ${noun}`;
		};
	}
	function printNumber(numArray) {
		return function(num, obj) {
			let txt = numArray[num] || (num).toString();
			if (txt === '{an}') {
				let noun = obj || this.noun || this.subject || 'thing';
				txt = determineIndefiniteArticle(noun.toString);
			}
			return txt;
		}
	}
	Object.assign(FORMAT_FNS, {
		'1 noun': printDefiniteNoun(NUM_NUMS),
		'one noun': printDefiniteNoun(WORD_NUMS),
		'a noun': printDefiniteNoun(AN_NUMS),
		'some nouns': printDefiniteNoun(SOME_NUMS),
		
		'1 item': printDefiniteNoun(NUM_NUMS),
		'one item': printDefiniteNoun(WORD_NUMS),
		'an item': printDefiniteNoun(AN_NUMS),
		'some items': printDefiniteNoun(SOME_NUMS),
		
		'1 thing': printDefiniteNoun(NUM_NUMS),
		'one thing': printDefiniteNoun(WORD_NUMS),
		'a thing': printDefiniteNoun(AN_NUMS),
		'some things': printDefiniteNoun(SOME_NUMS),
		
		'1': printNumber(NUM_NUMS),
		'one': printNumber(WORD_NUMS),
		'a': printNumber(AN_NUMS),
		'some': printNumber(SOME_NUMS),
	});
}{
	function printVerb(singular, plural) {
		return function(noun) {
			noun = noun || this.subject || this.noun;
			if (Array.isArray(noun) && noun.length > 1) {
				return plural;
			}
			if (noun instanceof Pokemon) return singular;
			
		}
	}
	Object.assign(FORMAT_FNS, {
		'verb': function (singular, plural, noun) {
			let fn = printVerb(singular, plural);
			return fn.call(this, noun);
		},
		'verb-s': printVerb('s', ''),
		'*s': printVerb('s', ''),
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Format Functions: Pronouns
{
	function determineGender(male, female, neuter, plural) {
		return function(obj) {
			if (typeof obj === 'number') {
				if (obj === 1) return neuter;
				return plural;
			}
			if (obj instanceof Pokemon) {
				switch(obj.gender) {
					case '\u2642': return male;
					case '\u2640': return female;
					case '\u26AA': return neuter;
					default: return neuter;
				}
			}
			if (obj.gender) {
				switch(obj.gender.toLowerCase()) {
					case 'm': case 'male': return male;
					case 'f': case 'female': return female;
					case 't': case 'they': case 'plural': return plural;
					case 'i': case 'it': return plural;
					default: return plural;
				}
			}
			
		}
	}
	Object.assign(FORMAT_FNS, {
		// pronouns
		'he': determineGender('he', 'she', 'it', 'they'),
		'him': determineGender('him', 'her', 'it', 'them'),
		'his': determineGender('his', 'her', 'its', 'their'),
	//	'his': determineGender('his', 'hers', 'its', 'theirs'),
		'she': determineGender('he', 'she', 'it', 'they'),
		'her': determineGender('him', 'her', 'it', 'them'),
	//	'her': determineGender('his', 'her', 'its', 'their'),
		'hers': determineGender('his', 'hers', 'its', 'theirs'),
		'they': determineGender('he', 'she', 'it', 'they'),
		'them': determineGender('him', 'her', 'it', 'them'),
		'their': determineGender('his', 'her', 'its', 'their'),
		'theirs': determineGender('his', 'hers', 'its', 'theirs'),
		
		// captial pronouns
		'He': determineGender('He', 'She', 'It', 'They'),
		'Him': determineGender('Him', 'Her', 'It', 'Them'),
		'His': determineGender('His', 'Her', 'Its', 'Their'),
	//	'His': determineGender('His', 'Hers', 'Its', 'Theirs'),
		'She': determineGender('He', 'She', 'It', 'They'),
		'Her': determineGender('Him', 'Her', 'It', 'Them'),
	//	'Her': determineGender('His', 'Her', 'Its', 'Their'),
		'Hers': determineGender('His', 'Hers', 'Its', 'Theirs'),
		'They': determineGender('He', 'She', 'It', 'They'),
		'Them': determineGender('Him', 'Her', 'It', 'Them'),
		'Their': determineGender('His', 'Her', 'Its', 'Their'),
		'Theirs': determineGender('His', 'Hers', 'Its', 'Theirs'),
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Format Functions: Lists
{
	function printList(sep, and) {
		return function(formatFn, ...args) {
			if (!this._itemList) throw new ReferenceError('List of items not specified!');
			
			let items = this._itemList.map(item=>{
				let fn = FORMAT_FNS[formatFn];
				return fn.apply(this, args);
			}).filter(x=>x);
			if (items.length > 1 && and) {
				items[items.length-1] = and+' '+items[items.length-1];
			}
			if (items.length == 2 && and) {
				return items.join(' ');
			}
			return items.join(sep);
		}
	}
	Object.assign(FORMAT_FNS, {
		'a comma-separated list of': printList(', ', 'and'),
		'a comma-separated and list of': printList(', ', 'and'),
		'a comma-separated or list of': printList(', ', 'or'),
		'a semicolon-separated list of': printList('; ', 'and'),
		'a semicolon-separated and list of': printList('; ', 'and'),
		'a semicolon-separated or list of': printList('; ', 'or'),
	});
}{
	function printRandom(...args) {
		return args[this.rand(args.length)];
	}
	Object.assign(FORMAT_FNS, {
		'rand': printRandom,
		'random': printRandom,
		'randomly': printRandom,
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////

class TypeSetter {
	constructor(ledger) {
		//TODO process ledger
		
		// Phrase variables
		this.subject = null;
		this.noun = null;
		
		// Working variables
		this._setSubject = false;
		this._setNoun = false;
		this._itemList = null;
	}
	
	/** Random function. For convienence and also to allow rigging for unit testing. */
	rand(len) {
		return Math.floor(Math.random()*len);
	}
	
	resolvePhrase(item) {
		if (!Array.isArray(item) || !item.length) {
			LOGGER.error(`resolvePhrase passed invalid array or not an array!`, item);
			return null;
		}
		if (item.length == 1) item = item[0];
		else {
			this._itemList = item;
			item = item[0];
		}
		
		// Get the phrase dictionary for this item
		let phraseDict = PHRASEBOOK[item.name];
		if (phraseDict === undefined) {
			LOGGER.error(`LedgerItem ${item.name} has no phrase dictionary in the phrasebook!`);
			return null;
		}
		if (phraseDict === null) return null; // Skip this item
		
		// Resolve the flavor of this item
		let phraseEntry = phraseDict[item.flavor || 'default'];
		if (phraseEntry === undefined) {
			LOGGER.error(`LedgerItem ${item.name}, flavor "${item.flavor || 'default'}" has no phrase entry in the phrasebook!`);
			return null;
		}
		if (phraseEntry === null) return null; // Skip this item
		
		let self = this;
		return _resolve(phraseEntry, item);
		
		function _resolve(entry, item) {
			if (entry === undefined) {
				LOGGER.error(`LedgerItem ${item.name}'s phrase dictionary has returned an illegal value!`, entry);
				return null;
			}
			if (entry === null) return null;
			if (entry === false) return false;
			
			if (typeof entry === 'string') {
				return self.fillText(entry, item);
			}
			if (typeof entry === 'function') {
				let res = entry.call(self, item);
				return _resolve(res, item);
			}
			if (Array.isArray(entry)) {
				// Shortcut the common case:
				if (entry.length === 1) return _resolve(entry[0]) || null;
				
				// Copy off array, so below editing doesn't edit the main entry
				let array = entry.slice();
				while (array.length) {
					let i = self.rand(array.length);
					let res = _resolve(array[i], item);
					if (res === false) {
						array.splice(i, 1); //Remove this entry as a possibility
						continue;
					}
					return res;
				}
				return null;
			}
			if (this._itemList && entry.multi) {
				return _resolve(entry.multi, item);
			}
			if (entry.single) {
				if (this._itemList) {
					return this._itemList.map(i=>_resolve(entry.single, i));
				} else {
					return _resolve(entry.single, item);
				}
			}
			if (entry.item) { //should never happen
				if (this._itemList) {
					return this._itemList.map(i=>_resolve(entry.item, i));
				} else {
					return _resolve(entry.item, item);
				}
			}
			LOGGER.error(`Resolve failed!`, entry);
			return null;
		}
	}
	
	/**
	 * Replaces all items in a phrase with their proper variable values.
	 * @param {string} text - The string to format.
	 * @param {LedgerItem} item - The ledger item to use as context
	 */
	fillText(text, item) {
		let i = 20;
		while (i > 0) try {
			let phrase = text.replace(/{{([^{}\n]+)}}/gi, (match, key)=>{
				let args = key.split('|');
				let func = args[0];
				args = args.slice(1);
				func = ((arg)=>{
					if (arg === '$') return this.subject.toString.bind(this.subject);
					if (arg === '#') return this.noun.toString.bind(this.noun);
					let res = /^([#$]+)/i.exec(arg);
					if (res && res[1]) {
						this._setSubject = (res[1].indexOf('$') > -1);
						this._setNoun = (res[1].indexOf('#') > -1);
						arg = arg.slice(res[1].length);
					}
					if (arg.startsWith('@')) {
						arg = getProp(item, arg.slice(1));
						if (this._setSubject) this.subject = arg;
						if (this._setNoun) this.noun = arg;
						return arg.toString.bind(arg);
					}
					return FORMAT_FNS[arg.trim()];
				})(func);
				args = args.map((arg)=>{
					if (arg === '$') return this.subject;
					if (arg === '#') return this.noun;
					let res = /^([#$]+)/i.exec(arg);
					if (res && res[1]) {
						this._setSubject = (res[1].indexOf('$') > -1);
						this._setNoun = (res[1].indexOf('#') > -1);
						arg = arg.slice(res[1].length);
					}
					if (arg.startsWith('@')) return getProp(item, arg.slice(1));
					return arg;
				});
				let res = func.apply(this, args);
				if (res === false) throw false; //We can't use this phrase
				return res;
			});
			if (phrase === text) return phrase;
			text = phrase;
			i--; //infinite loop guard
		} catch (e) {
			if (e === false) return false;
			LOGGER.error(`Error in fillText("${text}", ${item})!`, e);
			return false;
		}
		return text;
		
		function getProp(obj, name) {
			if (!name) return obj;
			if (typeof obj !== 'object') throw new TypeError('Cannot getProp of non-object! '+obj);
			
			let subName;
			let subIdx = name.indexOf('.');
			if (subIdx > -1) {
				subName = name.slice(subIdx+1);
				name = name.slice(0, subIdx);
			}
			
			return getProp(obj[name], subName);
		}
	}
}

module.exports = TypeSetter;
