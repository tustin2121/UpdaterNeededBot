// newspress/modules/Gym.js
// The Gym reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Gym Module **
 * Keeps track of important battles, including gyms, team bosses, and legendaries.
 * Other attempt counts are stored in this module's memory. This includes reporting
 * Badge changes.
 */
class GymModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}

module.exports = GymModule;
