// maptool mapnode.js
// The classes that represent a map, except this kind is editable

/* global App */

const EventEmitter = require('events');

/** Represents everything in a region, including all the map nodes. */
class MapRegion {
	constructor(data) {
		this.name = '';
		this.types = {};
		this.nodes = [];
		this.reports = [];
		
		if (typeof data === 'object') { //deserialize
			this.name = data.name;
			this.types = Object.assign({}, data.types);
			for (let t in this.types) {
				this.types[t] = new MapType(this, this.types[t]);
			}
			for (let bank = 0; bank < data.nodes.length; bank++) {
				if (!data.nodes[bank]) continue;
				this.nodes[bank] = [];
				for (let map = 0; map < data.nodes[bank].length; map++) {
					if (!data.nodes[bank][map]) continue;
					this.nodes[bank][map] = new MapNode(this, data.nodes[bank][map]);
				}
			}
			for (let report of data.reports) {
				switch (report.type) {
					case 'transit':
						report.from = this.resolveLocId(report.from);
						report.to = this.resolveLocId(report.to);
						this.reports.push(new TransitReport(this, report));
						break;
					case 'item':
						report.loc = this.resolveLocId(report.loc);
						this.reports.push(new ItemReport(this, report));
						break;
					case 'battle':
						report.loc = this.resolveLocId(report.loc);
						this.reports.push(new BattleReport(this, report));
						break;
				}
				
			}
		}
		else if (typeof data === 'string') { //new region
			this.name = data;
			this.types = generateDefaultMapTypes(this);
		}
	}
	
	is(attr) { return this.types['default'].is(attr); }
	
	serialize() {
		let data = { name:this.name, types:{}, nodes:[], reports:[], };
		for (let t in this.types) {
			data.types[t] = this.types[t].serialize();
		}
		for (let bank = 0; bank < this.nodes.length; bank++) {
			if (!this.nodes[bank]) continue;
			data.nodes[bank] = [];
			for (let map = 0; map < this.nodes[bank].length; map++) {
				if (!this.nodes[bank][map] || !this.nodes[bank][map].serialize) continue;
				data.nodes[bank][map] = this.nodes[bank][map].serialize();
			}
		}
		for (let report of this.reports) {
			if (!report) continue;
			data.reports.push(report.serialize());
		}
		return data;
	}
	
	resolveLocId(id) {
		let res;
		if (!id) return null;
		if ((res = /\[(\w+)\]/.exec(id))) {
			return this.types[res[1]];
		}
		if ((res = /(\d+)\.(\d+)(?:\:(\d+))?/.exec(id))) {
			let bank = this.nodes[res[1]];
			let map = bank[res[2]];
			if (res[3]) map = map.areas[res[3]];
			return map;
		}
		return null;
	}
	
	resolve(arg) {
		if (typeof arg === 'string') return this.resolveLocId(arg);
		if (typeof arg === 'object') {
			let { bank, id, area, x, y } = arg;
			bank = this.nodes[bank];
			if (!bank) return null;
			if (area) return bank[id].areas[area];
			if (typeof x === 'number' && typeof y == 'number') {
				let map = bank[id];
				if (!map) return null;
				for (let area of map.areas) {
					if (x >= area.ax && x <= area.bx
						&& y >= area.ay && y <= area.by) return area;
				}
				let type = this.types[map.type];
				if (type && type.areas) {
					for (let area of type.areas) {
						if (x >= area.ax && x <= area.bx
							&& y >= area.ay && y <= area.by) return area;
					}
				}
			}
			return bank[id];
		}
		return null;
	}
	
	findTransitReports(from, to) {
		return this.reports.filter(TransitReport.filter({ from, to }));
	}
	findItemReports(loc, itemid) {
		return this.reports.filter(ItemReport.filter({ loc, itemid }));
	}
	findBattleReports(loc, trainerid, classid) {
		return this.reports.filter(BattleReport.filter({ loc, trainerid, classid }));
	}
	
