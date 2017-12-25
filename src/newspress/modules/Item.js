// newspress/modules/Item.js
// The Item reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Item Module **
 * Responsible for keeping tabs on all items across bag, pc, and held by pokemon.
 * This includes buying, selling, obtaining, using items.
 */
class ItemModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}


