// newspress/modules/Politics.js
// The Politics reporting module

const { ReportingModule, Rule } = require('./_base');
const { DemocracyContext, InputModeChanged } = require('../ledger');

const LOGGER = getLogger('Politics');

const RULES = [];

/**   ** Politics Module **
 * This monitors chat for tpp bot reporting a change of input mode, and reports
 * the start and end of Democracy to the updater.
 */
class PoliticsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.lastDemoInput = (this.memory.lastDemoInput || 0);
	}
	
	get democracy() { return Bot.memory.runFlags['in_democracy']; }
	set democracy(val) { Bot.memory.runFlags['in_democracy'] = val; }
	
	firstPass(ledger, { curr_chat:chat }) {
		this.setDebug(LOGGER, ledger);
		this.debug('chat:', chat);
		if (!chat) return; //do nothing when no chat info
		let { tpp:tppMsgs } = chat;
		
		this.debug('tppMsgs:', tppMsgs);
		
		let res;
		for (let msg of tppMsgs) {
			msg = msg.trim();
			if ((res = /^Inputting is now in (anarchy|democracy) mode!$/i.exec(msg))) {
				this.democracy = (res[1] === 'democracy');
				ledger.add(new InputModeChanged(res[1]));
			}
			if (/^Voting has started for the next input!$|^The winning input is/i.test(msg)) {
				if (!this.democracy) this.democracy = true;
				this.memory.lastDemoInput = Date.now();
			}
			// Ignore other messages
		}
		
		if (this.democracy && this.memory.lastDemoInput < Date.now() - (1000 * 60 * 1)) {
			// If there hasn't been a demo input read from TPP bot for 5 minutes, chances are we're in anarchy.
			this.democracy = false;
		}
		
		this.debug('demo after:', this.democracy);
		
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
