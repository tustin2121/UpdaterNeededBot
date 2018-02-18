// newspress/modules/Location.js
// The Location reporting module

const { ReportingModule, Rule } = require('./_base');
const { LocationContext, MapContext, LocationChanged, JumpedLedge, ClearedLedge } = require('../ledger');

const LOGGER = getLogger('LocationModule');
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
		
		LOGGER.debug(`curr=${curr.location} prev=${prev.location}`);
		if (!curr.location.equals(prev.location)) {
			let item = new LocationChanged(prev.location, curr.location);
			item.flavor = 'nomap';
			ledger.add(item);
		}
		
		// For Red/Blue only
		if (curr.location.map_id === 33) { //Route 22 Ledge
			if (curr.location.y > 13 && curr.location.x < 28) { // below ledge
				if (prev.location.y < 13 && prev.location.x < 28) { // above ledge
					LOGGER.error('JUMPED LEDGE LOL!');
					ledger.add(new JumpedLedge(curr));
				}
			}
			if (curr.location.y < 9 && curr.location.x < 14) { // past ledge!
				if (prev.location.y > 8 && prev.location.x < 28) { // not past ledge!
					ledger.add(new ClearedLedge(curr.location));
				}
			}
		}
	}
}

module.exports = LocationModule;
