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
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		let pb = prev.battle;
		let cb = prev.battle;
		if (cb.in_battle) {
			ledger.addItem(new BattleContext(cb));
		}
		
		if (cb.in_battle && !pb.in_battle) {
			ledger.addItem(new BattleStarted(cb));
		}
		else if (!cb.in_battle && pb.in_battle) {
			ledger.addItem(new BattleEnded(pb, true));
			return;
		}
		
		// let healthy = cb.enemy_party.;
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = BattleModule;
