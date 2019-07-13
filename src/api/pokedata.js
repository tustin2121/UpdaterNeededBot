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
	val = val.replace(/π/g, 'ᵖᵏ').replace(/Π/g, 'ᵖᵏ').replace(/\u00ca/g, 'ᵖᵏ'); // Replace symbols
	val = val.replace(/µ/g, 'ᵐᶰ').replace(/Μ/g, 'ᵐᶰ').replace(/Ë/g, 'ᵐᶰ'); // Replace symbols
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

function fillMoveInfo(data) {
	if (!Bot.runOpts('moveInfo')) return data;
	try {
		// Gen 2 stores only current and number of PP Ups. We have to calculate max.
		let moveTable = require(`../../data/extdat/${Bot.runOpts('moveInfo')}`);
		data = Object.assign({}, moveTable[data.id], data);
		
		// If there are PP Up's applied, increase by 20% of the max
		if (data.pp_up) {
			let ppUp = data.maxPP / 5;
			// Gen 1 and 2 reduced this from 8 to 7, so it wouldn't overflow.
			// https://github.com/pret/pokecrystal/blob/217b7b8d9ba0d243ccbd9d4ae0a5b3ac7ab856e8/items/item_effects.asm#L3161
			if (ppUp === 8) ppUp = 7;
			data.maxPP += ppUp * data.pp_up;
		}
		
		return data;
	} catch (e) {
		getLogger('POKEDATA').error('Error filling moveInfo!', e);
		return data;
	}
}

function calcStats({ species, ivs, evs, }) {
	
}

