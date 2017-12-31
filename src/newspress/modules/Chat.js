// newspress/modules/Chat.js
// The Chat reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Chat Module **
 * Monitors chat for reaction reporting.
 */
class ChatModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = ChatModule;
