// newspress/modules/Timing.js
// The Timing reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Timing Module **
 * Keeps track of time between updates, and promotes the importance of an
 * otherwise unimportant update if too long has been spent without an update.
 */
class TimingModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}


