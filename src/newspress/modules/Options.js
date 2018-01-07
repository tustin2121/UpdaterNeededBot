// newspress/modules/Options.js
// The Options reporting module

const { ReportingModule, Rule } = require('./_base');
const { OptionsChanged } = require('../ledger');

const RULES = [];

/**   ** Options Module **
 * Responsible for reporting changes to options, including the level cap.
 */
class OptionsModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		let po = prev.rawData.options;
		let co = curr.rawData.options;
		if (!po || !co) return;
		
		let changes = {};
		for (let key in co) {
			if (co[key] !== po[key]) {
				changes[key] = co[key];
			}
		}
		ledger.addItem(new OptionsChanged(changes));
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
	
	finalPass(ledger) {
		// If there's nothing else to report on, report on the options changing
		let item = ledger.findAllItemsWithName('OptionsChanged');
		if (ledger.getNumberOfImportantItems() === 0) {
			item.forEach(x=>x.importance = 1);
		}
	}
}

module.exports = OptionsModule;