function determineImportance(battle, game) {
	let method = Bot.runOpts('determineImportanceMethod', game);
	
	switch (method) {
		default:
		case 'viaClasses': return viaClasses();
		case 'viaTrainerId': return viaTrainerId();
	}
	
	return;
	
	function viaTrainerId() {
		let ids = Bot.runOpts('trainerClasses', game);
		for (let type in ids) {
			if (type in {m:1, f:1, p:1, info:1}) continue; //ignore these
			for (let trainer of battle.trainer) {
				battle.classes[type] = !!ids[type][trainer.id];
				battle.isImportant |= battle.classes[type];
			}
		}
	}
	
	function viaClasses() {
		let cls = Bot.runOpts('trainerClasses', game);
		if (cls.info) {
			for (let trainer of battle.trainer) {
				let info = cls.info[trainer.class];
				battle.isImportant = !!info.important;
				if (typeof info.important === 'string') {
					battle.classes[info.important] = true;
				}
			}
		} else {
			for (let type in cls) {
				if (type in {m:1, f:1, p:1, info:1}) continue; //ignore these
				for (let trainer of battle.trainer) {
					battle.classes[type] = !!cls[type][trainer.class];
					battle.isImportant |= battle.classes[type];
				}
			}
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////

class HeldItem {
	constructor(data) {
		if (data) {
			this.name = data.name;
			this.id = data.id;
		} else {
			this.name = '[NoItem]';
			this.id = 0;
		}
	}
	toString(){ return this.name; }
	toXml(hkey) {
		let xml = `<item `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `itemid="${this.id}">`;
		xml += `${this.name}`;
		xml += `</item>`;
		return xml;
	}
}

class Pokemon {
	constructor(mon, game=0) {
		this.name = '';
		this.species = '';
		this.nicknamed = false;
		this.form = null;
		
		this._gender = '';
		this.nature = '';
		this.caughtIn = '';
		this.ability = '';
		
		this.hp = 100;
		this._hp = [0,0];
		this.moves = [];
		this.moveInfo = [];
		this.hms = {};
		if (Bot.runOpts('specialSplit')) {
			this._stats = {atk:0,def:0,hp:0,spa:0,spd:0,spe:0};
		} else {
			this._stats = {atk:0,def:0,hp:0,spl:0,spe:0};
		}
		
		this.ot = {};
		
		this.dexid = -1;
		this.types = [];
		
		this.level = 0;
		this.item = null;
		this.storedIn = '';
		
		this.shiny = false;
		this.sparkly = false;
		this.shadow = false;
		this.shadow_hypermode = false;
		this.pokerus = null; //true = infected, false = cured, null = never had
		this.traded = false;
		this.status = '';
		this.active = false;
		this.battleBuffs = {};
		
		this.cp = 0;
		this.fitness = 0;
		
		this.hash = 0;
		this.game = game; //the game this pokemon belongs to
		
		if (typeof mon === 'string') {
			this.loadFromMemory(mon);
			return this;
		}
		if (typeof mon !== 'object') return this;
		
		this.hash = read(mon, `personality_value`);
		this.name = mon.name || mon.nickname || '';
		this.species = (mon.species && mon.species.name) || '';
		this.nicknamed = !!(mon.nicknamed || checkNicknamed(this.name, this.species) || false);
		this.name = sanatizeName(this.name);
		
		if (Bot.runOpts('forms') && mon.form) {
			let forms = require('../../data/extdat/pkmnforms');
			this.form = (forms[this.species.toLowerCase()]||[])[mon.form];
		}
		
		// Fix shedinja bug:
		if (this.species.toLowerCase() === `shedinja`) this.hash++;
		
		this.ot = read(mon, `original_trainer`) || {};
		
		this.dexid = read(mon.species, `national_dex`) || this.dexid;
		this.types.push(mon.species.type1);
		if (mon.species.type1 !== mon.species.type2) this.types.push(mon.species.type2);
		if (mon.met) {
			this.caughtIn = read(mon.met, `caught_in`);
		}
		this.stats = mon.stats || {}; //uses setter below
		this.level = mon.level;
		
		this.moves = mon.moves.map(m=> correctCase(m.name) );
		this.moveInfo = mon.moves.map(m=>{
			m = fillMoveInfo(m);
			if (m.id === Bot.runOpts('moveId_surf')) this.hms.surf = true;
			if (m.id === Bot.runOpts('moveId_fly')) this.hms.fly = true;
			return {
				id: m.id,
				max_pp: m.max_pp,
				pp: m.pp,
				name: correctCase(m.name),
				type: m.type
			};
		});
		
		if (mon.health) {
			this._hp = [mon.health[0], mon.health[1]];
			this.hp = Math.floor((mon.health[0] / mon.health[1])*100);
			if (mon.health[0] !== 0) this.hp = Math.max(this.hp, 1); //At least 1% HP if not fainted
		}
		this.status = (mon.status||'').toLowerCase();
		
		this.cp = mon.cp || 0;
		this.fitness = mon.fitness || 0;
		
		if (!Bot.runOpts('personalityValues') && Bot.runFlag('pv_patch')) {
			// Gens 1 and 2 don't have personality values, so we may have to do some hacks to make them more unique.
			this.hash ^= this.dexid * this.dexid;
		}
		
		if (Bot.runOpts('gender')) this._gender = mon.gender || this._gender;
		if (Bot.runOpts('heldItem')) {
			let item = read(mon, `held_item`) || mon.item || {};
			if (item.id > 0) this.item = new HeldItem(item);
			else this.item = new HeldItem(null);
		}
		if (Bot.runOpts('pokerus') && mon.pokerus) {
			if (mon.pokerus.infected) this.pokerus = true;
			if (mon.pokerus.cured) this.pokerus = false;
		}
		if (Bot.runOpts('shiny')) this.shiny = mon.shiny;
		if (Bot.runOpts('sparkly')) this.sparkly = mon.sparkly;
		if (Bot.runOpts('shadow')) {
			this.shadow = !!read(mon, 'is_shadow', 'shadow');
			this.shadow_hypermode = !!read(mon, 'in_hyper_mode');
		}
		if (Bot.runOpts('abilities')) this.ability = mon.ability;
		
		if (Bot.runOpts('natures')) this.nature = `${mon.nature}`;
		if (Bot.runOpts('characteristics')) this.nature += `, ${mon.characteristic}`;
		
		this.active = !!read(mon, 'volatile_status');
		if (mon.buffs) {
			this.battleBuffs = {
				'atk': mon.buffs.attack+1,
				'def': mon.buffs.defense+1,
				'spe': mon.buffs.speed+1,
				'spa': mon.buffs.special_attack+1,
				'spd': mon.buffs.special_defense+1,
				'acc': mon.buffs.accuracy+1,
				'eva': mon.buffs.evasion+1,
			}
		}
		
		// Validation check:
		if (this.fitness < 0) throw new TypeError('Corrupt data!');
	}
	
	saveToMemory() {
		let obj = {};
		for (let key in this) {
			if (key.startsWith('_') && key !== '_hp') continue;
			if (typeof this[key] === 'function') continue;
			obj[key] = this[key];
		}
		obj.stats = this._stats;
		let buf = Buffer.from(JSON.stringify(obj), 'utf8');
		return buf.toString('base64');
	}
	loadFromMemory(str) {
		let buf = Buffer.from(str, 'base64');
		let obj = JSON.parse(buf.toString('utf8'));
		for (let key in obj) {
			this[key] = obj[key];
		}
		return this;
	}
	
	/** @param {int} num - Used to trick the TypeSetter to never pluralize a pokemon name. */
	toString(num) {
		if (this.form) return `${this.name} (${this.species} ${this.form})`;
		return `${this.name} (${this.species})`;
	}
	
	get isTraded() {
		let res = (this.ot.id === Bot.gameInfo(this.game).trainer.id);
		if (Bot.runOpts('secretId', this.game))
			res &= this.ot.secret === Bot.gameInfo(this.game).trainer.secret
		return !res;
	}
	
	get gender() {
		if (!Bot.runOpts('gender')) return '';
		switch(this._gender.toLowerCase()) {
			case 'female': case 'f':	return '\u2640'; // ♀ female sign
			case 'male': case 'm':		return '\u2642'; // ♂ male sign
			case 'neuter': case '':		return '\u26AA'; // ⚪ medium white circle
		}
		return this._gender;
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
			this._stats.spl = val.spl || val.sp || val.spa || val.spd || val.special || val.special_attack || val.special_defense || 0;
		}
		this._stats.hp  = val.hp  || val.hit_points || 0;
	}
	
	getExtendedInfo(includeStats=true) {
		if (this.species === 'Egg') return 'Egg';
		
		let exInfo = `${this.types.join('/')}`;
		if (Bot.runOpts('heldItem')) exInfo += ` | Item: ${this.item?this.item:"None"}`;
		if (Bot.runOpts('abilities')) exInfo += ` | Ability: ${this.ability}`;
		if (Bot.runOpts('natures')) exInfo += ` | Nature: ${this.nature}`;
		if (Bot.runOpts('caughtInfo')) exInfo += `\nCaught In: ${this.caughtIn}`;
		exInfo += ` | Moves: ${this.moves.join(', ')}`;
		
		if (includeStats) {
			let stats = [];
			stats.push(`HP: ${this.stats.hp}`);
			stats.push(`ATK: ${this.stats.atk}`);
			stats.push(`DEF: ${this.stats.def}`);
			if (Bot.runOpts('specialSplit')) {
				stats.push(`SPA: ${this.stats.spa}`);
				stats.push(`SPD: ${this.stats.spd}`);
			} else {
				stats.push(`SPL: ${this.stats.spl}`);
			}
			stats.push(`SPE: ${this.stats.spe}`);
			exInfo += `\n${stats.join(' | ')}`;
			
			if (this.cp > 0) {
				exInfo += `\nCombat Points: ${this.cp} | Fitness: ${this.fitness}`;
			}
		}
		
		let f = [];
		if (this.isTraded) f.push(`Traded - OT: ${this.ot.name}`);
		if (Bot.runOpts('pokerus') && this.pokerus) f.push(`Has PokeRus`);
		if (Bot.runOpts('shiny') && this.shiny) f.push('Shiny');
		if (Bot.runOpts('sparkly') && this.sparkly) f.push('Sparkly (N\'s Pokemon)');
		// if (this.level_reported) f.push(`Levels: API says ${mon.level_reported}, we calculated ${mon.level_calculated}`);
		if (f.length) exInfo += `\n${f.join(' | ')}`;
		return exInfo;
	}
	
	toXml(hkey) {
		let xml = `<pokemon `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `hash="${this.hash}">`;
		xml += this.saveToMemory();
		xml += `</pokemon>`;
		return xml;
	}
}

/** A cut down version of Pokemon, made so that things are consistent */
class Combatant {
	constructor(data, game=0) {
		this.name = null;
		this.species = null;
		this.dexid = 0;
		this.active = false;
		
		this.hash = 0;
		this.hp = 100;
		this._hp = [100, 100];
		this.shiny = false;
		this.gender = '';
		this.moves = [];
		this.battleBuffs = {};
		
		this.game = game; //the game this pokemon belongs to
		if (!data) return;
		
		this.active = data.active;
		if (this.active === undefined) this.active = (data.species && data.species.id !== 0);
		
		this.hp = Math.max(1, Math.floor( (data.health[0] / data.health[1])*100 ));
		if (data.health[0] !== 0) this.hp = Math.max(this.hp, 1); //At least 1% HP if not fainted
		this._hp = [data.health[0], data.health[1]];
		
		this.name = data.name || read(data.species, 'name');
		this.species = read(data.species, 'name') || data.name;
		this.dexid = read(data.species, 'national_dex', 'id');
		this.hash = read(data, 'personality_value');
		this.shiny = data.shiny || this.shiny;
		this.gender = data.gender || this.gender;
		this.moves = (data.moves && data.moves.slice()) || this.moves;
		if (data.buffs) {
			this.battleBuffs = {
				'atk': data.buffs.attack+1,
				'def': data.buffs.defense+1,
				'spe': data.buffs.speed+1,
				'spa': data.buffs.special_attack+1,
				'spd': data.buffs.special_defense+1,
				'acc': data.buffs.accuracy+1,
				'eva': data.buffs.evasion+1,
			}
		}
	}
	
	cloneToAssumedPrev() {
		let clone = new Combatant();
		clone.name = this.name;
		clone.species = this.species;
		clone.dexid = this.dexid;
		clone.active = this.active;
		clone.hash = this.hash;
		clone.hp = 100;
		clone._hp = [this._hp[1], this._hp[1]]; //max HP
		clone.shiny = this.shiny;
		clone.game = this.game;
		clone.gender = this.gender;
	}
	
	saveToMemory() {
		let obj = {};
		for (let key in this) {
			if (key.startsWith('_') && key !== '_hp') continue;
			if (typeof this[key] === 'function') continue;
			obj[key] = this[key];
		}
		obj.stats = this._stats;
		let buf = Buffer.from(JSON.stringify(obj), 'utf8');
		return buf.toString('base64');
	}
	loadFromMemory(str) {
		let buf = Buffer.from(str, 'base64');
		let obj = JSON.parse(buf.toString('utf8'));
		for (let key in obj) {
			this[key] = obj[key];
		}
		return this;
	}
	
	/** @param {int} num - Used to trick the TypeSetter to never pluralize a pokemon name. */
	toString(num) {
		if (this.species === this.name) {
			if (this.form) return `${this.name} (${this.form})`;
			return this.name;
		}
		if (this.form) return `${this.name} (${this.species} ${this.form})`;
		return `${this.name} (${this.species})`;
	}
}

class SortedLocation {
	constructor(data) {
		this.node = null;
		this.set(data);
		
		let region = Bot.gameInfo().regionMap;
		if (region instanceof require('./mapnode').MapRegion) {
			this.node = region.resolve(this);
		}
	}
	
	set(opts={}) {
		this.map_name = read(opts, 'map_name') || '<Undisclosed Location>';
		this.area_name = read(opts, 'area_name') || '<Undisclosed Area>';
		this.area_id = read(opts, 'area_id') || 0;
		this.map_bank = read(opts, 'map_bank') || 0;
		this.map_id = read(opts, 'map_id') || 0;
		this.x = read(opts, 'x') || 0;
		this.y = read(opts, 'y') || 0;
		this.z = read(opts, 'z');
	}
	
	get name() {
		if (this.node) return this.node.name;
		return this.map_name || this.area_name;
	}
	
	describe() {
		return `Loc[${this.map_bank}.${this.map_id}]{x=${this.x},y=${this.y}}`;
	}
	toString() {
		if (this.node) return this.node.name;
		return this.map_name;
	}
	
	get bank_id() {
		let id = `${this.map_id}`;
		if (this.map_bank) id = `${this.map_bank}.${id}`;
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
		xml += `mapid="${this.bank_id}" pos="${this.position}">`;
		xml += this.map_name.replace(/&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
		xml += `</location>`;
		return xml;
	}
	
	equals(other) {
		if (other instanceof SortedLocation) {
			if (this.node) {
				return other.node === this.node;
			} else {
				return other.map_bank === this.map_bank
					&& other.map_id === this.map_id
					&& other.area_id === this.area_id;
			}
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
	
	is(attr) {
		if (this.node) return this.node.is(attr);
		switch (attr) {
			case 'preposition': return determineOnIn(this.name);
		}
		return undefined;
		
		function determineOnIn(name) {
			if (/town|city/i.test(name)) return 'in';
			if (/route/i.test(name)) return 'on';
			if (/house|center|mart|f|cave|forest/i.test(name)) return 'in';
			if (/league/i.test(name)) return 'at';
			return 'on';
		}
	}
	
	within(attr) {
		if (this.node) return this.node.within(attr, this.x, this.y);
		return undefined;
	}
}
SortedLocation.prototype.has = SortedLocation.prototype.is; //Alias
SortedLocation.prototype.can = SortedLocation.prototype.is; //Alias
SortedLocation.prototype.get = SortedLocation.prototype.is; //Alias

class SortedPokemon {
	constructor(data, game=0) {
		/** @type{Map<int, object>} map of all raw pokemon data */
		this._raw = {};
		/** @type{Map<int, Pokemon>} map of all pokemon objects */
		this._map = {};
		
		this._party = [];
		this._pc = [];
		this._daycare = [];
		
		this._nullBoxes = 0;
		
		if (data.party) {
			for (let i = 0; i < data.party.length; i++) {
				if (!data.party[i]) continue;
				let p = new Pokemon(data.party[i], game);
				p.storedIn = 'party:'+i;
				this._map[p.hash] = p;
				this._raw[p.hash] = data.party[i];
				this._party.push(p);
			}
		}
		if (data.pc && Array.isArray(data.pc.boxes)) {
			for (let bn = 0; bn < data.pc.boxes.length; bn++) {
				let box = data.pc.boxes[bn];
				if (!box) { // handle null boxes
					this._nullBoxes++;
					continue; //skip box
				}
				let b = [];
				for (let i = 0; i < box.box_contents.length; i++) {
					let p = new Pokemon(box.box_contents[i], game);
					p.storedIn = `box:${box.box_number||bn+1}-${box.box_contents[i].box_slot||i}`;
					this._map[p.hash] = p;
					this._raw[p.hash] = box.box_contents[i];
					b.push(p);
				}
				this._pc[bn] = b;
			}
		}
		if (data.daycare) {
			for (let i = 0; i < data.daycare.length; i++) {
				let p = new Pokemon(data.daycare[i], game);
				p.storedIn = 'daycare:'+i;
				this._map[p.hash] = p;
				this._raw[p.hash] = data.daycare[i];
				this._daycare.push(p);
			}
		}
	}
	
	get party() { return this._party; }
	get all() { return Object.values(this._map); }
	
	get numNullBoxes() {
		return this._nullBoxes;
	}
	
	find(predicate) {
		let list = [];
		for (let p in this._map) {
			if (predicate(p)) list.push(p);
		}
		return list;
	}
	
	getDelta(prev) {
		let ad = Object.keys(this._map).filter(x=>!!prev._map[x]);
		let rm = Object.keys(prev._map).filter(x=>!!this._map[x]);
		
		return {
			added: ad.map(x=>this._map[x]),
			removed: rm.map(x=>prev._map[x]),
		}
	}
	
	getRawData(mon) {
		if (mon instanceof Pokemon) return this._raw[mon.hash];
		return this._raw[mon];
	}
}

class Item {
	constructor(data) {
		this.name = data.name || '[Unnamed Item]';
		this.id = data.id;
		this.pockets = new Set();
		this.pluralName = null;
		if (this.name.startsWith('TM') || this.name.startsWith('HM'))
			this.pluralName = this.name; //do not pluralize
	}
	get isTM() { return this.pockets.has('tms'); }
	get inPC() { return this.pockets.has('pc') && this.pockets.size === 1; }
	get isHeld() { return this.pockets.has('held'); }
	toString(){ return this.name; }
	
	toXml(hkey) {
		let xml = `<item `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `itemid="${this.id}">`;
		xml += `${this.name}`;
		xml += `</item>`;
		return xml;
	}
}

class SortedInventory {
	constructor(data, game) {
		/** An inventory of all items present on the character. */
		this._inv = {};
		/** An index of item information. */
		this._dex = {};
		
		this.bag = {};
		this.held = {};
		this.pc = {};
		this.money = data.money;
		
		if (data.items) {
			for (let pname in data.items) {
				let pocket = data.items[pname];
				for (let item of pocket) {
					this.add(item, pname);
				}
			}
		}
		
		if (Bot.runOpts('heldItem')) {
			if (data.party) {
				for (let p of data.party) {
					if (p && p.held_item && p.held_item.id) {
						this.add(p.held_item, 'held');
					}
				}
			}
			if (data.pc && Array.isArray(data.pc.boxes)) {
				for (let bn = 0; bn < data.pc.boxes.length; bn++) {
					let box = data.pc.boxes[bn];
					if (!box) continue; //null boxes handled elsewhere
					for (let p of box.box_contents) {
						if (p.held_item) {
							this.add(p.held_item, 'held');
						}
					}
				}
			}
			if (data.daycare) {
				for (let p of data.daycare) {
					if (p.held_item) {
						this.add(p.held_item, 'held');
					}
				}
			}
		}
	}
	
	getData(id) {
		return this._dex[id];
	}
	
	add(itemData, pocketName) {
		// getLogger('SortedInventory').log('.add(',itemData, pocketName);
		if (!itemData || !itemData.id) return;
		
		let item = this._dex[itemData.id] || new Item(itemData);
		let count = (this._inv[itemData.id] || 0) + (itemData.count||1);
		this._dex[itemData.id] = item;
		this._inv[itemData.id] = count;
		switch (pocketName) {
			case 'pc':
				this.pc[itemData.id] = (this.pc[itemData.id]||0) + (itemData.count||1);
				break;
			case 'held':
				this.held[itemData.id] = (this.held[itemData.id]||0) + (itemData.count||1);
				break;
			default:
				this.bag[itemData.id] = (this.bag[itemData.id]||0) + (itemData.count||1);
				break;
		}
		item.pockets.add(pocketName);
	}
}

class SortedBattle {
	constructor(data, game, loc) {
		this.in_battle = data.in_battle;
		this.trainer = null;
		this.party = null;
		this.active = null;
		this.classes = {};
		this.loc = (loc)?loc.describe().slice(3):null;
		
		let enemy_trainer = read(data, 'enemy_trainer', 'enemy_trainers');
		if (enemy_trainer) {
			if (!Array.isArray(enemy_trainer)) {
				enemy_trainer = [enemy_trainer];
			}
			if (enemy_trainer.length) {
				this.trainer = [];
				for (let t of enemy_trainer) {
					let data = {
						'class': t.class_id,
						'id': t.id,
						'className': (t.class_name)?correctCase(sanatizeName(t.class_name||'trainer')):'', //Not used in gen 1
						'name': correctCase(sanatizeName(t.name||'')),
					};
					if (t.gender) {
						data.gender = t.gender.toLowerCase();
					} else if (Bot.runOpts('trainerClasses', game)) {
						let cls = Bot.runOpts('trainerClasses', game);
						if (cls.info) { //Check for individual info first
							let info = cls.info[t.class_id];
							data.gender = info.gender;
							data.realClassName = info.name;
							if (!data.className) data.className = info.name;
						} else if (cls.m && cls.f && cls.p) {
							if (cls.m[data.class]) data.gender = 'male';
							else if (cls.f[data.class]) data.gender = 'female';
							else if (cls.p[data.class]) data.gender = 'plural';
							else data.gender = 'neuter';
						}
					}
					this.trainer.push(data);
				}
			}
		}
		else if (data.battle_kind === 'Trainer') {
			let leader = loc.within('leader');
			this.trainer = leader || true;
		}
		if (data.enemy_party) {
			this.party = [];
			for (let p of data.enemy_party) {
				if (!p) continue;
				let poke;
				if (Bot.runOpts('fullEnemyInfo')) {
					poke = new Pokemon(p, game);
					if (p.active !== undefined) poke.active = p.active;
				} else {
					poke = new Combatant(p);
				}
				if (p.health[0] === 0) poke.hp = 0;
				this.party.push(poke);
			}
		}
		else if (data.wild_species) {
			this.party = [];
			let wild_species = data.wild_species;
			if (!Array.isArray(wild_species)) wild_species = [wild_species];
			for (let p of wild_species) {
				if (!p) continue;
				let poke;
				if (Bot.runOpts('fullEnemyInfo')) {
					poke = new Pokemon(p, game);
					if (p.active !== undefined) poke.active = p.active;
				} else {
					poke = new Combatant(p);
				}
				this.party.push(poke);
			}
		}
		if (this.party) {
			this.active = this.party.filter(p=>p.active);
			// If there's no mon marked active, assume the first healthy mon
			if (this.active.length == 0) this.active = [this.party.filter(p=>p.hp !== 0)[0]];
		}
		
		// Determine trainer classes
		this.isImportant = false;
		if (typeof this.trainer === 'string') {
			this.isImportant = true;
			let type = loc.get('trainertype');
			if (type) this.classes[type] = true;
		}
		else if (Array.isArray(this.trainer)) {
			determineImportance(this, game);
		}
		if (Bot.runFlag('force_important')) {
			if (!this.isImportant) {
				this.isCommon = true;
			}
			this.isImportant = true;
		}
	}
	get isRival() { return !!this.classes['rival']; }
	get isLeader() { return !!this.classes['leader']; }
	get isE4() { return !!this.classes['e4']; }
	get isChampion() { return !!this.classes['champ']; }
	// get isCommon() { return !!this.classes['common']; }
	
	get isLegendary() { return !!this.classes['legendary']; } //TODO
	
	get displayName() {
		let name = [];
		if (typeof this.trainer === 'string') return this.trainer;
		if (this.trainer === true) return 'trainer';
		if (!Array.isArray(this.trainer)) return undefined;
		for (let trainer of this.trainer) {
			name.push(`${trainer.className} ${trainer.name}`.trim());
		}
		if (name.length > 2) {
			name[name.length-1] = `and ${name[name.length-1]}`;
			return name.join(', ');
		} else {
			return name.join(' and ');
		}
	}
	get attemptId() {
		let name = [];
		if (typeof this.trainer === 'string') {
			name.push(`tr[${this.trainer}]`);
		}
		else if (this.trainer === true) {
			name.push('trX'+this.loc);
		}
		else if (Array.isArray(this.trainer)) {
			for (let trainer of this.trainer) {
				name.push(`tr${trainer.class}:${trainer.id}[${trainer.name}]`);
			}
		} 
		else { //Wild battles
			name.push('w'+this.loc);
			if (this.party) {
				for (let p of this.party) {
					name.push(`pk${p.dexid}`);
				}
			}
		}
		return name.join(';');
	}
	
	checkSpecialTrainers() {
		if (Array.isArray(this.trainer)) {
			for (let trainer of this.trainer) {
				if (trainer.id === 0) continue; //skip
				if (Bot.runOpts('trainerId_joey') === trainer.id) return 'joey';
			}
		}
		return undefined;
	}
	
	toXml(hkey) {
		let xml = `<battle `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `attemptId="${this.attemptId}" isImportant="${this.isImportant}">`;
		if (typeof this.trainer === 'string') {
			xml += `<trainer>${this.trainer}</trainer>`;
		}
		else if (this.trainer === true) {
			xml += `<trainer>trainer</trainer>`;
		}
		else if (Array.isArray(this.trainer)) {
			for (let trainer of this.trainer) {
				xml += `<trainer trClass="${trainer.class}" trId="${trainer.id}">${trainer.className} ${trainer.name}</trainer>`;
			}
		}
		if (this.party) {
			for (let p of this.party) {
				xml += `<combatant dexid="${p.dexid}" active="${p.active}" hp="${p.hp}">${p.species}${p.form?' '+p.form:''}</combatant>`;
			}
		}
		xml += `</battle>`;
		return xml;
	}
}

class SortedData {
	constructor({ data, code=200, game=0, ts=0 }) {
		if (typeof data !== 'object') throw new TypeError(`Passed not-an-object to SortedData! [${data}]=>[${typeof data}] `);
		this.httpCode = code;
		this.ts = ts; //timestamp of this data
		
		// Shallowly validate data
		if (typeof data['party'] !== 'object' ||
			typeof data['pc'] !== 'object')
		{
			throw new TypeError('Passed invalid data object to SortedData!');
		}
		
		this._name = data.name || '';
		this._rival = data.rival_name || Bot.runOpts('rivalName', game) || null;
		this.playerGender = data.gender;
		this.trainerId = [data.id, data.secret];
		
		this.level_cap = data.level_cap || 100;
		
		this._location = new SortedLocation(data, game);
		
		this._pokemon = new SortedPokemon(data, game);
		this._inventory = new SortedInventory(data, game);
		
		this._battle = new SortedBattle(data, game, this._location);
		
		// badges
		this.badges = {};
		this.numBadges = 0;
		if (data.badges !== undefined) {
			let badges = Bot.runOpts('badgeNames', game);
			for (let i = 0; i < badges.length; i++) {
				let name = badges[i];
				this.badges[name] = !!(data.badges & (0x1 << i));
				if (this.badges[name]) this.numBadges++;
			}
		}
		
		if (data.time && data.time.h) {
			this.timeOfDay = (()=>{
				if (data.time.h >= 20) return 'night';
				if (data.time.h >= 12) return 'day';
				if (data.time.h >= 4) return 'morning';
				return 'night';
			})();
		}
		
		// pc data
		if (Array.isArray(data.pc.boxes)) {
			this.pcBoxes = data.pc.boxes.map((x, i)=>{
				if (x === null) {
					return { invalid: true, };
				}
				let bn = x.box_number || (i+1);
				let b = {
					name: x.box_name,
					num: bn,
					isCurrent: (data.pc.current_box_number === bn),
					isFull: (x.box_contents.length === Bot.runOpts('pcBoxCapacity', game)),
					isEffectiveCurrent: false,
				};
				return b;
			});
			
			if (typeof data.pc.current_box_number === 'number') {
				if (Bot.runOpts('pcBoxRollover', game)) {
					// Determine the effective current box
					for (let i = 0; i < this.pcBoxes.length; i++) {
						if (!this.pcBoxes[i]) continue;
						let bn = (i + data.pc.current_box_number) % this.pcBoxes.length;
						if (this.pcBoxes[bn].isFull) continue;
						this.pcBoxes[bn].isEffectiveCurrent = true;
						break;
					}
				} else {
					this.pcBoxes[data.pc.current_box_number-1].isEffectiveCurrent = true;
				}
			}
		}
		
		this.evolution_is_happening = data.evolution_is_happening || false;
		
		this.rawData = data;
		this._rawGameIdx = game;
		
		// getLogger('SortedData').log(this);
	}
	
	clone(code=200) {
		return new SortedData({ data:this.rawData, code, ts:this.ts, game:this._rawGameIdx });
	}
	
	getFromRaw(...name) {
		return read(this.rawData, ...name);
	}
	
	get badgeProgress() {
		return this.numBadges / Bot.runOpts('badgeNames', this._rawGameIdx).length;
	}
	
	get location() { return this._location; }
	get name() { return this._name; }
	get rival_name() { return this._rival; }
	
	get party() { return this._pokemon._party; }
	get pokemon() { return this._pokemon; }
	get inventory() { return this._inventory; }
	get inv() { return this._inventory; }
	get battle() { return this._battle; }
	
	get in_battle() {
		return this._battle.in_battle;
	}
}

module.exports = {
	SortedData, SortedBattle, SortedPokemon, SortedInventory, SortedLocation,
	Pokemon, Item, Combatant,
};
