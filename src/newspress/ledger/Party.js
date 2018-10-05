// newspress/ledger/Party.js
// Various ledger items related to options

const { LedgerItem } = require('./base');

/////////////////// Superclass ///////////////////

/** Common class for all ledger party-related ledger items. */
class PartyItem extends LedgerItem {
	constructor(mon, importance=1, obj) {
		super(importance, obj);
		this.mon = mon;
	}
	get target() { return this.mon; }
	cancelsOut(other) {
		if (this.__itemName__ !== other.__itemName__) return false;
		if (this.mon.hash !== other.mon.hash) return false;
		if (this.prev === undefined || this.curr === undefined) return false;
		if (this.prev === other.curr && other.prev === this.curr) return true;
		return false;
	}
}

/////////////////// Typesetter-Only Items ///////////////////

class MonChangedCondensed extends LedgerItem { //NOT PartyItem
	constructor(mon) {
		super(2, { sort:100 });
		this.mon = mon;
	}
	get target() { return this.mon; }
	/**
	 * Called by the typesetter to do custom collation on various items.
	 * This function sorts through other PartyItems and groups them based on mon.
	 */
	static mergeItems(itemList) {
		let dict = {};
		for (let item of itemList) {
			let itemname = `MonChangedCondensed/${item.mon.hash}`;
			if (!dict[itemname]) {
				dict[itemname] = [ new MonChangedCondensed(item.mon) ];
			}
			dict[itemname].push(item);
		}
		return dict;
	}
}

/////////////////// Basic Items ///////////////////

/** Indicates that the party is currently a temporary party, and that party updates have been suspended. */
class TemporaryPartyContext extends LedgerItem {
	constructor() {
		super(0);
	}
}

/** Indicates that a pokemon in the party has leveled up. */
class MonLeveledUp extends PartyItem {
	constructor(mon, prevLevel) {
		super(mon, 1, {helps:'level'});
		this.prevLevel = prevLevel;
		this.deltaLevel = mon.level - prevLevel;
		if (this.mon.level === 100) this.flavor = 'level100';
		if (this.deltaLevel > 1) this.flavor = 'multiple';
		if (this.deltaLevel < 0) this.flavor = 'regress';
	}
	get deltaLost(){ return -this.deltaLevel; }
	get level(){ return this.mon.level; }
	get curr(){ return this.mon.level; }
	get prev(){ return this.prevLevel; }
	cancelsOut(other) {
		// other is the older, postponed item. this is the newer item
		if (this.__itemName__ !== other.__itemName__) return false;
		if (this.mon.hash !== other.mon.hash) return false;
		if (this.deltaLevel + other.deltaLevel === 0) return true; //cancels out
		// coelesce
		this.prevLevel = other.prevLevel;
		this.deltaLevel += other.deltaLevel;
		this.flavor = null;
		if (this.mon.level === 100) this.flavor = 'level100';
		if (this.deltaLevel > 1) this.flavor = 'multiple';
		if (this.deltaLevel < 0) this.flavor = 'regress';
		return this;
	}
}

/** Indicates that a pokemon has evolved. */
class MonEvolved extends PartyItem {
	constructor(mon, prevSpecies) {
		super(mon);
		this.prevSpecies = prevSpecies;
	}
	get species(){ return this.mon.species; }
	get curr(){ return this.mon.species; }
	get prev(){ return this.prevSpecies; }
}

/** Indicates that a pokemon has hatched from an egg. */
class MonHatched extends PartyItem {
	constructor(mon) {
		super(mon);
	}
}

/** Indicates that a pokemon has been infected with Pokerus. */
class MonPokerusInfected extends PartyItem {
	constructor(mon) {
		super(mon);
	}
}

/** Indicates that a pokemon has been cured of Pokerus. */
class MonPokerusCured extends PartyItem {
	constructor(mon) {
		super(mon);
	}
}

/** Indicates that a pokemon has fainted. */
class MonFainted extends PartyItem {
	constructor(mon) {
		super(mon, 1, {sort:30});
	}
}

/** Indicates that a pokemon has been revived. */
class MonRevived extends PartyItem {
	constructor(mon) {
		super(mon);
	}
}

/** Indicates that a pokemon has had their HP healed. */
class MonHealedHP extends PartyItem {
	constructor(mon, prevHP) {
		super(mon, 0); //context item
		this.curr = mon.hp;
		this.prev = prevHP;
	}
}

/** Indicates that a pokemon has had their move PP healed. */
class MonHealedPP extends PartyItem {
	constructor(mon, move, currPP, prevPP) {
		super(mon, 0); //context item
		this.move = move;
		this.curr = currPP;
		this.prev = prevPP;
	}
}

