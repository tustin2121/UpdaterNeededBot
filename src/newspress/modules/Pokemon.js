// newspress/modules/Pokemon.js
// The Pokemon reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	PokemonGained, PokemonIsMissing, ApiDisturbance,
} = require('../ledger/Pokemon');

const RULES = [];

/**   ** Pokemon Module **
 * Responsible for discovering new pokemon, keeping track of missing pokemon,
 * keeping track of null boxes, keeping track of daycare, etc.
 */
class PokemonModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 2);
		this.memory.savedBoxes = [];
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		let prev = prev_api.pokemon;
		let curr = curr_api.pokemon;
		
		// If boxes are missing, that is an ApiDisturbance
		if (curr.numNullBoxes) {
			ledger.add(new ApiDisturbance(`${curr.numNullBoxes} PC boxes are missing!`));
		}
		
		// Copy the pokemon map
		let curr_map = Object.assign({}, curr._map);
		let prev_map = Object.assign({}, prev._map);
		
		// Save off valid pokemon boxes in memory and fill in invalid boxes
		for (let bn = 0; bn < curr._pc.length; bn++) {
			if (curr._pc[bn]) {
				this.memory.savedBoxes[bn] = curr._pc[bn].slice();
			} else {
				for (let mon of this.memory.savedBoxes[bn]) {
					curr_map[mon.hash] = mon;
				}
			}
		}
		for (let bn = 0; bn < prev._pc.length; bn++) {
			if (prev._pc[bn]) {
				for (let mon of this.memory.savedBoxes[bn]) {
					prev_map[mon.hash] = mon;
				}
			}
		}
		
		// Determine deltas
		let added   = Object.keys(curr_map).filter(x=>!!prev_map[x]).map(x=>curr_map[x]);
		let removed = Object.keys(prev_map).filter(x=>!!curr_map[x]).map(x=>prev_map[x]);
		
		// Note all Pokemon aquisitions
		for (let mon of added) {
			ledger.add(new PokemonGained(mon));
		}
		// Note all Pokemon missings
		for (let mon of removed) {
			ledger.add(new PokemonIsMissing(mon));
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
	
	finalPass(ledger) {
		let missing = ledger.findAllItemsWithName('PokemonIsMissing');
		//TODO do a query to the updaters, and handle the event where the bot dies before the query is resolved or timed out
	}
}

module.exports = PokemonModule;
