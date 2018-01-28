// newspress/modules/Party.js
// The Party reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	MonLeveledUp, MonEvolved, MonHatched, MonPokerusInfected, MonPokerusCured,
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP,
	MonLearnedMove, MonLearnedMoveOverOldMove, MonForgotMove, MonPPUp,
	MonGiveItem, MonTakeItem, MonSwapItem,
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
			if (!prev.item && curr.item) {
				ledger.addItem(new MonGiveItem(curr, curr.item));
			} else if (prev.item && !curr.item) {
				ledger.addItem(new MonTakeItem(curr, prev.item));
			} else if (prev.item !== curr.item) {
				ledger.addItem(new MonSwapItem(curr, curr.item, prev.item));
			}
			
			
		}
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = PartyModule;
