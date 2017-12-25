// newspress/modules/Battle.js
// The Battle reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Battle Module **
 * Keeps track of battles in general, including the ability to refine the reporting
 * of the E4 and Gym modules.
 */
class BattleModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}


