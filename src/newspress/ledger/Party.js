// newspress/ledger/Party.js
// Various ledger items related to options

const { LedgerItem } = require('./base');

/////////////////// Superclass ///////////////////

/** Common class for all ledger party-related ledger items. */
class PartyItem extends LedgerItem {
	constructor(mon, importance=1) {
		super(importance);
		this.mon = mon;
	}
	get target() { return this.mon; }
	cancelsOut(other) {
		if (this.name !== other.name) return false;
		if (this.mon.hash !== other.mon.hash) return false;
		if (this.prev === undefined || this.curr === undefined) return false;
		if (this.prev === other.curr && other.prev === this.curr) return true;
		return false;
	}
}

/////////////////// Basic Items ///////////////////

/** Indicates that a pokemon in the party has leveled up. */
class MonLeveledUp extends PartyItem {
	constructor(mon, level) {
		super(mon);
		this.level = level;
	}
	get curr(){ return this.level; }
}

/** Indicates that a pokemon has evolved. */
class MonEvolved extends PartyItem {
	constructor(mon, prevSpecies) {
		super(mon);
		this.prevSpecies = prevSpecies;
		this.species = mon.species;
	}
	get curr(){ return this.species; }
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
		super(mon);
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
		super(mon, 1);
		this.move = move;
	}
	get curr(){ return this.move; }
}

/** Indicates that a pokemon has learned a new move over an old move. */
class MonLearnedMoveOverOldMove extends PartyItem {
	constructor(mon, move, oldMove) {
		super(mon, 1);
		this.move = move;
		this.oldMove = oldMove;
	}
	get curr(){ return this.move; }
	get prev(){ return this.oldMove; }
}

/** Indicates that a pokemon has forgot an old move. */
class MonForgotMove extends PartyItem {
	constructor(mon, move) {
		super(mon, 1);
		this.move = move;
	}
	get prev(){ return this.move; }
}

/** Indicates that a pokemon has been given an item to hold. */
class MonGiveItem extends PartyItem {
	constructor(mon, item) {
		super(mon, 1);
		this.item = item;
	}
	get curr(){ return this.item; }
}

/** Indicates that a pokemon has had its item taken from it. */
class MonTakeItem extends PartyItem {
	constructor(mon, item) {
		super(mon, 1);
		this.item = item;
	}
	get prev(){ return this.item; }
}

/** Indicates that a pokemon has had its item swapped for another item. */
class MonSwapItem extends PartyItem {
	constructor(mon, item, prevItem) {
		super(mon, 1);
		this.item = item;
		this.prevItem = prevItem;
	}
	get curr(){ return this.item; }
	get prev(){ return this.prevItem; }
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
		if (other.name === 'MonNicknameChanged') {
			if (this.mon.hash !== other.mon.hash) return false;
			this.prevNick = other.prevNick; //pull in the eldest previous name
			return this; //coalesce
		}
		if (other.name === 'PokemonGained') {
			if (this.mon.hash !== other.mon.hash) return false;
			other.mon = this.mon; //update the new pokemon with the most recent data
			return other; //replace
		}
		return false;
	}
}

/////////////////// Advanced Items ///////////////////

/** Indicates that a pokemon has fainted via their own self-distruct move. */
class MonKapowed extends PartyItem {
	constructor(mon) {
		super(mon);
	}
}


module.exports = {
	MonLeveledUp,
	MonEvolved, MonHatched,
	MonPokerusInfected, MonPokerusCured,
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP, MonPPUp,
	MonLearnedMove, MonLearnedMoveOverOldMove, MonForgotMove,
	MonGiveItem, MonTakeItem, MonSwapItem,
	MonShinyChanged, MonSparklyChanged, MonAbilityChanged, MonNicknameChanged,
	
	MonKapowed,
};