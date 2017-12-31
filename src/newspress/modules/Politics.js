// newspress/modules/Politics.js
// The Politics reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Politics Module **
 * This monitors chat for tpp bot reporting a change of input mode, and reports
 * the start and end of Democracy to the updater.
 */
class PoliticsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		// tpp	Inputting is now in democracy mode!
		// tpp	Inputting is now in anarchy mode!
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = PoliticsModule;
