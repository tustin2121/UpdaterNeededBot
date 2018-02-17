// newspress/ledger/Pokemon.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { Pokemon } = require('../../api/pokedata');

/////////////////// Superclass ///////////////////

/** Common class for all ledger party-related ledger items. */
class PokemonItem extends LedgerItem {
	constructor(mon, imp=1, obj={}) {
		super(imp, obj);
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
	saveToMemory(m) {
		m.__monhash = this.mon.hash;
		m.mon = this.mon.saveToMemory();
	}
}

/////////////////// Basic Items ///////////////////

/** Indicates that a new pokemon has appeared in the API */
class PokemonGained extends PokemonItem {
	constructor(mon) {
		super(mon, 2, {helps:'catches'});
	}
	cancelsOut(other) {
		if (other.name === 'PokemonIsMissing') {
			if (other.mon.hash !== this.mon.hash) return false;
			return true;
		}
		return false;
	}
	static loadFromMemory(m) {
		let mon = new Pokemon(m.mon);
		return new PokemonGained(mon);
	}
}

/** Indicates that a pokemon is missing from the API, and a search is ongoing. This is a context item. */
class PokemonIsMissing extends PokemonItem {
	constructor(mon) {
		super(mon, 0);
	}
	static loadFromMemory(m) {
		let mon = new Pokemon(m.mon);
		return new PokemonIsMissing(mon);
	}
}

/** Indicates that a pokemon is now being reported as irriversibly lost. */
class PokemonLost extends PokemonItem {
	constructor(mon) {
		super(mon, 2);
	}
}

/** Indicates that a pokemon has been moved to a new storage location. */
class PokemonDeposited extends PokemonItem {
	constructor(mon, prevStored, flavor) {
		super(mon, 2, { flavor });
		this.prev = prevStored;
	}
	get boxnum() {
		if (!this.mon.storedIn.startsWith('box')) return 0;
		let num = this.mon.storedIn.slice(4).split('-');
		return num[0];
	}
}

/** Indicates that a pokemon has been pulled back into the party from a storage location. */
class PokemonRetrieved extends PokemonItem {
	constructor(mon, prevStored, flavor) {
		super(mon, 2, { flavor });
		this.prev = prevStored;
	}
}

/////////////////// Advanced Items ///////////////////

/** Indicates that two pokemon have been traded. */
class PokemonTraded extends PokemonItem {
	constructor(mon, pastMon) {
		super(mon, 2);
		this.pastMon = pastMon;
	}
	get curr(){ return this.mon; }
	get prev(){ return this.pastMon; }
}


module.exports = {
	PokemonGained, PokemonIsMissing, PokemonLost, PokemonDeposited, PokemonRetrieved,
	PokemonTraded
};