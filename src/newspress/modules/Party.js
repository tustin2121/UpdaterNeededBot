// newspress/modules/Party.js
// The Party reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	MonLeveledUp, MonEvolved, MonHatched, MonPokerusInfected, MonPokerusCured,
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP,
} = require('../ledger');

const RULES = [];

/**   ** Party Module **
 * Responsible for discovering differences in the party, including level changes,
 * move learns, name changes, hatches, evolutions, etc.
 */
class PartyModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
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
			//TODO if all four moves change, that is an ApiDisturbance
			
			//TODO
			
		}
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = PartyModule;
