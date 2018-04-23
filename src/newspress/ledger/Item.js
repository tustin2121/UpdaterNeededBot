// newspress/ledger/Item.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { Pokemon, SortedBattle } = require('../../api/pokedata');

/////////////////// Basic Items ///////////////////

/** Indicates that a single item has been gained. */
class GainItem extends LedgerItem {
	constructor(item, amount=1) {
		super(1, {helps:'items'});
		this.item = item;
		this.amount = amount;
	}
	cancelsOut(other) {
		if (other.name === 'GainItem') {
			if (this.item.id !== other.item.id) return false;
			this.amount += other.amount; //add together the amounts
			if (this.amount == 0) return true; //cancels out
			if (this.amount < 0) return new LostItem(this.item, -this.amount); //replace
			return this; //coalesce
		}
		if (other.name === 'LostItem') {
			if (this.item.id !== other.item.id) return false;
			this.amount -= other.amount; //subtract the amounts
			if (this.amount == 0) return true; //cancels out
			if (this.amount < 0) return new LostItem(this.item, -this.amount); //replace
			return this; //coalesce
		}
		return false;
	}
}

/** Indicates that a single item has been lost. */
class LostItem extends LedgerItem {
	constructor(item, amount=1) {
		super(1, {helps:'items'});
		this.item = item;
		this.amount = amount;
	}
	cancelsOut(other) {
		if (other.name === 'LostItem') {
			if (this.item.id !== other.item.id) return false;
			this.amount += other.amount;  //add together the amounts
			if (this.amount == 0) return true; //cancels out
			if (this.amount < 0) return new GainItem(this.item, -this.amount); //replace
			return this; //coalesce
		}
		if (other.name === 'GainItem') {
			if (this.item.id !== other.item.id) return false;
			this.amount -= other.amount;  //subtract the amounts
			if (this.amount == 0) return true; //cancels out
			if (this.amount < 0) return new GainItem(this.item, -this.amount); //replace
			return this; //coalesce
		}
		return false;
	}
}

/** Indicates that a single item has been stored in the PC. */
class StoredItemInPC extends LedgerItem {
	constructor(item, amount=1) {
		super(1, {helps:'items'});
		this.item = item;
		this.amount = amount;
	}
}

/** Indicates that a single item has been taken out of the PC. */
class RetrievedItemFromPC extends LedgerItem {
	constructor(item, amount=1) {
		super(1, {helps:'items'});
		this.item = item;
		this.amount = amount;
	}
}

/////////////////// Advanced Items ///////////////////

/** Indicates that an pokeball has been used in battle. */
class UsedBallInBattle extends LedgerItem {
	constructor(item, x, amount=1) {
		super(1, { sort:10 }); //before PokemonGained
		this.item = item;
		this.amount = amount;
		if (x instanceof SortedBattle) {
			this.battle = x;
			this.flavor = x.trainer?'trainer':null; //TODO
		} else if (x instanceof Pokemon) {
			this.mon = x;
		}
	}
	get target(){ return this.mon || this.battle.active[0]; }
	get enemy(){ return this.mon || this.battle.active[0]; }
	get trainer(){ //shouldn't be called unless it's a trainer flavor
		if (!this.battle) return null;
		return this.battle.trainer && this.battle.trainer[0]; 
	}
	cancelsOut(other) {
		if (other.name === 'UsedBallInBattle') {
			if (this.item.id !== other.item.id) return false;
			this.amount += other.amount; //add together the amounts
			if (this.amount == 0) return true; //cancels out
			return this; //coalesce
		}
		return false;
	}
}

/** Indicates that an pokeball has been used in battle. */
class UsedBerryInBattle extends LedgerItem {
	constructor(item, mon) {
		super(1);
		this.item = item;
		this.mon = mon;
	}
	get target(){ return this.mon; }
}

/** Indicates that an item has been used on a pokemon. */
class UsedItemOnMon extends LedgerItem {
	constructor(type, item, mon, extra) {
		super(1, { flavor:type, sort:10 }); //before move learns and stuff
		this.item = item;
		this.mon = mon;
		this.extra = extra;
	}
	get target(){ return this.mon; }
	get move(){ return this.extra; } //string
	get moveLearn(){ return this.extra; } //MonLearnedMoveOverOldMove or MonLearned item
}

module.exports = {
	GainItem, LostItem, StoredItemInPC, RetrievedItemFromPC,
	UsedBallInBattle, UsedBerryInBattle, UsedItemOnMon,
};