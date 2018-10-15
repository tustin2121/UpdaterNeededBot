// newspress/modules/Meme.js
// The Meme reporting module

const { ReportingModule, Rule } = require('./_base');
const { MemeReport } = require('../ledger');

const LOGGER = getLogger('MemeModule');

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

RULES.push(new Rule(`Memes: splash count`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLostPP').with('move', "Splash"))
	.then(ledger=>{
		ledger.memory.splashCount++;
	})
);

{
	const TIMEOUT = 1000*60*110; //110 minutes
	RULES.push(new Rule(`Memes: raiding the fridge`)
		.when(ledger=>ledger.hasMap(x=>x.type === 'indoor' && x.width === 18 && x.height === 13))
		.when(ledger=>ledger.has('LocationContext').which(x=>x.x < 6 && x.y < 8))
		.when(ledger=>ledger.memory.lastFridgeMeme < Date.now() + TIMEOUT)
		.then(ledger=>{
			ledger.memory.lastFridgeMeme = Date.now();
			ledger.add(new MemeReport('fridge'));
		})
	);
}

module.exports = MemeModule;