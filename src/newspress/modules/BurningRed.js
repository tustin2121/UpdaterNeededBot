// newspress/modules/BurningRed.js
// The Burning Red module
// The module where dreams come to die.

const { ReportingModule, Rule } = require('./_base');
const {
	Gen1Context, Gen3Context, 
	BurningDownContext, BurningUpContext,
} = require('../ledger');

const LOGGER = getLogger('BurningRedModule');

const RULES = [];

/**   ** Burning Red Module **
 * Responsible for keeping tabs on all items across bag, pc, and held by pokemon.
 * This includes buying, selling, obtaining, using items.
 */
class BurningRedModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 3);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		this.setDebug(LOGGER, ledger);
		if (curr.currentGen == 1) {
			ledger.addItem(new Gen1Context());
			if (curr.currentlyWarping) {
				ledger.addItem(new BurningDownContext());
			}
		} else {
			ledger.addItem(new Gen3Context());
			if (curr.currentlyWarping) {
				ledger.addItem(new BurningUpContext());
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
}

RULES.push(new Rule(`When transitioning to Red, held items become burned.`)
	.when(ledger=>ledger.has('BurningDownContext'))
	.when(ledger=>ledger.has('HeldItemLost').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=>x.flavor = 'burned');
	})
);
RULES.push(new Rule(`When transitioning to Red, items become burned.`)
	.when(ledger=>ledger.has('BurningDownContext'))
	.when(ledger=>ledger.has('LostItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=>x.flavor = 'burned');
	})
);

RULES.push(new Rule(`When in Red, ignore burned items.`)
	.when(ledger=>ledger.has('Gen1Context'))
	.when(ledger=>ledger.has('LostItem', 'HeldItemLost').ofFlavor('burned'))
	.then(ledger=>{
		ledger.postpone(1);
	})
);

RULES.push(new Rule(`When in Red, ignore Pokerus changes`)
	.when(ledger=>ledger.has('Gen1Context'))
	.when(ledger=>ledger.has('MonPokerusInfected', 'MonPokerusCured'))
	.then(ledger=>{
		ledger.postpone(1);
	})
);

module.exports = BurningRedModule;
