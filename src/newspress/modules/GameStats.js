// newspress/modules/GameStats.js
// The Game-Provided Statistics Monitoring module

const { ReportingModule, Rule } = require('./_base');
const { GameStatChanged, GameSaved, ApiDisturbance } = require('../ledger');

const LOGGER = getLogger('GameStats');

const RULES = [];

class GameStatsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.lastSave = (this.memory.lastSave||{count:0, time:0});
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
		if (!prev_api.rawData || !curr_api.rawData) return; //can't do anything
		let prev = prev_api.getFromRaw('game_stats');
		let curr = curr_api.getFromRaw('game_stats');
		this.debug(`prev=${!!prev}, curr=${!!curr}`);
		if (!prev || !curr) return; //can't do anything
		
		if (prev['games_saved'] < curr['games_saved']) {
			if (prev['games_saved'] < this.memory.lastSave.count) {
				ledger.addItem(new ApiDisturbance({
					reason: `Game's tracked save count (${prev['games_saved']}) has gone down since last known count (${this.memory.lastSave.count})!`,
					code: ApiDisturbance.LOGIC_ERROR,
					score: 1,
				}));
			}
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
		
		
		
		// Testing ones right now:
		checkStat('pokecenter_used');
		checkStat('rested_at_home');
		checkStat('entered_safari_zone');
		checkStat('pokemon_trades');
		checkStat('splash_used');
		checkStat('struggle_used');
		checkStat('slots_jackpots');
		checkStat('contests_entered');
		checkStat('contests_won');
		checkStat('shopping_trips');
		checkStat('got_rained_on');
		checkStat('ribbons_earned');
		checkStat('ledges_jumped');
		checkStat('tvs_watched');
		checkStat('lottery_wins');
		checkStat('cable_car_rides');
		checkStat('hot_spring_baths_taken');
		
		return;
		function checkStat(stat) {
			if (prev[stat] != curr[stat]) {
				ledger.addItem(new GameStatChanged(stat, prev[stat], curr[stat]));
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {}
}

module.exports = GameStatsModule;