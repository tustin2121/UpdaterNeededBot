// newspress/modules/Meme.js
// The Meme reporting module

const { ReportingModule, Rule } = require('./_base');

const LOGGER = getLogger('ItemModule');

const RULES = [];

/**   ** Meme Module **
 * Has meme rules.
 */
class MemeModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.splashCount = (this.memory.splashCount||3);
	}
	
	// firstPass(ledger, {}) {
	// }
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		this.setDebug(LOGGER, ledger);
		this.debug('Splash count = '+this.memory.splashCount);
	}
}

RULES.push(new Rule(`Pokeballs lost in battle have been thrown`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLostPP').with('move', "Splash"))
	.then(ledger=>{
		ledger.memory.splashCount++;
	})
);


module.exports = MemeModule;