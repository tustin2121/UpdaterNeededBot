// maptool mapnode.js
// The common starting point for a map

/** Represents a map in the game. This represents data about a location id given by the API. */
class MapNode {
	constructor(opts={}) {
		this.id = opts.id || opts.map || 0;
		this.bank = opts.bank || 0;
		this.name = opts.name || opts.areaName || '';
		
		this.areaId = opts.areaId || 0;
		this.areaName = opts.areaName || '';
		this.type = opts.type || opts.mapType || null;
		this.width = opts.width || opts.w || 0;
		this.height = opts.height || opts.h || 0;
		
		// Bot information
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) opts.areas.forEach(a=>this.addArea(a));
		
		// Stored game map information
		this.gamedata = opts.gamedata || opts.gameInfo || {
			warps: [ null ],
			conns: {},
			events: [],
		};
	}
	/** @prop{array} - Properties to enumerate when listing properties in the maptool. */
	static get PROPS() { return ['locId', 'name', 'areaId', 'areaName', 'type', 'width/height']; }
	
	get locId() { return `${this.bank}.${this.id}`; }
	// alias mapType => type
	get mapType() { return this.type; }
	set mapType(t) { this.type = t; }
	
	get gameInfo() { return this.gamedata; }
	set gameInfo(val){ this.gamedata = val; }
	
	// get warps(){ return this.gamedata.warps; }
	// get conns(){ return this.gamedata.conns; }
	
	serialize() {
		let out = {
			bank: this.bank, id: this.id,
			name: this.name,
			areaId: this.areaId,
			areaName: this.areaName,
			type: this.type,
			width: this.width, height: this.height,
			attrs: this.attrs,
			areas: [],
			gamedata: this.gamedata,
		};
		out.areas = this.areas.map(x=>x.serialize());
		return out;
	}
	
	addWarp(opts={}) {
		let w = {
			__addr: opts.__addr || undefined,
			to: `${opts.bank||0}.${opts.id}`,
			x: opts.x, y: opts.y,
			warp: opts.warp,
		};
		this.warps.push(w);
	}
	addConnection(dir, opts={}) {
		let c = {
			__addr: opts.__addr || undefined,
			to: `${opts.bank||0}.${opts.id}`,
			x: opts.x, y: opts.y,
		};
		this.conns[dir] = c;
	}
	addArea(opts={}) {
		if (opts === null) {
			this.areas.push(null); //these are used for spaces for template areas
		} else {
			this.areas.push(new MapArea(this, opts));
		}
	}
	
	setSpawnPoint(x, y) {
		this.addArea({ x, y, name:'spawn', attrs:{ flyspot:true, } })
	}
}

/**
 * MapNodes can be of a "type" (PokeCenter, Mart, etc), which can have default areas and attributes.
 * The type of a MapNode can also represent that this map is part of a collection of locations which
 * represent an area with distinct attributes (eg. Safari Zone, Entralink, Silph Building, etc).
 */
class MapType {
	constructor(opts={}) {
		this.name = opts.type || opts.name;
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) opts.areas.forEach(a=>this.addArea(a));
	}
	get locId() { return `[${this.name}]`; }
	
	get type() { return this.name }
	set type(val) { this.name = val; }
	
	/** @prop{array} - Properties to enumerate when listing properties in the maptool. */
	static get PROPS() { return ['locId', 'name']; }
	
	addArea(opts={}) {
		if (opts === null) {
			this.areas.push(null); //these are used for spaces for template areas
		} else {
			this.areas.push(new MapArea(this, opts));
		}
	}
	
	serialize() {
		let out = {
			type: this.name,
			attrs: this.attrs,
			areas: [],
		};
		out.areas = this.areas.map(x=>x.serialize());
		return out;
	}
}

/**
 * MapNodes are the most atomic structure of the map location list, but we can drill deeper with
 * MapAreas. MapAreas are subsections of a given map that are important or different from the
 * overall map. These attributes override the more general map attributes. Areas with one or both
 * dimensions (w/h) of 0 are considered point locations with a radius of effectiveness.
 */
class MapArea {
	constructor(parent, opts={}) {
		this.parent = parent;
		/** Top-right corner */
		this.ax = opts.ax || opts.x || 0;
		this.ay = opts.ay || opts.y || 0;
		/** Bottom-left corner */
		this.bx = opts.bx || (opts.x+opts.w) || this.ax;
		this.by = opts.by || (opts.y+opts.h) || this.ay;
		
		/** Effective detection radius */
		this.rad = opts.rad || (this.ax==this.bx && this.ay==this.by)?5:0;
		
		this.name = opts.name || '';
		this.attrs = opts.attrs || {};
	}
	get locId() { return `TODO`; } //TODO: get from parent, and get the index as the area id
	
