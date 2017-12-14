// newspress/ledger/pokemon.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/** Indicates that a new pokemon has appeared in the API */
class PokemonGained extends LedgerItem {
	constructor(mon) {
		super(2, {helps:'catches'});
		this.mon = mon;
	}
}
/** Indicates that a pokemon is missing from the API, and a search is ongoing. This is a context item. */
class PokemonIsMissing extends LedgerItem {
	constructor(mon) {
		super(0);
	}
}
/** Indicates that a pokemon is now being reported as irriversibly lost. */
class PokemonLost extends LedgerItem {
	constructor(mon) {
		super(2);
	}
}
