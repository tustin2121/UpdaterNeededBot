// newspress/modules/E4.js
// The E4 reporting module

const { ReportingModule, Rule } = require('./_base');
const { E4RunContext, E4BeginRun, E4ReachChampion, E4EndRun, E4HallOfFame, } = require('../ledger');

const RULES = [];

/**   ** E4 Module **
 * Keeps track of E4 runs, including champion battles.
 * E4/Champ Attempt counts are stored in this module's memory.
 */
class E4Module extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
		this.memory.inE4Run = (this.memory.inE4Run || false);
		this.memory.haveWon = (this.memory.haveWon || false);
		
		this.memory.e4Attempts = (this.memory.e4Attempts || 0);
		this.memory.champAttempts = (this.memory.champAttempts || 0);
		this.memory.rematchCount = (this.memory.rematchCount || 0);
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		let prev = prev_api.location.is('e4');
		let curr = curr_api.location.is('e4');
		
		let inE4 = false;
		if (curr && curr !== 'lobby') {
			inE4 = true;
		}
		
		if (!this.memory.inE4Run && inE4) {
			// We're now in a E4
			if (this.memory.haveWon) {
				this.memory.haveWon = false;
				this.memory.rematchCount++;
			}
			this.memory.inE4Run = true;
			this.memory.e4Attempts++;
			ledger.addItem(new E4BeginRun(this.memory.e4Attempts));
		}
		else if (this.memory.inE4Run && inE4) {
			// While we're in E4
			if (prev.startsWith('e') && curr.startsWith('e')) {
				if (curr[1] < prev[1]) {
					ledger.addItem(new E4EndRun(this.memory.e4Attempts));
					this.memory.e4Attempts++;
					ledger.addItem(new E4BeginRun(this.memory.e4Attempts, 'quick'));
				}
			}
			if (prev.startsWith('e') && curr === 'champion') {
				this.memory.champAttempts++;
				ledger.addItem(new E4ReachChampion(this.memory.champAttempts));
			}
			if (curr === 'hallOfFame' && !this.memory.haveWon) {
				ledger.addItem(new E4HallOfFame(this.memory.e4Attempts, this.memory.champAttempts));
				this.memory.haveWon = true;
			}
			
		}
		else if (this.memory.inE4Run && !inE4) {
			// We're no longer in an E4 run
			ledger.addItem(new E4EndRun(this.memory.e4Attempts));
		}
		
		if (inE4) {
			ledger.addItem(new E4RunContext(Object.assign({}, this.memory)));
		}
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = E4Module;
