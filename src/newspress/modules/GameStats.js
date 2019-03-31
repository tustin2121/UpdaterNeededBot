// newspress/modules/GameStats.js
// The Game-Provided Statistics Monitoring module

const { ReportingModule, Rule } = require('./_base');
const { GameStatChanged, GameSaved, ApiDisturbance } = require('../ledger');

const LOGGER = getLogger('GameStats');

const HANDLERS = {};
const RULES = [];

class GameStatsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.lastSave = (this.memory.lastSave||{count:0, time:0});
		this.memory.gameStats = (this.memory.gameStats || {});
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
		if (!prev_api.rawData || !curr_api.rawData) return; //can't do anything
		let prev = prev_api.getFromRaw('game_stats');
		let curr = curr_api.getFromRaw('game_stats');
		this.debug(`prev=${!!prev}, curr=${!!curr}`);
		if (!prev || !curr) return; //can't do anything
		
		// Grab the list of stats we're tracking and see if any of them changed
		let stats = Object.keys(this.config.stats);
		for (let stat of stats) {
			this.memory.gameStats[stat] = curr[stat];
			if (prev[stat] === curr[stat]) continue;
			// convert to a normalized stat, if possible
			let nstat = this.config.stats[stat] || stat;
			ledger.addItem(new GameStatChanged(nstat, prev[stat], curr[stat]));
			
			if (typeof HANDLERS[nstat] === 'function') {
				HANDLERS[nstat].call(this, ledger, prev[stat], curr[stat]);
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {}
	
	produceStatsReport(prefix = '') {
		let out = `${prefix}Current In-Game Stats:\n`;
		for (let stat in this.memory.gameStats) {
			out += `${stat}: ${this.memory.gameStats[stat]}\n`;
		}
		if (this.config.reportNote) {
			out += this.config.reportNote;
		}
		return out;
	}
}

Object.assign(HANDLERS, {
	GameSaved(ledger, prev, curr) {
		if (curr < this.memory.lastSave.count) {
			ledger.addItem(new ApiDisturbance({
				reason: `Game's tracked save count (${prev['games_saved']}) has gone down since last known count (${this.memory.lastSave.count})!`,
				code: ApiDisturbance.LOGIC_ERROR,
				score: 1,
			}));
		}
		if (prev < curr) {
			let flavor = null;
			let time = Date.now();
			if (time - this.memory.lastSave.time < 1000*60*5) { //if last save was less than 5 minutes ago
				flavor = 'immediate';
			} 
			else if (time - this.memory.lastSave.time < 1000*60*15) { //If last save was less than 15 minutes ago
				flavor = 'again';
			}
			
			ledger.addItem(new GameSaved(flavor));
			this.memory.lastSave.count = curr['games_saved'];
			this.memory.lastSave.time = Date.now();
		}
	},
	
	
});

module.exports = GameStatsModule;