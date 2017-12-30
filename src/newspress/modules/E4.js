// newspress/modules/E4.js
// The E4 reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** E4 Module **
 * Keeps track of E4 runs, including champion battles.
 * E4/Champ Attempt counts are stored in this module's memory.
 */
class E4Module extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}

module.exports = E4Module;
