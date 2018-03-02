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
		this.type = opts.type || null;
		this.width = opts.width || opts.w || 0;
		this.height = opts.height || opts.h || 0;
		
		// Stored game map information
		this.warps = opts.warps || [ null ];
		this.conns = opts.conns || {};
		this.events = opts.events || [];
		
		// Bot information
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) opts.areas.forEach(a=>this.addArea(a));
	}
	serialize() {
		let out = {
			bank: this.bank, id: this.id,
			name: this.name,
			areaId: this.areaId,
			areaName: this.areaName,
			type: this.type,
			width: this.width, height: this.height,
			warps: this.warps,
			conns: this.conns,
			events: this.events, //raw data
			attrs: this.attrs,
			areas: [],
		};
		
		out.areas = this.areas.map(x=>x.serialize());
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
		this.areas.push(new MapArea(opts));
	}
}

/**
 * MapNodes can be of a "type" (PokeCenter, Mart, etc), which can have default areas and attributes.
 * The type of a MapNode can also represent that this map is part of a collection of locations which
 * represent an area with distinct attributes (eg. Safari Zone, Entralink, Silph Building, etc).
 */
class MapType {
	constructor(opts={}) {
		this.type = opts.type;
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) opts.areas.forEach(a=>this.addArea(a));
	}
	
	addArea(opts={}) {
		this.areas.push(new MapArea(opts));
	}
}

/** 
 * MapNodes are the most atomic structure of the map location list, but we can drill deeper with 
 * MapAreas. MapAreas are subsections of a given map that are important or different from the
 * overall map. These attributes override the more general map attributes. Areas with one or both
 * dimensions (w/h) of 0 are considered point locations with a radius of effectiveness.
 */
class MapArea {
	constructor(opts={}) {
		this.x = opts.x || 0;
		this.y = opts.y || 0;
		this.w = opts.w || 0;
		this.h = opts.h || 0;
		
		this.name = opts.name || '';
		this.attrs = opts.attrs || {};
	}
	serialize() {
		return {
			x: this.x, y: this.y,
			w: this.w, h: this.h,
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
		this.from = opts.from;
		this.to = opts.to;
		this.text = opts.text;
		/** @param{number} timeout - Timeout before this rule should be used again. Put very high for only once. */
		this.timeout = opts.timeout || 10*60*1000;
	}
}

/** Default Map Types */
const MAP_TYPES = new Map([
	new MapType({ type:'unknown' }),
	new MapType({ type:'town',   attrs:{ town:true, } }),
	new MapType({ type:'route'   }),
	new MapType({ type:'indoor', attrs:{ indoors:true, } }),
	new MapType({ type:'cave',   attrs:{ indoors:true, dungeon:true } }),
	new MapType({ type:'gate',   attrs:{ indoors:true, } }),
	new MapType({ type:'dungeon',attrs:{ indoors:true, dungeon:true } }),
	new MapType({ type:'center', attrs:{ indoors:true, healing:true, checkpoint:true }, areas: [
		{ x:2, y:2, attrs:{ pc:true } },
	] }),
	new MapType({ type:'mart',   attrs:{ indoors:true, shopping:true } }),
	new MapType({ type:'gym',    attrs:{ indoors:true, gym:true } }),
].map(x=>[x.type, x]));

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
	}
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