// newspress/ledger/Pokemon.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/** Indicates that a new pokemon has appeared in the API */
class PokemonGained extends LedgerItem {
	constructor(mon) {
		super(2, {helps:'catches'});
		this.mon = mon;
	}
	cancelsOut(other) {
		if (other.name === 'PokemonIsMissing') {
			if (other.mon.hash !== this.mon.hash) return false;
			return true;
		}
		return false;
	}
}
/** Indicates that a pokemon is missing from the API, and a search is ongoing. This is a context item. */
class PokemonIsMissing extends LedgerItem {
	constructor(mon) {
		super(0);
		this.mon = mon;
	}
}
/** Indicates that a pokemon is now being reported as irriversibly lost. */
class PokemonLost extends LedgerItem {
	constructor(mon) {
		super(2);
		this.mon = mon;
	}
}

/////////////////// Advanced Items ///////////////////

module.exports = {
	PokemonGained, PokemonIsMissing, PokemonLost,
};