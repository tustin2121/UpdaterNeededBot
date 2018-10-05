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
	
	firstPass(ledger, { curr_chat:chat }) {
		if (!chat) return; //do nothing when no chat info
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
}

module.exports = ChatModule;
