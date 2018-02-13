// newspress/ledger/Item.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { Pokemon } = require('../../api/pokedata');

/////////////////// Basic Items ///////////////////

/** Indicates we blacked out. */
class Blackout extends LedgerItem {
	constructor(type) {
		super(2, {flavor:type, sort:20});
	}
}

/** Indicates we have been fully healed. */
class FullHealed extends LedgerItem {
	constructor(type) {
		super(2, {flavor:type});
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	Blackout, FullHealed,
};