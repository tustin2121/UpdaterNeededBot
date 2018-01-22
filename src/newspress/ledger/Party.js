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
}

/////////////////// Basic Items ///////////////////

/** Indicates that a pokemon in the party has leveled up. */
class MonLeveledUp extends PartyItem {
	constructor(mon, level) {
		super(mon);
		this.level = level;
	}
}

/** Indicates that a pokemon has evolved. */
class MonEvolved extends PartyItem {
	constructor(mon, prevSpecies) {
		super(mon);
		this.prevSpecies = prevSpecies;
		this.species = mon.species;
	}
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
		this.prevHP = prevHP;
	}
}

/** Indicates that a pokemon has had their move PP healed. */
class MonHealedPP extends PartyItem {
	constructor(mon, move, prevPP) {
		super(mon, 0); //context item
		this.move = move;
		this.prevPP = prevPP;
	}
}

/** Indicates that a pokemon has had their HP healed. */
class MonLostHP extends PartyItem {
	constructor(mon, prevHP) {
		super(mon, 0); //context item
		this.prevHP = prevHP;
	}
}

/** Indicates that a pokemon has had their move PP healed. */
class MonLostPP extends PartyItem {
	constructor(mon, move, prevPP) {
		super(mon, 0); //context item
		this.move = move;
		this.prevPP = prevPP;
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
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP,
	
	MonKapowed,
};