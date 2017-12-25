// newspress/modules/Party.js
// The Party reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Party Module **
 * Responsible for discovering differences in the party, including level changes,
 * move learns, name changes, hatches, evolutions, etc.
 */
class PartyModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}


