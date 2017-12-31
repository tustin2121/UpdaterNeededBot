// newspress/modules/Location.js
// The Location reporting module

const { ReportingModule, Rule } = require('./_base');
const { LocationContext, LocationChanged } = require('../ledger/Location');

const RULES = [];

/**   ** Location Module **
 * Responsible for reporting movement between maps, assigning importance based on
 * the type of location.
 */
class LocationModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		ledger.add(new LocationContext(curr.location));
		
		if (!curr.location.equals(prev.location)) {
			let item = new LocationChanged(prev.location, curr.location)
			item.flavor = 'nomap';
			ledger.add(item);
		}
	}
}

module.exports = LocationModule;
