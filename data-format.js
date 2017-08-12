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
			this.map_name = opts.name || this.map_name || 'Mystery Zone';
		} else {
			this.map_name = opts['map_name'] || this.map_name || 'Mystery Zone';
			this.x = opts['x'] || 0;
			this.y = opts['y'] || 0;
			this.z = opts['z'] || 0;
			this.map_bank = opts['map_bank'] || opts['mapbank'] || opts['mapBank'] || 0;
			this.map_id = opts['map_id'] || opts['mapid'] || opts['mapId'] || 0;
			this.area_id = opts['area_id'] || opts['areaid'] || opts['areaId'] || 0;
			this.area_name = opts['area_name'] || opts['areaname'] || opts['areaName'] || 'Mystery Zone';
			this.parent_id = opts['parent_id'] || opts['parentid'] || opts['parentId'] || 0;
			this.matrix_id = opts['matrix_id'] || opts['matrixid'] || opts ['matrixId'] || 0;
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
			let res = /^(\d+)\:(\d+)\.(\d+)$/i.exec(other);
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
		this.my_name = "Red";
		this.rival_name = "Blue";
		
		// Location data
		this.map_id = 0; //number or string representing the map id
		this.location = new Location();
		
		// Pokemon data
		this.allmon = [];
		this.party = [];
		
		// Item data
		this.inventory = {}; //List of ALL items available, bag/pc/pokemon
		this.items_bag = {};
		this.items_pc = {};
		this.ball_count = 0;
		
		// Battle data
		this.in_battle = false;
		this.trainer = null;
		this.wildmon = null;
		
		// Cutscene data
		this.in_cutscene = false;
		
		// Progress data
		this.badges = {};
		
		// Pyrite
		this.time = null;
		this.level_cap = 100;
	}
	
	addItemToBag(name, count=1) {
		this.inventory[name] = (this.inventory[name] || 0) + count;
		this.items_bag[name] = (this.items_bag[name] || 0) + count;
	}
	addItemToPC(name, count=1) {
		this.inventory[name] = (this.inventory[name] || 0) + count;
		this.items_pc[name] = (this.items_pc[name] || 0) + count;
	}
	addItemOnPokemon(name) {
		this.inventory[name] = (this.inventory[name] || 0) + 1;
	}
}

class Pokemon {
	constructor() {
		this._name = '';
		this.nicknamed = false;
		
		this.gender = '';
		this.nature = '';
		this.caughtIn = '';
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
		// val = val.replace(/ /i, '\xA0'); // Replace spaces with non-breaking spaces
		// val = val.replace('π', 'Pk').replace('µ', 'Mn'); //
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
		this._stats.atk = val.atk || val.attack || 0;
		this._stats.def = val.def || val.defense || 0;
		this._stats.spe = val.spe || val.speed || 0;
		this._stats.spa = val.spa || val.special_attack || 0;
		this._stats.spd = val.spd || val.special_defense || 0;
		this._stats.hp  = val.hp  || val.hit_points || 0;
	}
	
	getExtendedInfo(includeStats=false) {
		if (this.species === 'Egg') return 'Egg';
		
		let exInfo = `${this.types.join('/')}`;
		if (global.gen > 1) exInfo += ` | Item: ${this.item?this.item:"None"}`;
		if (global.gen > 2) exInfo += ` | Ability: ${this.ability}`;
		if (global.gen > 2) exInfo += ` | Nature: ${this.nature}`;
		if (global.gen > 2) exInfo += `\nCaught In: ${this.caughtIn}`;
		exInfo += ` | Moves: ${this.moves.join(', ')}`;
		
		if (includeStats) {
			let stats = [];
			stats.push(`HP: ${this.stats.hp}`);
			stats.push(`ATK: ${this.stats.atk}`);
			stats.push(`DEF: ${this.stats.def}`);
			stats.push(`SPA: ${this.stats.spa}`);
			stats.push(`SPD: ${this.stats.spd}`);
			stats.push(`SPE: ${this.stats.spe}`);
			exInfo += `\n${stats.join(' | ')}`;
		}
		
		let f = [];
		if (this.pokerus) f.push(`Has PokeRus`);
		if (this.shiny) f.push('Shiny');
		if (this.sparkly) f.push('Sparkly (N\'s Pokemon)');
		if (this.level_reported) f.push(`Levels: API says ${this.level_reported}, we calculated ${this.level_calculated}`);
		if (f.length) exInfo += `\n${f.join(' | ')}`;
		return exInfo;
	}
}

module.exports = { Pokemon, SortedData, Location };