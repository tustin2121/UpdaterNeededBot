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

///////////////////////////////////////////////////////////////////////////////////////////////////

class Pokemon {
	constructor(mon) {
		this.name = '';
		this.species = '';
		this.nicknamed = false;
		
		this._gender = '';
		this.nature = '';
		this.caughtIn = '';
		this.ability = '';
		
		this.hp = 100;
		this.moves = [];
		this.moveInfo = [];
		if (Bot.runOpts('specialSplit')) {
			this._stats = {atk:0,def:0,hp:0,spa:0,spd:0,spe:0};
		} else {
			this._stats = {atk:0,def:0,hp:0,spl:0,spe:0};
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
		
		this.cp = 0;
		this.fitness = 0;
		
		this.hash = 0;
		
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
		
		// Fix shedinja bug:
		if (this.species.toLowerCase() === `shedinja`) this.hash++;
		
		this.dexid = read(mon.species, `national_dex`) || this.dexid;
		this.types.push(mon.species.type1);
		if (mon.species.type1 !== mon.species.type2) this.types.push(mon.species.type2);
		if (mon.met) {
			this.caughtIn = read(mon.met, `caught_in`);
		}
		this.stats = mon.stats; //uses setter below
		
		this.moves = mon.moves.map(m=> correctCase(m.name) );
		this.moveInfo = mon.moves.map(m=>{
			m = fillMoveInfo(m);
			return {
				id: m.id,
				max_pp: m.max_pp,
				pp: m.pp,
				name: correctCase(m.name),
				type: m.type
			};
		});
		
		if (mon.health) {
			this.hp = Math.floor((mon.health[0] / mon.health[1])*100);
			if (mon.health[0] !== 0) this.hp = Math.max(this.health, 1); //At least 1% HP if not fainted
		}
		
		this.cp = mon.cp || 0;
		this.fitness = mon.fitness || 0;
		
		if (Bot.runOpts('gender')) this._gender = mon.gender || this._gender;
		if (Bot.runOpts('heldItem')) {
			let item = read(mon, `held_item`) || mon.item || {};
			if (item.id > 0) this.item = item.name;
		}
		if (Bot.runOpts('pokerus') && mon.pokerus) {
			if (mon.pokerus.infected) this.pokerus = true;
			if (mon.pokerus.cured) this.pokerus = false;
		}
		if (Bot.runOpts('shiny')) this.shiny = mon.shiny;
		if (Bot.runOpts('sparkly')) this.sparkly = mon.sparkly;
		if (Bot.runOpts('abilities')) this.ability = mon.ability;
		
		if (Bot.runOpts('natures')) this.nature = `${mon.nature}`;
		if (Bot.runOpts('characteristics')) this.nature += `, ${mon.characteristic}`;
	}
	
	saveToMemory() {
		let obj = {};
		for (let key in this) {
			if (key.startsWith('_')) continue;
			if (typeof this[key] === 'function') continue;
			obj[key] = this[key];
		}
		obj.stats = this._stats;
		let buf = Buffer.from(JSON.stringify(obj), 'utf8');
		return buf.toString('base64');
	}
	loadFromMemory(str) {
		let buf = Buffer.from(JSON.stringify(obj), 'base64');
		let obj = JSON.parse(buf.toString('utf8'));
		for (let key in obj) {
			this[key] = obj[key];
		}
		return this;
	}
	
	toString() {
		return `${this.name} (${this.species})`;
	}
	
	get gender() {
		if (!Bot.runOpts('gender')) return '';
		switch(this.gender.toLowerCase()) {
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
			this._stats.spl = val.spl || val.sp || val.spa || val.spd || val.special || 0;
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
		// if ()
		xml += `</pokemon>`;
		return xml;
	}
}

class SortedLocation {
	constructor(data) {
		this.node = null;
		this.set(data);
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
		return this.map_name || this.area_name;
	}
	
	describe() {
		return `Loc[${this.map_bank}.${this.map_id}]{x=${this.x},y=${this.y}}`;
	}
	toString() {
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
		xml += `id="${this.full_id}" pos="${this.position}">${this.map_name}</location>`;
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
	
}

class SortedPokemon {
	constructor(data, game) {
		this._map = {};
		
		this._party = [];
		this._pc = [];
		this._daycare = [];
		
		this._nullBoxes = 0;
		
		if (data.party) {
			for (let i = 0; i < data.party.langth; i++) {
				let p = new Pokemon(data.party[i]);
				p.storedIn = 'party:'+i;
				this._map[p.hash] = p;
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
					let p = new Pokemon(box.box_contents[i]);
					p.storedIn = `box:${box.box_number||bn}-${box.box_contents[i].box_slot||i}`;
					this._map[p.hash] = p;
					b.push(p);
				}
				this._pc[bn] = b;
			}
		}
		if (data.daycare) {
			for (let i = 0; i < data.daycare.langth; i++) {
				let p = new Pokemon(data.daycare[i]);
				p.storedIn = 'daycare:'+i;
				this._map[p.hash] = p;
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
}

class Item {
	constructor(data) {
		this.name = data.name;
		this.id = data.id;
		this.pockets = new Set();
	}
	get isTM() { return this.pockets.has('tms'); }
	get inPC() { return this.pockets.has('pc') && this.pockets.size === 1; }
	get isHeld() { return this.pockets.has('held'); }
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
		
		if (data.items) {
			for (let pname in data.items) {
				let pocket = data.items[pname];
				for (let item of pocket) {
					this.add(item, pname);
				}
			}
		}
		
		if (data.party) {
			for (let p of data.party) {
				if (p.held_item) {
					this.add(p.held_item, 'held');
				}
			}
		}
		if (data.pc && Array.isArray(data.pc.boxes)) {
			for (let bn = 0; bn < data.pc.boxes.length; bn++) {
				let box = data.pc.boxes[bn];
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
	
	getData(id) {
		return this._dex[id];
	}
	
	add(itemData, pocketName) {
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
	constructor(data, game) {
		this.in_battle = data.in_battle;
		this.trainer = null;
		this.party = null;
		this.active = null;
		this.classes = {};
		
		let enemy_trainer = read(data, 'enemy_trainer', 'enemy_trainers');
		if (enemy_trainer) {
			this.trainer = [];
			if (!Array.isArray(enemy_trainer)) {
				enemy_trainer = [enemy_trainer];
			}
			for (let t of enemy_trainer) {
				this.trainer.push({
					'class': t.class_id,
					'id': t.id,
					'className': correctCase(sanatizeName(t.class_name)),
					'name': correctCase(sanatizeName(t.name)),
				});
			}
		}
		if (data.enemy_party) {
			this.party = [];
			for (let p of data.enemy_party) {
				let poke = {
					active: p.active,
					hp: Math.max(1, Math.floor( (p.health[0] / p.health[1])*100 )),
					species: p.species.name,
					dexid: read(p.species, 'national_dex', 'id'),
				}
				if (p.health[0] === 0) poke.hp = 0;
				this.party.push(poke);
			}
		}
		else if (data.wild_species) {
			this.party = [];
			if (Array.isArray(data.wild_species)) {
				for (let p of data.wild_species) {
					let poke = {
						active: true,
						// hp: Math.max(1, Math.floor( (p.health[0] / p.health[1])*100 )),
						species: p.name,
						dexid: read(p, 'national_dex', 'id'),
					};
					// if (p.health[0] === 0) poke.hp = 0;
					this.party.push(poke);
				}
			} else {
				let p = data.wild_species;
				let poke = {
					active: true,
					// hp: Math.max(1, Math.floor( (p.health[0] / p.health[1])*100 )),
					species: p.name,
					dexid: read(p, 'national_dex', 'id'),
				};
				// if (p.health[0] === 0) poke.hp = 0;
				this.party.push(poke);
			}
		}
		if (this.party) this.active = this.party.filter(p=>p.active);
		
		// Determine trainer classes
		this.isImportant = false;
		if (this.trainer) {
			let types = Bot.runOpts('trainerClasses', game);
			for (let type in types) {
				for (let trainer of this.trainer) {
					this.classes[type] = !!types[type][trainer.class];
					this.isImportant |= this.classes[type];
				}
			}
		}
	}
	get isRival() { return !!this.classes['rival']; }
	get isLeader() { return !!this.classes['leader']; }
	get isE4() { return !!this.classes['e4']; }
	get isChampion() { return !!this.classes['champ']; }
	
	get isLegendary() { return !!this.classes['legendary']; } //TODO
	
	get displayName() {
		let name = [];
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
		for (let trainer of this.trainer) {
			name.push(`tr${trainer.class}:${trainer.id}[${trainer.name}]`);
		}
		if (!name.length) {
			for (let p of this.party) {
				name.push(`pk${p.dexid}`);
			}
		}
		return name.join(';');
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
		
		this.level_cap = data.level_cap || 100;
		
		this._location = new SortedLocation(data);
		
		this._pokemon = new SortedPokemon(data);
		this._inventory = new SortedInventory(data);
		
		this._battle = new SortedBattle(data);
		
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
				if (data.time.h >= 6) return 'morning';
				return 'night';
			})();
		}
		
		this.rawData = data;
		this._rawGameIdx = game;
	}
	
	clone(code=200) {
		return new SortedData({ data:this.rawData, code, ts:this.ts, game:this._rawGameIdx });
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
	Pokemon, Item,
};
