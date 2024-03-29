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
		super(config, memory, 1);
		this.memory.reportTimes = this.memory.reportTimes || {};
		this.memory.visitTimestamps = this.memory.visitTimestamps || {};
		this.memory.currCheckpoint = this.memory.currCheckpoint || null;
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
		ledger.add(new LocationContext(curr_api.location));
		
		let region = Bot.gameInfo().regionMap;
		if (!(region instanceof MapRegion)) {
			LOGGER.error('Cannot work without a regionMap!');
			return; //Can't continue without a region...
		}
		
		let prev = region.resolve(prev_api.location); //prev_api.location.node = prev;
		let curr = region.resolve(curr_api.location); //curr_api.location.node = curr;
		let prevMap = prev, prevArea = null, prevLoc = prev_api.location;
		let currMap = curr, currArea = null, currLoc = curr_api.location;
		
		if (currMap instanceof MapArea) { currArea = currMap; currMap = currArea.parent; }
		if (prevMap instanceof MapArea) { prevArea = prevMap; prevMap = prevArea.parent; }
		
		if (!currMap || !prevMap) {
			LOGGER.error(`No MapNode found!\n\tcurr => ${curr_api.location} => ${currMap}\n\tprev => ${prev_api.location} => ${prevMap}`);
			return; //Can't continue without a map node...
		}
		ledger.add(new MapContext(currMap, currArea));
		
		// Transit Reporting logic
		if (currMap !== prevMap || currArea !== prevArea) {
			let item = this.generateMapChangedItem({ 
				region, prevMap, currMap, prevArea, currArea, prevLoc, currLoc,
			});
			if (item) ledger.add(item);
		}
		this.memory.visitTimestamps[currMap.locId] = Date.now();
		
		if (currMap.is('checkpoint')) {
			ledger.add(new CheckpointContext(currMap, this.memory.currCheckpoint === currMap.locId));
		}
		
		if (!prev.has('water') && curr.has('water')) {
			ledger.add(new MapMovement('surfStart', curr));
		}
		if (prev.has('water') && !curr.has('water')) {
			ledger.add(new MapMovement('surfEnd', curr));
		}
		
		if (prev.has('ledge') === 'ledge') {
		 	if (curr.has('ledge') === 'jump') {
				ledger.add(new MapMovement('jumpedLedge', curr));
			}
			else if (curr.has('ledge') === 'clear') {
				ledger.add(new MapMovement('clearedLedge', curr));
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		let items;
		if ((items = ledger.findAllItemsWithName('CheckpointUpdated')).length) {
			this.memory.currCheckpoint = items[0].loc.locId;
		}
	}
	
	generateMapChangedItem({ region, prevMap, currMap, prevArea, currArea, prevLoc, currLoc }) {
		const currTime = Date.now();
		let report = region.findTransitReport(prevArea || prevMap, currArea || currMap);
		if (report) return new MapChanged({ prev:prevMap, curr:currMap, report });
		
		// No reports apply to this pairing, so fall back on the templates
		// We only care about reporting changes between maps, not between areas at this point.
		if (currMap === prevMap) return null;
		
		// Don't report inconsequential maps
		if (currMap.is('inconsequential') || prevMap.is('inconsequential')) return null;
		if (currMap.has('inconsequential') !== false) { //explicitly false bypasses this check
			// Don't report if the map names are the same
			if (currMap.name === prevMap.name) return null;
		}
		
		let item = new MapChanged({ prev:prevMap, curr:currMap });
		
		let lastVisit = this.memory.visitTimestamps[currMap.locId];
		if (!lastVisit) { //first time visiting
			if (currMap.is('town')) { item.flavor = 'town_new'; return item; }
			if (currMap.is('gym')) { item.flavor = 'gym_new'; return item; }
		}
		let back = '';
		if (lastVisit + ( 2*60*1000) > currTime) back = '_nvm'; //visited in the last 2 minutes
		if (lastVisit + (15*60*1000) > currTime) back = '_back'; //visited in the last 15 minutes
		
		{
			const P = prevMap.floor;
			const C = currMap.floor;
			if (P !== 0 && C !== 0) {
				const stairs = (currMap.type === 'cave')? 'ladder':'stairs';
				if (C > P) { item.flavor = `floor_${stairs}_up`; return item; }
				if (C < P) { item.flavor = `floor_${stairs}_down`; return item; }
			}
		}{
			const P = prevMap.is('entralink');
			const C = currMap.is('entralink');
			if (!P && C) { item.flavor = `entralink_enter${back}`; return item; }
			if (P && !C) { item.flavor = `entralink_exit${back}`; return item; }
		}{
			const P = prevMap.is('dungeon');
			const C = currMap.is('dungeon');
			if (!P && C) { item.flavor = `dungeon_enter${back}`; return item; }
			if (P && !C) { item.flavor = `dungeon_exit${back}`; return item; }
		}{
			const P = prevMap.is('gym');
			const C = currMap.is('gym');
			if (!P && C) { item.flavor = `gym_enter${back}`; return item; }
			if (P && !C) { item.flavor = `gym_exit${back}`; return item; }
		}{
			const T = prevMap.is('town') && currMap.is('town');
			const P = prevMap.within('teleport', prevLoc.x, prevLoc.y);
			const C = currMap.within('teleport', currLoc.x, currLoc.y);
			if (T) {
				if (P && C) { item.flavor = `town_teleport${back}`; return item; }
			}
		}
		if (Bot.runFlag('fly_logic')) {
			//TODO Determine if we're currently in a town, near a flyspot, and weren't either before,
			//and determine if where we were previously was not an adjacent map space
			//{ item.flavor = `flt${back}`; return item; }
		}{
			if (prevMap.is('route') && currMap.is('town')) { item.flavor = `town_enter${back}`; return item; }
			if (prevMap.is('town') && currMap.is('route')) { item.flavor = `town_exit${back}`; return item; }
		}{
			const P = prevMap.is('indoors');
			const C = currMap.is('indoors');
			if (!P && C) { item.flavor = `enter${back}`; return item; }
			if (P && !C) { item.flavor = `exit${back}`; return item; }
		}
		item.flavor = `default${back}`;
		return item;
	}
}

