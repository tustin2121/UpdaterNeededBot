// mapnode.js
// The classes that represent a map

const { SortedLocation } = require('./pokedata');

/** Represents everything in a region, including all the map nodes. */
class MapRegion {
	constructor(data) {
		this.name = '';
		this.types = {};
		this.nodes = [];
		this.reports = [];
		
		if (typeof data !== 'object') throw new Error('Invalid data for MapRegion!');
		
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
			report.from = this.resolveLocId(report.from);
			report.to = this.resolveLocId(report.to);
			if (!report.from && !report.to) continue; //skip reports that go neither from nor to a specific place
			this.reports.push(new TransitReport(this, report));
		}
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
		if (arg instanceof SortedLocation) {
			arg = {
				bank: arg.map_bank,
				id: arg.map_id,
				x: arg.x, y: arg.y,
			};
			// fall through to next case
		}
		if (typeof arg === 'object') {
			let { bank, id, area, x, y } = arg;
			bank = this.nodes[bank];
			if (area) return bank[id].areas[area];
			if (typeof x === 'number' && typeof y == 'number') {
				let map = bank[id];
				for (let area of map.areas) {
					if (area.ax >= x && area.bx <= x && area.ay >= y && area.by <= y) return area;
				}
			}
			return bank[id];
		}
		return null;
	}
	
	findReports(from, to) {
		return this.reports.filter(r=> (!r.from || r.from===from) && (!r.to || r.to===to) );
	}
	
	is(attr) { return this.types['default'].is(attr); }
}

/** Represents a map in the game. This represents data about a location id given by the API. */
class MapNode {
	constructor(region, opts={}) {
		this.__region__ = region;
		
		this.id = opts.id || opts.map || 0;
		this.bank = opts.bank || 0;
		this.name = opts.name || opts.areaName || '';
		this.type = opts.type || opts.mapType || null;
		this.__type__ = region.types[this.type];
		
		this.areaId = opts.areaId || 0;
		this.areaName = opts.areaName || '';
		this.width = opts.width || opts.w || 0;
		this.height = opts.height || opts.h || 0;
		
		// Bot information
		this.attrs = opts.attrs || {};
		this.areas = [];
		if (Array.isArray(opts.areas)) {
			for (let a = 0; a < opts.areas.length; a++) {
				let aopts = opts.areas[a] || this.__type__.areas[a];
				this.areas[a] = new MapArea(this, aopts);
			}
		}
	}
	
	get locId() { return `${this.bank}.${this.id}`; }
	// alias mapType => type
	get mapType() { return this.type; }
	set mapType(t) { this.type = t; }
	
	toString() { return this.name; }
	is(attr) {
		if (/^(prep|in|on)$/i.test(attr)) attr = 'preposition';
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (this.__type__) return this.__type__.is(attr);
		return this.__region__.is(attr);
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
		if (Array.isArray(opts.areas)) {
			for (let a = 0; a < opts.areas.length; a++) {
				this.areas[a] = new MapArea(this, opts.areas[a]);
			}
		}
	}
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
	get locId() {
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
}

/**
 * TransitReports are reports which the bot will send out when moving from one distinct area (map, type, area)
 * to another. The from and to indicate a direction, and the from and to can indicate any of the above.
 */
class TransitReport {
	constructor(region, opts={}) {
		this.__region__ = region;
		
		this.id = opts.id;
		this.from = opts.from;
		this.to = opts.to;
		this.text = opts.text;
		/** @param{number} timeout - Timeout before this rule should be used again. Put very high for only once. */
		this.timeout = opts.timeout || 10*60*1000;
	}
	toString(){ return this.text; }
	
	serialize() {
		let data = {
			from: null, to: null,
			text: this.text,
			timeout: this.timeout,
		};
		if (this.from) data.from = this.from.locId;
		if (this.to) data.to = this.to.locId;
		return data;
	}
}

// Set aliases for is()
[MapRegion, MapNode, MapArea, MapType].forEach((clazz)=>{
	clazz.prototype.has = clazz.prototype.is;
	clazz.prototype.can = clazz.prototype.is;
	clazz.prototype.get = clazz.prototype.is;
})

module.exports = {
	MapRegion,
	MapNode, MapArea, MapType, TransitReport,
};
