// newspress/modules/Politics.js
// The Politics reporting module

const { ReportingModule, Rule } = require('./_base');
const { DemocracyContext } = require('../ledger');

const RULES = [];

/**   ** Politics Module **
 * This monitors chat for tpp bot reporting a change of input mode, and reports
 * the start and end of Democracy to the updater.
 */
class PoliticsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { curr_chat:chat }) {
		if (!chat) return; //do nothing when no chat info
		
		//TODO:
		Bot.memory.runFlags['in_democracy'] = false;
		
		if (Bot.runFlag('in_democracy', false)) {
			ledger.add(new DemocracyContext());
		}
		
		// tpp	Inputting is now in democracy mode!
		// tpp	Inputting is now in anarchy mode!
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
}

module.exports = PoliticsModule;
