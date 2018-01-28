// newspress/modules/Battle.js
// The Battle reporting module

const { ReportingModule, Rule } = require('./_base');
const { BattleContext, BattleStarted, BattleEnded, } = require('../ledger');

const RULES = [];

/**   ** Battle Module **
 * Keeps track of battles in general, including the ability to refine the reporting
 * of the E4 and Gym modules.
 */
class BattleModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 1);
		this.memory.attempts = this.memory.attempts || {};
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		let pb = prev.battle;
		let cb = prev.battle;
		if (cb.in_battle) {
			ledger.addItem(new BattleContext(cb));
		}
		
		if (cb.in_battle && !pb.in_battle) {
			let attempt = 0;
			if (cb.isImportant) {
				attempt = this.memory.attempts[cb.attemptId];
			}
			ledger.addItem(new BattleStarted(cb, attempt));
		}
		else if (!cb.in_battle && pb.in_battle) {
			ledger.addItem(new BattleEnded(pb, true));
			return;
		}
		
		let healthy = cb.party.filter(p=>p.hp);
		if (healthy.length === 0) {
			ledger.addItem(new BattleEnded(pb, false));
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = BattleModule;
