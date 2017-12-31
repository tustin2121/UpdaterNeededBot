// newspress/modules/Health.js
// The Health reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Health Module **
 * Responsible for tracking when blackouts occur, as well as when a pokemon
 * faints or is healed.
 */
class HealthModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = HealthModule;