	ensureMap(bankId, mapId, data={}) {
		this.nodes[bankId] = this.nodes[bankId] || [];
		if (!this.nodes[bankId][mapId]) {
			this.nodes[bankId][mapId] = new MapNode(this, data);
			this.renumberMaps();
			App.notifyChange('map-new', this.nodes[bankId][mapId]);
		}
		return this.nodes[bankId][mapId];
	}
	
	createMap(bankId, mapId) {
		this.nodes[bankId] = this.nodes[bankId] || [];
		this.nodes[bankId][mapId] = new MapNode(this);
		this.renumberMaps();
		App.notifyChange('map-new', this.nodes[bankId][mapId]);
	}
	
	deleteMap(bankId, mapId) {
		if (!this.nodes[bankId]) return;
		let bank = this.nodes[bankId];
		delete bank[mapId];
		// shrink away empty space at the end of an array
		while (!(bank.length-1 in bank) && bank.length > 0) { bank.length--; }
		App.notifyChange('map-del', this);
	}
	
	insertMapSlot(bankId, mapId) {
		let bank = this.nodes[bankId] = this.nodes[bankId] || [];
		bank.splice(mapId, 0, null);
		delete bank[mapId]; //make empty
		this.renumberMaps();
		App.notifyChange('slot-new', this);
	}
	
	deleteMapSlot(bankId, mapId) {
		if (!this.nodes[bankId]) return;
		let bank = this.nodes[bankId];
		bank.splice(mapId, 1);
		// shrink away empty space at the end of an array
		while (!(bank.length-1 in bank) && bank.length > 0) { bank.length--; }
		this.renumberMaps();
		App.notifyChange('slot-del', this);
	}
	
	addEnterReport(node) {
		let r = new TransitReport(this, { to:node });
		this.reports.push(r);
		App.notifyChange('report-new', r);
	}
	addExitReport(node) {
		let r = new TransitReport(this, { from:node });
		this.reports.push(r);
		App.notifyChange('report-new', r);
	}
	addItemReport(node) {
		let r = new ItemReport(this, { loc:node });
		this.reports.push(r);
		App.notifyChange('report-new', r);
	}
	addBattleReport(node) {
		let r = new BattleReport(this, { loc:node });
		this.reports.push(r);
		App.notifyChange('report-new', r);
	}
	deleteReport(report) {
		let i = this.reports.indexOf(report);
		if (i === -1) return;
		this.reports.splice(i, 1);
		App.notifyChange('report-del', this);
	}
	
	renumberMaps() {
		for (let bank = 1; bank < this.nodes.length; bank++) {
			if (!this.nodes[bank]) continue;
			for (let map = 0; map < this.nodes[bank].length; map++) {
				if (!this.nodes[bank][map]) continue;
				this.nodes[bank][map].bank = bank;
				this.nodes[bank][map].id = map;
			}
		}
		App.notifyChange('map-renumber', this);
	}
	
}

/** Represents a map in the game. This represents data about a location id given by the API. */
class MapNode {
	constructor(region, opts={}) {
		this.__region__ = region;
		
		this.id = opts.id || opts.map || 0;
		this.bank = opts.bank || 0;
		this.name = opts.name || opts.areaName || '';
		this.type = opts.type || opts.mapType || null;
		
		this.areaId = opts.areaId || 0;
		this.areaName = opts.areaName || '';
		this.width = Number.parseInt(opts.width || opts.w || 0, 10);
		this.height = Number.parseInt(opts.height || opts.h || 0, 10);
		
		// Bot information
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) opts.areas.forEach(a=>this.addArea(a));
		
