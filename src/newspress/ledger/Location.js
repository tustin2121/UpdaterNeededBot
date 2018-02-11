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
		super(imp);
		/** @type {SortedLocation} The previous location the player is in. */
		this.prev = prev;
		/** @type {SortedLocation} The now current location the player is in. */
		this.curr = curr;
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	LocationContext, LocationChanged
};