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
	if (!Bot.runOption('correctCase')) return str; 
	// TODO
	return str; 
}


///////////////////////////////////////////////////////////////////////////////////////////////////

class Pokemon {
	constructor(mon={}) {
		this.name = 
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


