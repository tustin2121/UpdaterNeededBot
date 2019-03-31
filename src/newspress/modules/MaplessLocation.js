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
		let context = new LocationContext(curr.location);
		ledger.add(context);
		
		if (prev.x !== curr.x || prev.y !== curr.y || prev.z !== curr.z) {
			context.flavor = 'moving';
		}
		
		this.debug(`curr=${curr.location} prev=${prev.location}`);
		if (!curr.location.equals(prev.location)) {
			let item = new LocationChanged(prev.location, curr.location);
			item.flavor = 'nomap';
			ledger.add(item);
		}
	}
}

module.exports = MaplessModule;
