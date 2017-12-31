// newspress/ledger/Location.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/** A context item which  */
class LocationContext extends LedgerItem {
	constructor(loc) {
		super(0.5);
		this.loc = loc;
	}
}

/** Indicates that a new pokemon has appeared in the API */
class LocationChanged extends LedgerItem {
	constructor({ prev, curr, importance=1 }) {
		super(importance);
		/** @type {SortedLocation} The previous location the player is in. */
		this.prev = prev;
		/** @type {SortedLocation} The now current location the player is in. */
		this.curr = curr;
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	LocationChanged
};