		// Stored game map information
		this.gamedata = opts.gamedata || opts.gameInfo || {};
	}
	/** @prop{array} - Properties to enumerate when listing properties in the maptool. */
	static get PROPS() { return ['locId', 'name', 'areaId', 'areaName', 'type', 'width/height']; }
	
	get locId() { return `${this.bank}.${this.id}`; }
	// alias mapType => type
	get mapType() { return this.type; }
	set mapType(t) { this.type = t; }
	
	get gameInfo() { return this.gamedata; }
	set gameInfo(val){ this.gamedata = val; }
	
	toString() { return this.name; }
	is(attr) {
		if (/^(prep|in|on)$/i.test(attr)) attr = 'preposition';
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (this.__region__.types[this.type]) return this.__region__.types[this.type].is(attr);
		return this.__region__.is(attr);
	}
	
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
			attrs: Object.assign({}, this.attrs),
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
		App.notifyChange('add-area', this);
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
	constructor(region, opts={}) {
		this.__region__ = region;
		this.name = opts.type || opts.name;
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) opts.areas.forEach(a=>this.addArea(a));
	}
	/** @prop{array} - Properties to enumerate when listing properties in the maptool. */
	static get PROPS() { return ['locId', 'name']; }
	
	get locId() { return `[${this.name}]`; }
	
	get type() { return this.name }
	set type(val) { this.name = val; }
	
	toString() { return this.name; }
	is(attr) {
		if (/^(prep|in|on)$/i.test(attr)) attr = 'preposition';
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (this.name !== 'default') this.__region__.is(attr);
		return undefined;
	}
	
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
			attrs: Object.assign({}, this.attrs),
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
		this.__parent__ = parent;
		this.__region__ = parent.region;
		
		/** Top-right corner */
		this.ax = Number.parseInt(opts.ax,10) || Number.parseInt(opts.x,10) || 0;
		this.ay = Number.parseInt(opts.ay,10) || Number.parseInt(opts.y,10) || 0;
		/** Bottom-left corner */
		this.bx = Number.parseInt(opts.bx,10) || Number.parseInt(opts.x+opts.w,10) || this.ax;
		this.by = Number.parseInt(opts.by,10) || Number.parseInt(opts.y+opts.h,10) || this.ay;
		
		/** Effective detection radius */
		this.rad = Number.parseInt(opts.rad,10);
		if (typeof this.rad !== 'number' || !Number.isFinite(this.rad))
			this.rad = (this.ax==this.bx && this.ay==this.by)?5:0;
		
		this.name = opts.name || '';
		this.attrs = opts.attrs || {};
	}
	/** @prop{array} - Properties to enumerate when listing properties in the maptool. */
	static get PROPS() { return ['name', 'ax/ay', 'bx/by', 'rad']; }
	
	get locId() {
		// get from parent, and get the index as the area id
		const p = this.__parent__.locId;
		const a = this.__parent__.areas.indexOf(this);
		return `${p}:${a}`;
	}
	get parent() { return this.__parent__; }
	
	toString() { return this.name; }
	is(attr) {
		if (/^(prep|in|on)$/i.test(attr)) attr = 'preposition';
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (this.__parent__) return this.__parent__.is(attr);
		return this.__region__.is(attr);
	}
	
	serialize() {
		return {
			ax: this.ax, ay: this.ay,
			bx: this.bx, by: this.by,
			rad: this.rad,
			name: this.name,
			attrs: Object.assign({}, this.attrs),
		};
	}
}

/**
 * Reports are overrides of the bot's normal text given a specific location and event. This class
 * is the superclass for all reports.
 */
class Report {
	constructor(region, type, opts={}) {
		this.__region__ = region;
		this.type = type || opts.type;
		this.id = opts.id || TransitReport.generateId();
		this.text = opts.text;
		/** @param{number} timeout - Timeout before this rule should be used again. Put very high for only once. */
		this.timeout = opts.timeout || 10*60*1000;
	}
	
	get flavorOverride() {
		if (this.text.startsWith('!')) return this.text;
		return undefined;
	}
	
	static generateId() {
		return Math.floor(Math.random() * 0xFFFFFFFF).toString(16);
	}
	
	serialize() {
		let data = {
			type: this.type,
			id: this.id,
			text: this.text,
			timeout: this.timeout,
		};
		return data;
	}
}

/**
 * TransitReports are reports which the bot will send out when moving from one distinct area (map, type, area)
 * to another. The from and to indicate a direction, and the from and to can indicate any of the above.
 */
