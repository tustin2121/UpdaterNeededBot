// newspress/modules/Location.js
// The Location reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	LocationContext, MapContext, MapChanged, CheckpointContext, CheckpointUpdated,
	MapMovement,
} = require('../ledger');
const { MapRegion, MapNode, MapArea } = require('../../api/mapnode');

const LOGGER = getLogger('LocationModule');
const RULES = [];

/**   ** Location Module **
 * Responsible for reporting movement between maps, assigning importance based on
 * the type of location.
 */
class LocationModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.reportTimes = this.memory.reportTimes || {};
		this.memory.visitTimestamps = this.memory.visitTimestamps || {};
		this.memory.currCheckpoint = this.memory.currCheckpoint || null;
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		ledger.add(new LocationContext(curr_api.location));
		
		let region = Bot.gameInfo().regionMap;
		if (!(region instanceof MapRegion)) {
			LOGGER.error('Cannot work without a regionMap!');
			return; //Can't continue without a region...
		}
		
		let prev = region.resolve(prev_api.location);
		let curr = region.resolve(curr_api.location);
		let prevMap = prev, prevArea = null;
		let currMap = curr, currArea = null;
		
		if (currMap instanceof MapArea) { currArea = currMap; currMap = currArea.parent; }
		if (prevMap instanceof MapArea) { prevArea = prevMap; prevMap = prevArea.parent; }
		
		if (!currMap || !prevMap) {
			LOGGER.error(`No MapNode found!\n\tcurr => ${curr_api.location} => ${currMap}\n\tprev => ${prev_api.location} => ${prevMap}`);
			return; //Can't continue without a map node...
		}
		ledger.add(new MapContext(currMap, currArea));
		
		// Transit Reporting logic
		if (currMap !== prevMap || currArea !== prevArea) {
			let item = this.generateMapChangedItem({ region, prevMap, currMap, prevArea, currArea });
			if (item) ledger.add(item);
		}
		this.memory.visitTimestamps[currMap.locId] = Date.now();
		
		if (currMap.is('checkpoint')) {
			ledger.add(new CheckpointContext(currMap, this.memory.currCheckpoint === currMap.locId));
		}
		
		if (!prev.has('water') && curr.has('water')) {
			let surfMon = curr_api.party.filter(x=>x.hms.fly);
			ledger.add(new MapMovement('surfStart', curr_api));
		}
		if (prev.has('water') && !curr.has('water')) {
			let surfMon = curr_api.party.filter(x=>x.hms.fly);
			ledger.add(new MapMovement('surfEnd', curr_api));
		}
		
		if (prev.has('ledge') === 'ledge') {
		 	if (curr.has('ledge') === 'jump') {
				ledger.add(new MapMovement('jumpedLedge', curr_api));
			}
			else if (curr.has('ledge') === 'clear') {
				ledger.add(new MapMovement('clearedLedge', curr_api));
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
	
	finalPass(ledger) {
		let items;
		if ((items = ledger.findAllItemsWithName('CheckpointUpdated')).length) {
			this.memory.currCheckpoint = items[0].loc.locId;
		}
	}
	
	generateMapChangedItem({ region, prevMap, currMap, prevArea, currArea }) {
		let reports = region.findReports(prevArea || prevMap, currArea || currMap);
		let currTime = Date.now();
		for (let report of reports) {
			let lastUsed = this.memory.reportTimes[report.id];
			if (lastUsed + report.timeout > currTime) continue; //can't use this report again so soon
			return new MapChanged({ prev:prevMap, curr:currMap, report });
		}
		// No reports apply to this pairing, so fall back on the templates
		// We only care about reporting changes between maps, not between areas at this point.
		if (currMap === prevMap) return null;
		
		// Don't report inconsequential maps
		if (currMap.is('inconsequential') || prevMap.is('inconsequential')) return null;
		
		let item = new MapChanged({ prev:prevMap, curr:currMap });
		
		let lastVisit = this.memory.visitTimestamps[currMap.locId];
		if (!lastVisit) { //first time visiting
			if (currMap.is('town')) { item.flavor = 'new-town'; return item; }
		}
		let back = (lastVisit + (15*60*1000) > currTime); //visited in the last 15 minutes
		
		if (!prevMap.is('dungeon') && currMap.is('dungeon')) {
			item.flavor = 'enter-dungeon'; return item;
		}
		if (prevMap.is('dungeon') && !currMap.is('dungeon')) {
			item.flavor = 'exit-dungeon'; return item;
		}
		
		
		if (!prevMap.is('indoors') && currMap.is('indoors')) ;
		
		
	}
}

RULES.push(new Rule(`When fully healing at a center, set a checkpoint`)
	.when(ledger=>ledger.has('FullHealed'))
	.when(ledger=>ledger.has('CheckpointContext').with('isCurrent', false))
	.then(ledger=>{
		let item = ledger.get(1);
		item.isCurrent = true;
		ledger.add(new CheckpointUpdated(item.loc));
	})
);

module.exports = LocationModule;
