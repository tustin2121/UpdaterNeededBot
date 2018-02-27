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
		if (curr && curr !== 'lobby' && curr !== 'hallOfFame') {
			inE4 = true;
		}
		
		if (!this.memory.inE4Run && inE4) {
			// We're now in a E4
			if (this.memory.haveWon) {
				this.memory.haveWon = false;
				this.memory.rematchCount++;
				this.memory.e4Attempts = 0;
				this.memory.champAttempts = 0;
			}
			this.memory.inE4Run = true;
			this.memory.e4Attempts++;
			ledger.addItem(new E4BeginRun(this.memory.e4Attempts, 'rematch')); //TODO remove rematch hack
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
			if (prev.startsWith('e') && (curr === 'champion' || curr === 'champ')) {
				this.memory.champAttempts++;
				ledger.addItem(new E4ReachChampion(this.memory.champAttempts));
			}
			if (curr === 'hallOfFame' && !this.memory.haveWon) { //should never happen, sanity check
				this.memory.haveWon = true;
				this.memory.inE4Run = false;
				ledger.addItem(new E4HallOfFame(this.memory.e4Attempts, this.memory.champAttempts));
			}
			
		}
		else if (this.memory.inE4Run && !inE4) {
			this.memory.inE4Run = false;
			if (curr === 'hallOfFame' && !this.memory.haveWon) {
				this.memory.haveWon = true;
				ledger.addItem(new E4HallOfFame(this.memory.e4Attempts, this.memory.champAttempts));
			} else {
				// We're no longer in an E4 run
				ledger.addItem(new E4EndRun(this.memory.e4Attempts));
			}
		}
		
		if (inE4) {
			ledger.addItem(new E4RunContext(this.memory, curr));
		}
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
	
	finalPass(ledger) {
		{
			let items = ledger.findAllItemsWithName('E4BeginRun');
			if (items.length) {
				let game = '';
				if (Bot.runConfig.numGames > 1) {
					game = Bot.gameInfo(this.gameIndex).name;
					game = ` in ${game}`;
				}
				let ping = (Bot.taggedIn===true || Bot.taggedIn===this.gameIndex);
				let txt = items.map(x=>{
					if (ping) {
						return `We're locked into the E4${game}! This is Attempt #${x.attempt}`
					} else {
						return `This is E4 Attempt #${x.attempt}${game}.`;
					}
				}).join('\n');
				Bot.alertUpdaters(txt, ping, true);
			}
		}{
			let items = ledger.findAllItemsWithName('E4ReachChampion');
			if (items.length) {
				let game = '';
				if (Bot.runConfig.numGames > 1) {
					game = Bot.gameInfo(this.gameIndex).name;
					game = ` in ${game}`;
				}
				let ping = (Bot.taggedIn===true || Bot.taggedIn===this.gameIndex);
				let txt = items.map(x=>{
					if (ping) {
						return `**We've reached the champion's chamber${game}!** Someone might want to play-by-play!! Champion Attempt #${x.attempt}`
					} else {
						return `This is Champion Attempt #${x.attempt}${game}.`;
					}
				}).join('\n');
				Bot.alertUpdaters(txt, ping, true);
			}
		}
	}
}

module.exports = E4Module;
