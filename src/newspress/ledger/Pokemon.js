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
		m.mon = Object.assign({}, this.mon);
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
		let mon = new Pokemon();
		mon = Object.assign(mon, m.mon);
		return new PokemonGained(mon);
	}
}

/** Indicates that a pokemon is missing from the API, and a search is ongoing. This is a context item. */
class PokemonIsMissing extends PokemonItem {
	constructor(mon) {
		super(mon, 0);
	}
	static loadFromMemory(m) {
		let mon = new Pokemon();
		mon = Object.assign(mon, m.mon);
		return new PokemonIsMissing(mon);
	}
}

/** Indicates that a pokemon is now being reported as irriversibly lost. */
class PokemonLost extends PokemonItem {
	constructor(mon) {
		super(mon, 2);
	}
}

/////////////////// Advanced Items ///////////////////

module.exports = {
	PokemonGained, PokemonIsMissing, PokemonLost,
};