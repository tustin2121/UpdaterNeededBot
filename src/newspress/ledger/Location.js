// newspress/ledger/Location.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { SortedLocation } = require('../../api/pokedata');
const { MapNode } = require('../../mapinfo');

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
	}
}

/**
 * A context item which tells other modules the current map node info.
 * This item stores MapNode objects.
 */
class MapContext extends LedgerItem {
	constructor(loc) {
		if (!(loc instanceof MapNode))
			throw new TypeError('Location context must be a SortedLocation object!');
		
		super(0.2);
		this.loc = loc;
	}
	get inShop() { //convience for Rules checking for being in or near a shop
		//TODO
		return false;
	}
}

/** Indicates that a new pokemon has appeared in the API */
class LocationChanged extends LedgerItem {
	constructor(prev, curr, imp=1) {
		super(imp, {sort:-10});
		/** @type {SortedLocation} The previous location the player is in. */
		this.prev = prev;
		/** @type {SortedLocation} The now current location the player is in. */
		this.curr = curr;
	}
}

/** Indicates that we've jumped a hard ledge, like the Kanto Route 22 ledge */
class JumpedLedge extends LedgerItem {
	constructor(curr_api) {
		super(1);
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
			getLogger('JumpedLedge').error(e);
			return { species:`One of our pokemon`, gender:'it', };
		}
	}
}

/** Indicates that we've cleared a hard ledge, like the Kanto Route 22 ledge */
class ClearedLedge extends LedgerItem {
	constructor(loc) {
		super(1);
		this.loc = loc;
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	LocationContext, LocationChanged, MapContext,
	JumpedLedge, ClearedLedge,
};