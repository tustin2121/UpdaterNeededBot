// newspress/modules/GameStats.js
// The Run-Determined Statistics Monitoring module

const { ReportingModule, Rule } = require('./_base');
const { RunStatChanged, BlackoutContext, ApiDisturbance } = require('../ledger');

const LOGGER = getLogger('GameStats');

const RULES = [];

class RunStatsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 9);
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		this.debug(`Stats: ${JSON.stringify(this.memory, null, ' ')}`);
	}
	
	incrementStat(stat, delta=1) {
		this.memory[stat] = (this.memory[stat]||0);
		let item = new RunStatChanged(stat, this.memory[stat], this.memory[stat]+delta);
		this.memory[stat] += 1;
		return item;
	}
}

RULES.push(new Rule(`RunStat: Blackout Count`)
	.when(ledger=>ledger.has('BlackoutContext').which(x=>x.ttl == BlackoutContext.STARTING_TTL).unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('blackoutCount'));
	})
);
RULES.push(new Rule(`RunStat: Battle Count`)
	.when(ledger=>ledger.has('BattleStarted').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('battleCount'));
	})
);
RULES.push(new Rule(`RunStat: Trainer Battle Count`)
	.when(ledger=>ledger.has('BattleStarted').with('battle.trainer').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('trainerBattleCount'));
	})
);
RULES.push(new Rule(`RunStat: Faint Count`)
	.when(ledger=>ledger.has('MonFainted').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('faintCount'));
	})
);
RULES.push(new Rule(`RunStat: Faint Count on Blackout`)
	.when(ledger=>ledger.hasnt('MonFainted'))
	.when(ledger=>ledger.has('BlackoutContext').which(x=>x.ttl == BlackoutContext.STARTING_TTL).unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('faintCount'));
	})
);


RULES.push(new Rule(`RunStat: Evolution Count`)
	.when(ledger=>ledger.has('MonEvolved').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('evolutionCount'));
	})
);
RULES.push(new Rule(`RunStat: Hatch Count`)
	.when(ledger=>ledger.has('MonHatched').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('eggsHatched'));
	})
);


RULES.push(new Rule(`RunStat: Pokerus Count`)
	.when(ledger=>ledger.has('MonPokerusInfected').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('pokerusCount'));
	})
);
RULES.push(new Rule(`RunStat: Level Count`)
	.when(ledger=>ledger.has('MonLeveledUp').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('levelUpCount'));
	})
);
RULES.push(new Rule(`RunStat: Move Learn Count`)
	.when(ledger=>ledger.has('MonLearnedMove', 'MonLearnedMoveOverOldMove').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('moveLearnCount'));
	})
);


RULES.push(new Rule(`RunStat: Ball Toss Count`)
	.when(ledger=>ledger.has('UsedBallInBattle').unmarked())
	.then(ledger=>{
		let count = ledger.mark(0).get(0).reduce((acc, x)=>acc + x.amount, 0);
		ledger.add(ledger.module.incrementStat('ballsTossed', count));
	})
);
RULES.push(new Rule(`RunStat: HP Lost`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLostHP').unmarked())
	.then(ledger=>{
		let count = ledger.mark(1).get(1).reduce((acc, x)=>acc + (x.prev - x.curr), 0);
		ledger.add(ledger.module.incrementStat('hpLost', count));
	})
);
RULES.push(new Rule(`RunStat: Move PP Used`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLostPP').unmarked())
	.then(ledger=>{
		let count = ledger.mark(1).get(1).reduce((acc, x)=>acc + (x.prev - x.curr), 0);
		ledger.add(ledger.module.incrementStat('movePPUsed', count));
	})
);
RULES.push(new Rule(`RunStat: Splash Count`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLostPP').with('move.name', "Splash").unmarked())
	.then(ledger=>{
		ledger.mark(1);
		ledger.add(ledger.module.incrementStat('splashCount'));
	})
);
RULES.push(new Rule(`RunStat: Metronome Count`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLostPP').with('move.name', "Metronome").unmarked())
	.then(ledger=>{
		ledger.mark(1);
		ledger.add(ledger.module.incrementStat('metronomeCount'));
	})
);

RULES.push(new Rule(`RunStat: API Disturbances`)
	.when(ledger=>ledger.has('ApiDisturbance').unmarked())
	.then(ledger=>{
		ledger.mark(0);
		ledger.add(ledger.module.incrementStat('apiDisturbances'));
	})
);



module.exports = RunStatsModule;