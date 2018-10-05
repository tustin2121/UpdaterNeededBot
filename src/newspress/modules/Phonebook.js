// newspress/modules/Phonebook.js
// The Phonebook reporting module

const { ReportingModule, Rule } = require('./_base');
const { PhonebookAdd, PhonebookRemove, ApiDisturbance } = require('../ledger');

const RULES = [];

/**   ** Phonebook Module **
 * Keeps track of time between updates, and promotes the importance of an
 * otherwise unimportant update if too long has been spent without an update.
 */
class PhonebookModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		// It's not worth parsing this stuff out beforehand because it will rarely be used.
		let prev = prev_api.getFromRaw('phone_book');
		let curr = curr_api.getFromRaw('phone_book');
		if (!prev || !curr) return; //Can't do anything
		
		let prev_set = new Set(prev);
		let curr_set = new Set(curr);
		
		let add = curr.filter(x=>!prev_set.has(x));
		let rem = prev.filter(x=>!curr_set.has(x));
		
		if (add.length > 1 || rem.length > 1) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `More than 1 phonebook entry has been changed in one update cycle!`,
				score: add.length + rem.length
			}));
		}
		
		add.forEach(x=> ledger.add(new PhonebookAdd(x)));
		rem.forEach(x=> ledger.add(new PhonebookRemove(x)));
	}
	
	// secondPass(ledger) {
	// 	RULES.forEach(rule=> rule.apply(ledger, this) );
	// }
}

module.exports = PhonebookModule;
