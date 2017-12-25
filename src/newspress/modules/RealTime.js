// newspress/modules/RealTime.js
// The RealTime reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** RealTime Module **
 * Responsible for reporting changes to the time.
 */
class RealTimeModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}


