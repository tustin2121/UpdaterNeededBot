// newspress/modules/Pokemon.js
// The Pokemon reporting module

const { ReportingModule, Rule } = require('./_base');
const { PokemonGained, PokemonIsMissing } = require('../ledger/Pokemon');

const RULES = [];

/**   ** Pokemon Module **
 * Responsible for discovering new pokemon, keeping track of missing pokemon,
 * keeping track of null boxes, keeping track of daycare, etc.
 */
class PokemonModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		//TODO put pokemon boxes in memory and use them instead of previous
		//TODO if boxes are missing, that is an ApiDisturbance
		
		// Retrieve the pokemon delta between previous and current
		let delta = curr.pokemon.getDelta(prev.pokemon);
		
		// Note all Pokemon aquisitions
		for (let mon of delta.added) {
			ledger.add(new PokemonGained(mon));
		}
		// Note all Pokemon missings
		for (let mon of delta.removed) {
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
