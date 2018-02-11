// newspress/modules/Location.js
// The Location reporting module

const { ReportingModule, Rule } = require('./_base');
const { LocationContext, MapContext, LocationChanged } = require('../ledger');

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
		let region = Bot.gameInfo().regionMap;
		if (region) {
			let node = region.find(curr.location);
			if (node) {
				ledger.add(new MapContext(node));
			}
		}
		ledger.add(new LocationContext(curr.location));
		
		getLogger('LocationModule').debug(`curr=${curr.location} prev=${prev.location}`);
		if (!curr.location.equals(prev.location)) {
			let item = new LocationChanged(prev.location, curr.location);
			item.flavor = 'nomap';
			ledger.add(item);
		}
	}
}

module.exports = LocationModule;
