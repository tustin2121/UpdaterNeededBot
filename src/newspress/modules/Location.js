// newspress/modules/Location.js
// The Location reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Location Module **
 * Responsible for reporting movement between maps, assigning importance based on
 * the type of location.
 */
class LocationModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}


