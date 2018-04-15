// newspress/modules/Location.js
// The Location reporting module

const { ReportingModule, Rule } = require('./_base');
const { LocationContext, MapContext, LocationChanged, JumpedLedge, ClearedLedge } = require('../ledger');

const LOGGER = getLogger('MaplessModule');
const RULES = [];

/**   ** Location Module **
 * Responsible for reporting movement between maps, assigning importance based on
 * the type of location.
 */
class MaplessModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		this.setDebug(LOGGER, ledger);
		ledger.add(new LocationContext(curr.location));
		
		this.debug(`curr=${curr.location} prev=${prev.location}`);
		if (!curr.location.equals(prev.location)) {
			let item = new LocationChanged(prev.location, curr.location);
			item.flavor = 'nomap';
			ledger.add(item);
		}
	}
}

module.exports = MaplessModule;
