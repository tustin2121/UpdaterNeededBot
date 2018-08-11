// newspress/ledger/Pokemon.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { Pokemon } = require('../../api/pokedata');

/////////////////// Superclass ///////////////////

/** Common class for all party-related ledger items. */
class PokemonItem extends LedgerItem {
	constructor(mon, imp=1, obj={}) {
		super(imp, obj);
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
		if (other.__itemName__ === 'PokemonIsMissing') {
			if (other.mon.hash !== this.mon.hash) return false;
			return new PokemonFound(other, this.mon); //replace
		}
		if (other.__itemName__ === 'MonNicknameChanged') {
			if (other.mon.hash !== this.mon.hash) return false;
			this.mon = other.mon; //update the new pokemon with the most recent data
			return this; //replace
		}
		return false;
	}
	canPostpone() { return true; }
	static loadFromMemory(m) {
		let mon = new Pokemon(m.mon);
		return new PokemonGained(mon);
	}
}

/** Indicates that a pokemon is missing from the API, and a search is ongoing. This is a context item. */
class PokemonIsMissing extends PokemonItem {
	constructor(mon, raw) {
		super(mon, 0);
		this.raw = raw;
		this.timestamp = Date.now();
		this.ticksActive = 0;
		this.query = null;
	}
	saveToMemory(m) {
		m.__monhash = this.mon.hash;
		m.mon = this.mon.saveToMemory();
		m.raw = Buffer.from(JSON.stringify(this.raw), 'utf8').toString('base64');
		m.ts = this.timestamp;
		m.ticksActive = this.ticksActive;
		m.query = this.query;
	}
	static loadFromMemory(m) {
		let mon = new Pokemon(m.mon);
		let raw = JSON.parse(Buffer.from(m.raw, 'base64').toString('utf8'));
		let item = new PokemonIsMissing(mon, raw);
		item.timestamp = m.ts;
		item.ticksActive = m.ticksActive;
		item.query = m.query;
		return item;
	}
	
	/** Calls to Bot.appendToTheFallen() with the appropriate information to
	 *  memorialize this pokemon as among the fallen. */
	markAsFallen(notes='') {
		Bot.appendToTheFallen(this.raw, this.timestamp, notes+` (Searched for ${this.ticksActive} ticks, query ${this.query}.)`);
	}
}

/** Indicates that a pokemon is now being reported as irriversibly lost. */
class PokemonLost extends PokemonItem {
	constructor(mon, flavor) {
		super(mon, 2, { flavor });
	}
}

/** Indicates that a pokemon was once missing and is now found again. */
class PokemonFound extends PokemonItem {
	constructor(prev, curr) {
		super(curr, 0);
		this.miaItem = prev;
	}
	canPostpone() { return false; } //need to save both if we want to postpone
	get curr() { return this.mon; }
	get prev() { return this.miaItem.mon; }
	get inNewLocation() { return this.prev.storedIn !== this.mon.storedIn; }
}

/////////////////// Advanced Items ///////////////////

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
	PokemonGained, PokemonIsMissing, PokemonLost, PokemonFound, 
	PokemonDeposited, PokemonRetrieved, PokemonTraded,
};