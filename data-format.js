// data-format.js
// Defines a standard format for Pokemon and Run Status items

const { Node } = require('./updaters/maps/map');

class Location {
	constructor() {
		this.node = null;
		this.set();
	}
	
	set(opts={}) {
		if (opts instanceof Node) {
			this.node = opts;
			this.map_name = opts.name || 'Mystery Zone';
		} else {
			this.x = opts['x'] || 0;
			thix.y = opts['y'] || 0;
			this.z = opts['z'] || 0;
			this.map_bank = opts['map_bank'] || opts['mapbank'] || opts['mapBank'] || 0;
			this.map_id = opts['map_id'] || opts['mapid'] || opts['mapId'] || 0;
			this.area_id = opts['area_id'] || opts['areaid'] || opts['areaId'] || 0;
			this.area_name = opts['area_name'] || opts['areaName'] || 'Mystery Zone';
			this.map_name = opts['map_name'] || 'Mystery Zone';
		}
	}
	
	// Passthrough methods
	getName() {
		let name = null;
		if (this.node) {
			name = this.node.getName();
			if (name && name.startsWith('...')) name = null;
		}
		return this.map_name || this.area_name;
	}
	is(attr) {
		if (!this.node) return false;
		return this.node.is(attr);
	}
	has(attr) {
		if (!this.node) return false;
		return this.node.has(attr);
	}
	can(attr) {
		if (!this.node) return false;
		return this.node.can(attr);
	}
	get(attr) {
		if (!this.node) return false;
		return this.node.get(attr);
	}
	locationOf(item) {
		if (!this.node) return false;
		return this.node.locationOf(item);
	}
	within(attr, loc, dist) {
		if (!this.node) return false;
		return this.node.within(attr, loc, dist);
	}
	
	
	equals(other) {
		if (other instanceof Location) {
			if (this.node) {
				return other.node === this.node;
			} else {
				return other.map_bank === this.map_bank
					&& other.map_id === this.map_id
					&& other.area_id === this.area_id;
			}
		}
		if (other instanceof Node) {
			if (this.node) return other === this.node;
		}
		if (typeof other === 'string') {
			let res = /^(\d+):(\d+).(\d)$/i.exec(other);
			if (!res) return false;
			return parseInt(res[2], 10) === this.map_bank
				&& parseInt(res[3], 10) === this.map_id
				&& parseInt(res[1], 10) === this.area_id;
		}
		return false;
	}
}

class SortedData {
	constructor() {
		// Location data
		this.map_id = 0; //number or string representing the map id
		this.location = new Location();
		
		// Pokemon data
		this.allmon = [];
		this.party = [];
		
		// Item data
		this.bagitems = {};
		this.allitems = {};
		this.ball_count = 0;
		
		// Battle data
		this.in_battle = false;
		
		// Progress data
		this.badges = {};
		
		// Pyrite
		this.level_cap = 0;
	}
}

class Pokemon {
	constructor() {
		this._name = '';
		this.nicknamed = false;
		
		this.gender = 'U';
		this.nature = 'None, none';
		this.caughtIn = 'Notaball';
		this.ability = '';
		
		this.hp = 100;
		this.moves = [];
		this.moveInfo = [];
		this._stats = {atk:0,def:0,hp:0,spa:0,spd:0,spe:0};
		
		this.species = '';
		this.dexid = 0;
		this.types = ['???'];
		
		this.level = 0;
		this.item = null;
		this.storedIn = null; //Null = in party, number = box number
		
		this.shiny = false;
		this.sparkly = false; //N's Pokemon, gen 5
		this.shadow = false; //Orre games
		this.pokerus = false;
		this.traded = false;
		
		this.hash = 0;
		this._isEvolving = false;
	}
	
	get name() { return this._name; }
	set name(val) {
		val = val.replace(/ /i, '\xA0'); // Replace spaces with non-breaking spaces
		val = val.replace('Ê', 'Pk').replace('Ë', 'Mn'); //
		this._name = val;
	}
	
	/** If this pokemon is currently valid for consideration of changes.
	 *  If this is false on the current set, do not report any changes. */
	get valid() {
		if (this._isEvolving) return false;
		if (this._name.indexOf('_') > -1) return false; //Currently nicknaming (gen 1/2)
		return true;
	}
	
	get inParty() { return typeof this.storedIn === 'number';}
	
	get stats() { return this._stats; }
	set stats(val){
		if (typeof val !== 'object') throw TypeError('Cannot set stats to something not an object literal!');
		this._stats.atk = val.atk || 0;
		this._stats.def = val.def || 0;
		this._stats.spe = val.spe || 0;
		this._stats.spa = val.spa || 0;
		this._stats.spd = val.spd || 0;
		this._stats.hp  = val.hp  || 0;
	}
}

module.exports = { Pokemon, SortedData, Location };