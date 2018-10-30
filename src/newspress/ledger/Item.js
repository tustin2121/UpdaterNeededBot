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
		this.report = null;
	}
	cancelsOut(other) {
		if (other.__itemName__ === 'GainItem') {
			if (this.item.id !== other.item.id) return false;
			this.amount += other.amount; //add together the amounts
			if (this.amount == 0) return true; //cancels out
			if (this.amount < 0) return new LostItem(this.item, -this.amount); //replace
			return this; //coalesce
		}
		if (other.__itemName__ === 'LostItem') {
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
		if (other.__itemName__ === 'LostItem') {
			if (this.item.id !== other.item.id) return false;
			this.amount += other.amount;  //add together the amounts
			if (this.amount == 0) return true; //cancels out
			if (this.amount < 0) return new GainItem(this.item, -this.amount); //replace
			return this; //coalesce
		}
		if (other.__itemName__ === 'GainItem') {
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

class MoneyValueChanged extends LedgerItem {
	constructor(prev, curr) {
		super(0);
		this.prev = prev;
		this.curr = curr;
		this.delta = curr-prev;
	}
}

/** Indicates that the held item was gained without a compensating delta from elsewhere, probably resulting from Pickup ability or recycling. */
class HeldItemGained extends LedgerItem {
	constructor(item, amount=1) {
		super(0);
		this.item = item;
		this.amount = amount;
	}
}

/** Indicates that the held item was lost without a compensating delta from elsewhere, probably from in-battle use. */
class HeldItemLost extends LedgerItem {
	constructor(item, amount=1) {
		super(0);
		this.item = item;
		this.amount = amount;
	}
}

/////////////////// Advanced Items ///////////////////

/**
 * A context item which keeps track of items bought during a shopping trip.
 */
class ShoppingContext extends LedgerItem {
	constructor(cart={ buy:{}, sell:{}, money:0, transactions:0 }) {
		super(0);
		this.ttl = ShoppingContext.STARTING_TTL; //TimeToLive = postpone for x update cycles after
		this.cart = cart;
	}
	canPostpone() {
		if (this.ttl === 0) {
			if (this.cart.transactions > 0) return new ShoppingReport(this.cart); //send out the report (to be reported next update cycle)
			return false; //Don't postpone or send out a report
		}
		if (!this._next) {
			this._next = new ShoppingContext(this.cart);
			this._next.ttl = this.ttl - 1;
		}
		return this._next; //postpone this item instead
	}
	/** Tells this item to keep itself alive another round. */
	keepAlive() {
		if (this._next) this._next.ttl = Math.min(this._next.ttl+1, ShoppingContext.STARTING_TTL-1);
		this.ttl = Math.max(this.ttl, 2);
	}
	/**
	 * Tells the context that we've bought an item.
	 * @param {Item} item - The item bought.
	 * @param {number} num - The amount of items bought.
	 */
	boughtItem(item, num) {
		let entry = this.cart.buy[item.id];
		if (!entry) {
			this.cart.buy[item.id] = entry = { id:item.id, name:item.name, count:0 };
		}
		entry.count += num;
		this.cart.transactions++;
	}
	/**
	 * Tells the context that we've sold an item.
	 * @param {Item} item - The item sold.
	 * @param {number} num - The amount of items sold.
	 */
	soldItem(item, num) {
		let entry = this.cart.sell[item.id];
		if (!entry) {
			this.cart.sell[item.id] = entry = { id:item.id, name:item.name, count:0 };
		}
		entry.count += num;
		this.cart.transactions++;
	}
}
ShoppingContext.STARTING_TTL = 4;


class ShoppingReport extends LedgerItem {
	constructor(cart) {
		super(1.5);
		this.cart = cart;
	}
}


/** Indicates that an pokeball has been used in battle. */
class UsedBallInBattle extends LedgerItem {
	constructor(item, x, amount=1) {
		super(1);
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
		if (other.__itemName__ === 'UsedBallInBattle') {
			if (this.item.id !== other.item.id) return false;
			this.amount += other.amount; //add together the amounts
			if (this.amount == 0) return true; //cancels out
			return this; //coalesce
		}
		return false;
	}
}

/** Indicates that a berry has been used in battle. */
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
		super(1, { flavor:type });
		this.item = item;
		this.mon = mon;
		this.extra = extra;
	}
	get target(){ return this.mon; }
	get move(){ return this.extra; }
	get moveLearn(){ return this.extra; } //MonLearnedMoveOverOldMove or MonLearned item
}

module.exports = {
	GainItem, LostItem, StoredItemInPC, RetrievedItemFromPC, HeldItemGained, HeldItemLost,
	MoneyValueChanged,
	UsedBallInBattle, UsedBerryInBattle, UsedItemOnMon,
	ShoppingContext, ShoppingReport,
};