if (Bot.runOpts('checkpointOnEnter')) { // gen 1 only
	RULES.push(new Rule(`When fully healing at a center, set a checkpoint`)
		.when(ledger=>ledger.has('MapChanged'))
		.when(ledger=>ledger.has('CheckpointContext').with('isCurrent', false).unmarked())
		.then(ledger=>{
			let item = ledger.mark(1).get(1)[0];
			item.isCurrent = true;
			ledger.add(new CheckpointUpdated(item.loc));
		})
	);
} else {
	RULES.push(new Rule(`When entering a center, set a checkpoint`)
		.when(ledger=>ledger.has('CheckpointContext').with('isCurrent', false).unmarked())
		.when(ledger=>ledger.has('FullHealed'))
		.when(ledger=>ledger.hasnt('BlackoutContext'))
		.then(ledger=>{
			let item = ledger.mark(0).get(0)[0];
			item.isCurrent = true;
			ledger.add(new CheckpointUpdated(item.loc));
		})
	);
}

{
	const itemIds = Bot.runOpts('itemIds_escapeRope');
	RULES.push(new Rule(`If escaping a dungeon and we lose an escape rope, we used it.`)
		.when(ledger=>ledger.has('MapChanged').with('flavor', 'dungeon_exit', 'dungeon_exit_back'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.demote(1);
			item.flavor = 'dungeon_escaperope';
		})
	);
}

RULES.push(new Rule(`When blacking out to a center, use a special set of phrases`)
	.when(ledger=>ledger.has('BlackoutContext').with('revived', false))
	.when(ledger=>ledger.has('MapChanged').unmarked())
	.then(ledger=>{
		ledger.get(0).forEach(x=>x.revived = true);
		let item = ledger.mark(1).get(1).forEach(x=>x.flavor = 'blackout');
	})
);

module.exports = LocationModule;