/** Indicates that a pokemon has had their HP healed. */
class MonLostHP extends PartyItem {
	constructor(mon, prevHP) {
		super(mon, 0); //context item
		this.curr = mon.hp;
		this.prev = prevHP;
	}
}

/** Indicates that a pokemon has had their move PP healed. */
class MonLostPP extends PartyItem {
	constructor(mon, move, currPP, prevPP) {
		super(mon, 0); //context item
		this.move = move;
		this.curr = currPP;
		this.prev = prevPP;
	}
}

/** Indicates that a pokemon has had their move PP healed. */
class MonPPUp extends PartyItem {
	constructor(mon, move, currMax, prevMax) {
		super(mon, 0); //context item
		this.move = move;
		this.currMax = currMax;
		this.prevMax = prevMax;
	}
}

/** Indicates that a pokemon has learned a new move. */
class MonLearnedMove extends PartyItem {
	constructor(mon, move) {
		super(mon, 1, {helps:'moves'});
		this.move = move;
	}
	get curr(){ return this.move; }
}

/** Indicates that a pokemon has learned a new move over an old move. */
class MonLearnedMoveOverOldMove extends PartyItem {
	constructor(mon, move, oldMove) {
		super(mon, 1, {helps:'moves'});
		this.move = move;
		this.oldMove = oldMove;
	}
	get curr(){ return this.move; }
	get prev(){ return this.oldMove; }
}

/** Indicates that a pokemon has forgot an old move. */
class MonForgotMove extends PartyItem {
	constructor(mon, move) {
		super(mon, 1, {helps:'moves'});
		this.move = move;
	}
	get prev(){ return this.move; }
}

/** Indicates that a pokemon has been given an item to hold. */
class MonGiveItem extends PartyItem {
	constructor(mon, item) {
		super(mon, 1, {helps:'items'});
		this.item = item;
	}
	get curr(){ return this.item; }
	get given(){ return this.item; }
}

/** Indicates that a pokemon has had its item taken from it. */
class MonTakeItem extends PartyItem {
	constructor(mon, item) {
		super(mon, 1, {helps:'items'});
		this.item = item;
	}
	get prev(){ return this.item; }
	get taken(){ return this.item; }
}

/** Indicates that a pokemon has had its item swapped for another item. */
class MonSwapItem extends PartyItem {
	constructor(mon, item, prevItem) {
		super(mon, 1, {helps:'items'});
		this.item = item;
		this.prevItem = prevItem;
	}
	get curr(){ return this.item; }
	get prev(){ return this.prevItem; }
	get given(){ return this.item; }
	get taken(){ return this.prevItem; }
}

/** Indicates that a pokemon's shiny status has inexplicably changed. */
class MonShinyChanged extends PartyItem {
	constructor(mon) {
		super(mon, 1);
		this.flavor = (mon.shiny)?'became':'nolonger';
	}
	get curr(){ return this.mon.shiny; }
}

/** Indicates that a pokemon's "sparkly" status changed. */
class MonSparklyChanged extends PartyItem {
	constructor(mon) {
		super(mon, 1);
		this.flavor = (mon.sparkly)?'became':'nolonger';
	}
	get curr(){ return this.mon.sparkly; }
}

/** Indicates that a pokemon's ability has changed. */
class MonAbilityChanged extends PartyItem {
	constructor(mon, prev) {
		super(mon, 1);
		this.prevAbility = prev;
	}
	get curr(){ return this.mon.ability; }
	get prev(){ return this.prevAbility; }
}

/** Indicates that a pokemon has had its name changed. */
class MonNicknameChanged extends PartyItem {
	constructor(mon, prev) {
		super(mon, 1);
		this.prevNick = prev;
	}
	get curr(){ return this.mon.name; }
	get prev(){ return this.prevNick; }
	cancelsOut(other) {
		if (other.__itemName__ === 'MonNicknameChanged') {
			if (this.mon.hash !== other.mon.hash) return false;
			this.prevNick = other.prevNick; //pull in the eldest previous name
			if (this.curr == this.prev) return true; //cancels out
			return this; //coalesce
		}
		if (other.__itemName__ === 'PokemonGained') {
			if (this.mon.hash !== other.mon.hash) return false;
			other.mon = this.mon; //update the new pokemon with the most recent data
			return other; //replace
		}
		return false;
	}
}

/////////////////// Advanced Items ///////////////////



module.exports = {
	TemporaryPartyContext, MonChangedCondensed,
	MonLeveledUp,
	MonEvolved, MonHatched,
	MonPokerusInfected, MonPokerusCured,
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP, MonPPUp,
	MonLearnedMove, MonLearnedMoveOverOldMove, MonForgotMove,
	MonGiveItem, MonTakeItem, MonSwapItem,
	MonShinyChanged, MonSparklyChanged, MonAbilityChanged, MonNicknameChanged,
};