class TransitReport extends Report {
	constructor(region, opts={}) {
		super(region, 'transit', opts);
		this.from = opts.from;
		this.to = opts.to;
	}
	
	serialize() {
		let data = super.serialize();
		if (this.from) data.from = this.from.locId;
		if (this.to) data.to = this.to.locId;
		return data;
	}
	
	static filter({ from, to }) {
		return (r)=>{
			if (r.type !== 'transit') return false;
			return (!r.from || r.from===from) && (!r.to || r.to===to);
		};
	}
}


/**
 * ItemReports are reports which the bot will send out when picking up an item, optionally checking
 * for a distinct area.
 */
class ItemReport extends Report {
	constructor(region, opts={}) {
		super(region, 'item', opts);
		this.loc = opts.loc;
		this.itemid = opts.itemid;
	}
	
	serialize() {
		let data = Object.assign(super.serialize(), {
			itemid: this.itemid,
		});
		if (this.loc) data.loc = this.loc.locId;
		return data;
	}
	
	static filter({ loc, itemid }) {
		return (r)=>{
			if (r.type !== 'item') return false;
			if (loc && r.loc && r.loc !== loc) return false;
			if (itemid && r.itemid && r.itemid !== itemid) return false;
			return true;
		};
	}
}

/**
 * BattleReports are reports which the bot will send out when we fight someone in the area,
 * optionally checking for a trainer class and id. These can be used to add more flair to a
 * fight in a location, or add text specifically for when we win a battle.
 */
class BattleReport extends Report {
	constructor(region, opts={}) {
		super(region, 'battle', opts);
		this.loc = opts.loc;
		this.classid = opts.classid;
		this.trainerid = opts.trainerid;
		this.wintext = opts.wintext;
	}
	
	serialize() {
		let data = Object.assign(super.serialize(), {
			wintext: this.wintext,
			classid: this.classid,
			trainerid: this.trainerid,
		});
		if (this.loc) data.loc = this.loc.locId;
		return data;
	}
	
	static filter({ loc, classid, trainerid }) {
		return (r)=>{
			if (r.type !== 'battle') return false;
			if (loc && r.loc && r.loc !== loc) return false;
			if (classid && trainerid && r.classid && r.trainerid) {
				return r.classid === classid && r.trainerid === trainerid;
			}
			return true;
		};
	}
}


/** Default Map Types */
function generateDefaultMapTypes(region) {
	const TYPES = {};
	const add = (t)=> TYPES[t.type] = t;
	
	add(new MapType(region, { type:'default', 	attrs:{ the:"", preposition:"in" } }));
	add(new MapType(region, { type:'town',   	attrs:{ town:true, the:"", preposition:"in" } }));
	add(new MapType(region, { type:'route',  	attrs:{ route:true, the:"", preposition:"on" } }));
	add(new MapType(region, { type:'indoor',	attrs:{ indoors:true, the:"", preposition:"in" } }));
	add(new MapType(region, { type:'cave',		attrs:{ indoors:true, dungeon:true, the:"", preposition:"in" } }));
	add(new MapType(region, { type:'gatehouse',	attrs:{ indoors:true, town:true, the:"", preposition:"on" } }));
	add(new MapType(region, { type:'dungeon',	attrs:{ indoors:true, dungeon:true, the:"", preposition:"in" } }));
	add(new MapType(region, { type:'center',	attrs:{ indoors:true, healing:'pokecenter', checkpoint:true, the:"the", preposition:"in" },
		areas: [
			{ name: "pc", x:2, y:2, attrs:{ pc:true } },
		],
	}));
	add(new MapType(region, { type:'center2',	attrs:{ indoors:true, the:"the", preposition:"in" },
		areas: [
			{ name: "pc", x:2, y:2, attrs:{ pc:true } },
		],
	}));
	add(new MapType(region, { type:'mart',		attrs:{ indoors:true, shopping:true, the:"the", preposition:"in" },
		areas: [
			{ name: "shopping", x:2, y:2, attrs:{ shopping:true } },
		],
 	}));
	add(new MapType(region, { type:'gym',		attrs:{ indoors:true, gym:true, the:"the", preposition:"in" } }));
	add(new MapType(region, { type:'safari',	attrs:{ safari:true, the:"the", preposition:"in" } }));
	return TYPES;
}