	/** @prop{array} - Properties to enumerate when listing properties in the maptool. */
	static get PROPS() { return ['name', 'ax/ay', 'bx/by', 'rad']; }
	
	serialize() {
		return {
			ax: this.ax, ay: this.ay,
			bx: this.bx, by: this.by,
			rad: this.rad,
			name: this.name,
			attrs: this.attrs,
		};
	}
}

/**
 * TransitReports are reports which the bot will send out when moving from one distinct area (map, type, area)
 * to another. The from and to indicate a direction, and the from and to can indicate any of the above.
 */
class TransitReport {
	constructor(opts={}) {
		this.id = 0; //TODO random
		this.from = opts.from;
		this.to = opts.to;
		this.text = opts.text;
		/** @param{number} timeout - Timeout before this rule should be used again. Put very high for only once. */
		this.timeout = opts.timeout || 10*60*1000;
	}
}

/** Default Map Types */
function generateDefaultMapTypes() {
	const TYPES = {};
	const add = (t)=> TYPES[t.type] = t;
	
	add(new MapType({ type:'unknown' 	}));
	add(new MapType({ type:'town',   	attrs:{ town:true, } }));
	add(new MapType({ type:'route'  	}));
	add(new MapType({ type:'indoor',	attrs:{ indoors:true, } }));
	add(new MapType({ type:'cave',		attrs:{ indoors:true, dungeon:true } }));
	add(new MapType({ type:'gatehouse',	attrs:{ indoors:true, } }));
	add(new MapType({ type:'dungeon',	attrs:{ indoors:true, dungeon:true } }));
	add(new MapType({ type:'center',	attrs:{ indoors:true, healing:true, checkpoint:true },
		areas: [
			{ x:2, y:2, attrs:{ pc:true } },
		],
	}));
	add(new MapType({ type:'mart',		attrs:{ indoors:true, shopping:true } }));
	add(new MapType({ type:'gym',		attrs:{ indoors:true, gym:true } }));
	return TYPES;
}

/** Attributes for a given map, area, or type. */
const ATTRS = {
	the: {
		tooltip: `If the location name should use an article when printing the name.\nTrue=definite "the" | string=supplied article`,
		allowString: true,
	},
	preposition: {
		tooltip: `The preposition to use before this map name. Usually 'on' or 'in' (or rarely 'at').`,
	},
	
	inconsequential: { //TODO also add enter and exit strings
		tooltip: `If the location is not worthy of noting. A location change will not be reported when this room is arrived to or left from.`,
	},
	indoors: {
		tooltip: `If the location is inside (cannot fly)`,
	},
	town: {
		tooltip: `If the location is in a town (not the wild)`,
	},
	checkpoint: {
		tooltip: `If the location sets a checkpoint upon arriving (or when healing in gen 1).`,
		// This is also used to check for blackouts: if we arrive back at our previously marked checkpoint
		// From FRLG, this is fine for a checkpoint, but before that, blackouts appear outside the center.
	},
	flyspot: {
		tooltip: `If the location is a fly location or spawn point. (Use only for Areas marking the spot)`,
		areasOnly: true,
	},
	healing: {
		tooltip: `If the location offers healing.`,
		values: [false,'pokecenter','doctor','nurse','house','partner'],
	},
	shopping: {
		tooltip: `If the location offers vendors. Can be the name of the vendor. (Can be used for Areas)`,
		allowString: true,
	},
	vending: {
		tooltip: `If the location offers vending machines. (Use only for Areas marking the vending machine locations)`,
		areasOnly: true,
	},
	pc: {
		tooltip: `If the location is a PC. (Use only for Areas marking the PC)`,
		areasOnly: true,
	},
	gym: {
		tooltip: `If the location is a gym (badge/TM getting, attempt counting).`,
	},
	leader: {
		tooltip: `The name of the gym leader in this location. (Use only for Areas marking the leader)`,
		areasOnly: true,
		allowString: true,
	},
	e4: {
		tooltip: `If the location is part of the E4 (Run counting). If the E4 are linear, use e1-3 to mark them in order.`,
		values: [false,'lobby','e1','e2','e3','e4','champ','hallOfFame'],
	},
	dungeon: {
		tooltip: `If the location is a dungeon or cave.`,
	},
	legendary: {
		tooltip: `The name of the legendary pokemon in this location. (Use only for Areas marking the pokemon)`,
		areasOnly: true,
		allowString: true,
	},
	entralink: {
		tooltip: `If this location is an entralink map (special reporting)`,
	},
};

module.exports = {
	MapNode, MapArea, MapType, TransitReport,
	generateDefaultMapTypes, ATTRS,
};
