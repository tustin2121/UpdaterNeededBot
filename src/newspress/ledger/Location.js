// newspress/ledger/Location.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { SortedLocation } = require('../../api/pokedata');
const { MapNode, MapArea, TransitReport } = require('../../api/mapnode');

/////////////////// Basic Items ///////////////////

/**
 * A context item which tells other modules the current basic location info.
 * This item stores SortedLocation objects, when MapNodes are not available.
 */
class LocationContext extends LedgerItem {
	constructor(loc) {
		if (!(loc instanceof SortedLocation))
			throw new TypeError('Location context must be a SortedLocation object!');
		
		super(0.2);
		this.loc = loc;
		this.x = loc.x;
		this.y = loc.y;
		this.z = loc.z;
	}
}

/** Indicates that we have changed locations (when we don't have any map information) */
class LocationChanged extends LedgerItem {
	constructor(prev, curr, imp=1) {
		super(imp, {sort:-10});
		/** @type {SortedLocation} The previous location the player is in. */
		this.prev = prev;
		/** @type {SortedLocation} The now current location the player is in. */
		this.curr = curr;
	}
}


/**
 * A context item which tells other modules the current map node info.
 * This item stores MapNode objects.
 */
class MapContext extends LedgerItem {
	constructor(node, area) {
		if (!(node instanceof MapNode)) throw new TypeError('Map context must be a MapNode-type object!');
		// if (!(area instanceof MapArea)) throw new TypeError('Map context must be a MapArea-type object!');
		
		super(0.2);
		this.loc = node;
		this.area = area;
	}
	get inShop() { //convience for Rules checking for being in or near a shop
		//TODO
		return false;
	}
}

/** Indicates that we have changed locations (when we have map information) */
class MapChanged extends LedgerItem {
	constructor({ prev, curr, report, type=null }) {
		if (report instanceof TransitReport && !type) {
			type = 'report';
			if (report.text.startsWith('!'))
				type = report.text.slice(1);
		}
		
		super(1, { flavor:type });
		/** @type {MapNode|MapArea} The previous location the player is in. */
		this.prev = prev;
		/** @type {MapNode|MapArea} The now current location the player is in. */
		this.curr = curr;
		/** @type {TransitReport} The report that should be used for this transit */
		this.report = report;
	}
}


/////////////////// Advanced Items ///////////////////

/** Indicates that this location is a potential or current checkpoint. */
class CheckpointContext extends LedgerItem {
	constructor(node, curr) {
		super(0);
		this.loc = node;
		this.isCurrent = curr;
	}
}

/** Indicates that we have updated our checkpoint to the given location. */
class CheckpointUpdated extends LedgerItem {
	constructor(loc) {
		super(1);
		/** @type {MapNode|MapArea} The now current location the player is in. */
		this.loc = loc;
	}
	get areaName() {
		if (!this.loc) return false;
		return this.loc.areaName || this.loc.name || false;
	}
}


/** Indicates that we have executed a notable movement in the game */
class MapMovement extends LedgerItem {
	constructor(flavor, curr_api) {
		super(1, { flavor });
		this.curr_api = curr_api;
		this.loc = curr_api.location;
	}
	get randomMon(){
		try {
			if (this._rmon) return this._rmon; //sticky
			let party = this.curr_api.party;
			this._rmon = party[Math.floor(Math.random()*party.length)];
			this._rmon.species.length; //test to be sure this won't break
			return this._rmon;
		} catch (e) {
			getLogger('MapMovement').error(e);
			return { species:`One of our pokemon`, gender:'it', };
		}
	}
	get surfMon() {
		try {
			if (this._rmon) return this._rmon; //sticky
			let party = this.curr_api.party.filter(x=>x.hms.surf);
			this._rmon = party[0];
			this._rmon.species.length; //test to be sure this won't break
			return this._rmon;
		} catch (e) {
			getLogger('MapMovement').error(e);
			return { species:`our surfer`, gender:'it', };
		}
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	LocationContext, LocationChanged,
	MapContext, MapChanged,
	CheckpointContext, CheckpointUpdated,
	MapMovement,
};