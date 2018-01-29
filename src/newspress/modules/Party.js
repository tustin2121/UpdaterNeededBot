// newspress/modules/Party.js
// The Party reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	MonLeveledUp, MonEvolved, MonHatched, MonPokerusInfected, MonPokerusCured,
	MonFainted, MonKapowed, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP,
	MonLearnedMove, MonLearnedMoveOverOldMove, MonForgotMove, MonPPUp,
	MonGiveItem, MonTakeItem, MonSwapItem,
	MonShinyChanged, MonSparklyChanged, MonAbilityChanged, MonNicknameChanged,
	ApiDisturbance,
} = require('../ledger');

const RULES = [];

/**   ** Party Module **
 * Responsible for discovering differences in the party, including level changes,
 * move learns, name changes, hatches, evolutions, etc.
 */
class PartyModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 1);
		
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		let sameMons = [];
		// Find our mon pairs from previous party to next party.
		for (let p of prev_api.party) {
			for (let c of curr_api.party) {
				if (c.hash === p.hash) {
					sameMons.push({ prev:p, curr:c });
				}
			}
		}
		//TODO Party makeup ApiDisturbance
		
		// Discover items in the party
		for (let { prev, curr } of sameMons) {
			// Level up
			if (prev.level < curr.level) {
				ledger.addItem(new MonLeveledUp(curr, curr.level));
			}
			
			// Evolution, Hatching
			if (prev.species !== curr.species) {
				if (prev.species === 'Egg') {
					ledger.addItem(new MonHatched(curr));
				} else {
					ledger.addItem(new MonEvolved(curr, prev.species))
				}
			}
			
			// Pokerus
			if (!prev.pokerus && curr.pokerus) {
				ledger.addItem(new MonPokerusInfected(curr));
			} else if (prev.pokerus && !curr.pokerus) {
				ledger.addItem(new MonPokerusCured(curr));
			}
			
			// HP
			if (prev.hp > 0 && curr.hp === 0) {
				ledger.addItem(new MonFainted(curr));
			} else if (prev.hp === 0 && curr.hp > 0) {
				ledger.addItem(new MonRevived(curr));
			}
			if (prev.hp > curr.hp) {
				ledger.addItem(new MonHealedHP(curr, prev.hp));
			} else if (prev.hp < curr.hp) {
				ledger.addItem(new MonLostHP(curr, prev.hp));
			}
			
			// Moves (Learns and PP)
			{
				let movePairs = [];
				for (let i = 0; i < 4; i++) {
					let p = prev.moveInfo[i] || { id:0 };
					let c = curr.moveInfo[i] || { id:0 };
					movePairs.push({ p, c });
				}
				// Eliminate duplicates
				lblFix:
				while(true) {
					let numChanges = 0;
					for (let a = 0; a < movePairs.length; a++) {
						for (let b = 0; b < movePairs.length; b++) {
							if (movePairs[a].p.id === movePairs[b].c.id &&
								movePairs[a].c.id === movePairs[b].p.id)
							{
								let temp = movePairs[b].c;
								movePairs[b].c = movePairs[a].c;
								movePairs[a].c = temp;
								continue lblFix;
							}
						}
					}
					break;
				}
				
				for (let pair of movePairs) {
					if (!pair.p.id && pair.c.id) {
						ledger.addItem(new MonLearnedMove(curr, pair.c.name));
					} else if (pair.p.id && !pair.c.id) {
						ledger.addItem(new MonForgotMove(curr, pair.p.name));
					} else if (pair.p.id !== pair.c.id) {
						ledger.addItem(new MonLearnedMoveOverOldMove(curr, pair.c.name, pair.p.name));
					} else {
						if (pair.c.pp < pair.p.pp) {
							ledger.addItem(new MonLostPP(curr, pair.c.name, pair.c.pp, pair.p.pp));
						} else if (pair.c.pp > pair.p.pp) {
							ledger.addItem(new MonHealedPP(curr, pair.c.name, pair.c.pp, pair.p.pp));
						}
						if (pair.c.max_pp < pair.p.max_pp) {
							ledger.addItem(new MonPPUp(curr, pair.c.name, pair.c.pp, pair.p.pp));
						}
					}
				}
			}
			
			// Items
			if (Bot.runOpts('heldItem')) {
				if (!prev.item && curr.item) {
					ledger.addItem(new MonGiveItem(curr, curr.item));
				} else if (prev.item && !curr.item) {
					ledger.addItem(new MonTakeItem(curr, prev.item));
				} else if (prev.item !== curr.item) {
					ledger.addItem(new MonSwapItem(curr, curr.item, prev.item));
				}
			}
			
			// Now things that don't usually randomly change
			if (Bot.runOpts('shiny') && prev.shiny !== curr.shiny) {
				ledger.addItem(new MonShinyChanged(curr));
			}
			if (Bot.runOpts('sparkly') && prev.sparkly !== curr.sparkly) {
				ledger.addItem(new MonSparklyChanged(curr, prev.sparkly));
			}
			if (Bot.runOpts('abilities') && prev.ability !== curr.ability) {
				ledger.addItem(new MonAbilityChanged(curr, prev.ability));
			}
			if (prev.name !== curr.name) {
				ledger.addItem(new MonNicknameChanged(curr, prev.name, prev.nicknamed));
			}
		}
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

const KapowMoves = ['Explosion', 'Self-Destruct', 'Selfdestruct'];//, 'Final Gambit', 'Healing Wish', 'Lunar Dance', 'Momento'];
RULES.add(new Rule(`Fainting when using a KAPOW move means the 'mon KAPOW'd`)
	.when(ledger=>ledger.has('MonFainted'))
	.when(ledger=>ledger.has('MonLostPP').withSame('mon').with('move', KapowMoves))
	.then(ledger=>{
		let items = ledger.demote(0);
		items.forEach(x=>ledger.add(new MonKapowed(x.mon)));
	})
);

RULES.add(new Rule('Abilities are expected to change during evolution')
	.when((ledger)=>ledger.has('MonEvolved'))
	.when((ledger)=>ledger.has('MonAbilityChanged').withSame('mon'))
	.then((ledger)=>{
		ledger.remove(1); //Remove MonAbilityChanged
	})
);
RULES.add(new Rule('Abilities might change during battle')
	.when((ledger)=>ledger.has('BattleContext'))
	.when((ledger)=>ledger.has('MonAbilityChanged'))
	.then((ledger)=>{
		ledger.postpone(1);
	})
);

if (Bot.runOpts('namingMatch')) {
	RULES.add(new Rule('Mons being nicknamed have invalid characters in their names')
		.when(ledger=>ledger.has('MonNicknameChanged').whichMatches('curr', Bot.runOpts('namingMatch')))
		.then(ledger=>{
			ledger.postpone(0);
		})
	);
}



module.exports = PartyModule;
