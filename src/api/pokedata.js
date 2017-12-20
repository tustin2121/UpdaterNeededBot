// api/pokedata.js
// Defines a standardized object for Pokemon and Run Status items

/** Attempts to retrieve a key and variations of said key from the given object. */
function read(opts={}, ...keys) {
	let val = undefined;
	for (let key of keys) {
		let vkey = key; // map_name
		val = opts[vkey];
		if (val !== undefined) return val;
		
		vkey = key.replace(/_/gi, ''); // mapname
		val = opts[vkey];
		if (val !== undefined) return val;
		
		vkey = key.replace(/_\w/gi, (m)=>m.charAt(1).toUpperCase());  // mapName
		val = opts[vkey];
		if (val !== undefined) return val;
		
		vkey = key.toUpperCase(); // MAP_NAME
		val = opts[vkey];
		if (val !== undefined) return val;
		
		vkey = key.toUpperCase().replace(/_/gi, ''); // MAPNAME
		val = opts[vkey];
		if (val !== undefined) return val;
	}
	return val;
}

function sanatizeName(val) {
	val = val.replace(/ /i, '\xA0'); // Replace spaces with non-breaking spaces
	val = val.replace('π', 'ᵖᵏ').replace('Π', 'ᵖᵏ').replace('\u00ca', 'ᵖᵏ'); // Replace symbols
	val = val.replace('µ', 'ᵐᶰ').replace('Μ', 'ᵐᶰ').replace('Ë', 'ᵐᶰ'); // Replace symbols
	return val;
}

function correctCase(str) {
	if (!Bot.runOpts('correctCase')) return str;
	// TODO
	return str;
}

function checkNicknamed(name, species) {
	if (Bot.runOpts('correctCase')) species = species.toUpperCase();
	return name !== species;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

class Pokemon {
	constructor(mon) {
		this.name = '';
		this.species = '';
		this.nicknamed = false;
		
		this.gender = '';
		this.nature = '';
		this.caughtIn = '';
		this.ability = '';
		
		this.hp = 100;
		this.moves = [];
		this.moveInfo = [];
		if (Bot.runOpts('specialSplit')) {
			this._stats = {atk:0,def:0,hp:0,spa:0,spd:0,spe:0};
		} else {
			this._stats = {atk:0,def:0,hp:0,sp:0,spe:0};
		}
		
		this.dexid = -1;
		this.types = [];
		
		this.level = 0;
		this.item = null;
		this.storedIn = {};
		
		this.shiny = false;
		this.sparkly = false;
		this.shadow = false;
		this.pokerus = null; //true = infected, false = cured, null = never had
		this.traded = false;
		
		this.hash = 0;
		
		if (typeof mon !== 'object') return this;
		
		this.hash = read(mon, `personality_value`);
		this.name = mon.name || mon.nickname || '';
		this.species = (mon.species && mon.species.name) || '';
		this.nicknamed = !!(mon.nicknamed || checkNicknamed(this.name, this.species) || false);
		this.name = sanatizeName(this.name);
		
		// Fix shedinja bug:
		if (this.species.toLowerCase() === `shedinja`) this.hash++;
		
		this.dexid = read(mon.species, `national_dex`) || this.dexid;
		this.types.push(mon.species.type1);
		if (mon.species.type1 !== mon.species.type2) this.types.push(mon.species.type2);
		if (mon.met) {
			this.caughtIn = read(mon.met, `caught_in`);
		}
		this.stats = mon.stats; //uses setter below
		
		if (mon.health) {
			this.hp = Math.floor((mon.health[0] / mon.health[1])*100);
			if (mon.health[0] !== 0) this.hp = Math.max(this.health, 1); //At least 1% HP if not fainted
		}
		
		if (Bot.runOpts('gender')) this.gender = mon.gender || this.gender;
		if (Bot.runOpts('heldItem')) {
			let item = read(mon, `held_item`) || mon.item || {};
			if (item.id > 0) this.item = item.name;
		}
		if (Bot.runOpts('pokerus') && mon.pokerus) {
			if (mon.pokerus.infected) this.pokerus = true;
			if (mon.pokerus.cured) this.pokerus = false;
		}
		if (Bot.runOpts('shiny')) this.shiny = mon.shiny;
		if (Bot.runOpts('abilities')) this.ability = mon.ability;
		
		if (Bot.runOpts('natures')) this.nature = `${mon.nature}`;
		if (Bot.runOpts('characteristics')) this.nature += `, ${mon.characteristic}`;
	}
	
	get stats() { return this._stats; }
	set stats(val){
		if (typeof val !== 'object') throw TypeError('Cannot set stats to something not an object literal!');
		this._stats.atk = val.atk || val.attack || 0;
		this._stats.def = val.def || val.defense || 0;
		this._stats.spe = val.spe || val.speed || 0;
		if (Bot.runOpts('specialSplit')) {
			this._stats.spa = val.spa || val.special_attack || 0;
			this._stats.spd = val.spd || val.special_defense || 0;
		} else {
			this._stats.sp = val.sp || val.special || 0;
		}
		this._stats.hp  = val.hp  || val.hit_points || 0;
	}
	
	toXml(hkey) {
		let xml = `<pokemon `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `hash="${this.hash}">`;
		// if ()
		xml += `</pokemon>`;
		return xml;
	}
}



class Location {
	constructor() {
		this.node = null;
		this.set();
	}
	
	set(opts={}) {
		if (opts instanceof Node) {
			this.node = opts;
		} else {
			this.map_name = read(opts, 'map_name') || '<Undisclosed Location>';
			this.area_name = read(opts, 'area_name') || '<Undisclosed Area>';
			this.area_id = read(opts, 'area_id');
			this.map_bank = read(opts, 'map_bank');
			this.map_id = read(opts, 'map_id') || 0;
			this.x = read(opts, 'x') || 0;
			this.y = read(opts, 'y') || 0;
			this.z = read(opts, 'z');
		}
	}
	
	get bank_id() {
		let id = `${this.map_id}`;
		if (this.map_bank) id = `${this.map_bank}.${id}`;
		return id;
	}
	get full_id() {
		let id = `${this.map_id}`;
		if (this.map_bank !== undefined) id = `${this.map_bank}.${id}`;
		if (this.area_id !== undefined) id = `${this.area_id}:${id}`;
		return id;
	}
	get position() {
		let pos = `${this.x},${this.y}`;
		if (this.z !== undefined) pos += `,${this.z}`;
		return pos;
	}
	
	toXml(hkey) {
		let xml = `<location `;
		if (hkey) xml += `key="${hkey}" `;
		if (this.node) xml += `node="true" `;
		xml += `id="${this.full_id}" pos="${this.position}">${this.map_name}</location>`;
		return xml;
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
		// if (typeof other === 'string') {
		// 	let res = /^(\d+)\:(\d+)\.(\d+)$/i.exec(other);
		// 	if (!res) return false;
		// 	return parseInt(res[2], 10) === this.map_bank
		// 		&& parseInt(res[3], 10) === this.map_id
		// 		&& parseInt(res[1], 10) === this.area_id;
		// }
		return false;
	}
	
	
/*	// Passthrough methods
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
*/
	
}


