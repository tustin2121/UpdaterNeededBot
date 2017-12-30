// newspress/modules/Options.js
// The Options reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Options Module **
 * Responsible for reporting changes to options, including the level cap.
 */
class OptionsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}

module.exports = OptionsModule;