/** Attributes for a given map, area, or type. */
const ATTRS = {
	// English language flags
	the: {
		tooltip: `If the location name should use an article when printing the name.\nTrue=definite "the" | string=supplied article`,
		values: ['', 'the'],
		allowOther: true,
	},
	preposition: {
		tooltip: `The preposition to use before this map name. Usually 'on' or 'in' (or rarely 'at').`,
		values: ['in', 'on'],
		allowOther: true,
	},
	
	// Reporting flags
	inconsequential: {
		tooltip: `If the location is not worthy of noting. A location change will not be reported when this room is arrived to or left from.`,
	},
	
	// Location type flags
	indoors: {
		tooltip: `If the location is inside (cannot fly)`,
	},
	town: {
		tooltip: `If the location is in a town (not the wild)`,
	},
	route: {
		tooltip: `If the location is a "Route" between towns.`,
	},
	dungeon: {
		tooltip: `If the location is a dungeon or cave.`,
	},
	water: {
		tooltip: `If the location is surf-required water.`,
	},
	gym: {
		tooltip: `If the location is a gym (badge/TM getting, attempt counting).`,
	},
	e4: {
		tooltip: `If the location is part of the E4 (Run counting). If the E4 are linear, use e1-3 to mark them in order.`,
		values: [false,'lobby','e1','e2','e3','e4','champ','hallOfFame'],
	},
	safari: {
		tooltip: `If this location is part of a Safari Zone (catches in safari ball)`,
	},
	entralink: {
		tooltip: `If this location is an entralink map (special reporting)`,
	},
	
	// Amenities which can affect reporting
	ledge: {
		tooltip: `If this area marks a ledge state. The bot will test if the player moved from 'ledge' to 'jump'.`,
		values: [false,'approach','ledge','jump','clear','giveup'],
		areasOnly: true,
		// Route 22 ledge: The area past the Rival fight is marked 'approach'.
		//  The area along the ledge is marked 'ledge'.
		//  The area below the ledge is marked 'jump'. The bot tests if the player moved from 'ledge' to 'jump'.
		//  The area below the door is marked 'clear'. The exit out of route 22 is marked 'giveup'.
	},
	pokewalk: {
		tooltip: `If this location allows Pokemon to walk inside it.`,
		values: [false,'no-large','yes'],
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
	teleport: {
		tooltip: `If the location is a teleport kiosk location (used often in ROM Hacks in place of increasing the number of fly spots). (Use only for Areas marking the spot)`,
		areasOnly: true,
	},
	healing: {
		tooltip: `If the location offers a type of healing.`,
		values: [false,'pokecenter','doctor','nurse','house','partner'],
	},
	shopping: {
		tooltip: `If the location offers vendors. (Use only for Areas marking the spot)`,
		areasOnly: true,
	},
	vending: {
		tooltip: `If the location offers vending machines. (Use only for Areas marking the vending machine locations)`,
		areasOnly: true,
	},
	pc: {
		tooltip: `If the location is a PC. (Use only for Areas marking the PC)`,
		areasOnly: true,
	},
	trainertype: {
		tooltip: `The type of trainer at this location. (Use only for Areas marking trainers)`,
		values: [false,'rival','leader','e4','champ'],
		areasOnly: true,
	},
	leader: {
		tooltip: `The name of the gym leader/trainer in this location. (Use only for Areas marking the leader)`,
		areasOnly: true,
		stringValue: true,
	},
	legendary: {
		tooltip: `The name of the legendary pokemon in this location. (Use only for Areas marking the pokemon)`,
		areasOnly: true,
		stringValue: true,
	},
};

module.exports = {
	MapRegion,
	MapNode, MapArea, MapType,
	Report, TransitReport, ItemReport, BattleReport,
	generateDefaultMapTypes, ATTRS,
};
