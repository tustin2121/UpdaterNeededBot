// newspress/ledger/Item.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { Pokemon } = require('../../api/pokedata');

/////////////////// Basic Items ///////////////////

/** Indicates that a single item has been gained. */
class GainItem extends LedgerItem {
	constructor(item, amount=1) {
		super(1);
		this.item = item;
		this.amount = amount;
	}
}

/** Indicates that a single item has been lost. */
class LostItem extends LedgerItem {
	constructor(item, amount=1) {
		super(1);
		this.item = item;
		this.amount = amount;
	}
}

/** Indicates that a single item has been stored in the PC. */
class StoredItemInPC extends LedgerItem {
	constructor(item, amount=1) {
		super(1);
		this.item = item;
		this.amount = amount;
	}
}

/** Indicates that a single item has been taken out of the PC. */
class RetrievedItemFromPC extends LedgerItem {
	constructor(item, amount=1) {
		super(1);
		this.item = item;
		this.amount = amount;
	}
}

/////////////////// Advanced Items ///////////////////

/** Indicates that an pokeball has been used in battle. */
class UsedBallInBattle extends LedgerItem {
	constructor(item, mon, amount=1) {
		super(1);
		this.item = item;
		this.amount = amount;
		this.mon = mon;
	}
	get target(){ return this.mon; }
	get enemy(){ return this.mon; }
}

/** Indicates that an pokeball has been used in battle. */
class UsedBerryInBattle extends LedgerItem {
	constructor(item, mon) {
		super(1);
		this.item = item;
		this.mon = mon;
	}
	get target(){ return this.mon; }
	get enemy(){ return this.mon; }
}

/** Indicates that an evolution stone has been used. */
class UsedEvolutionItem extends LedgerItem {
	constructor(item, mon) {
		super(1);
		this.item = item;
		this.mon = mon;
	}
	get target(){ return this.mon; }
	get enemy(){ return this.mon; }
}

/** Indicates that an evolution stone has been used. */
class UsedTMItem extends LedgerItem {
	constructor(item, mon) {
		super(1);
		this.item = item;
		this.mon = mon;
	}
	get target(){ return this.mon; }
	get enemy(){ return this.mon; }
}

module.exports = {
	GainItem, LostItem, StoredItemInPC, RetrievedItemFromPC,
	UsedBallInBattle, UsedBerryInBattle, UsedEvolutionItem, UsedTMItem,
};