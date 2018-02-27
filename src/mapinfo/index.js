// mapinfo/index.js
// Base classes for MapNode graphs

const LOGGER = getLogger('MapInfo');

const inspect = require('util').inspect;

class Region {
	constructor() {
		this.nodes = {};
	}
	
	/**
	 * Finds a node given a location.
	 * @param {SortedLocation} loc - The location to search with
	 */
	find(loc) {
		//TODO
	}
}

class MapNode {
	constructor(region, opts={}) {
		if (region === undefined) throw new ReferenceError('MapNodes must have a parent region!');
		if (opts.mapid === undefined) throw new TypeError('MapNodes must have a mapid!');
		if (region.nodes[opts.mapid]) throw new ReferenceError('MapNodes must have a unique mapid!');
		
		this.region = region;
		this.mapid = opts.mapid;
		
		this.attrs = opts.attrs;
		this.locOf = opts.locOf;
	}
	
	/** Test if this node (or its parents) has the given attribute. */
	is(attr) {
		// if (attr === 'announce') return !!this._enter || !!this._exit ;
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		// if (attr in {noteworthy:1, onto:1, the:1}) return false;
		// if (this.parent) return this.parent.is(attr);
		return undefined;
	}
	
	/** Test if this mode's coordinate attribute is within a certain range of the given value. */
	within(attr, loc, dist=6) {
		let a = this.locOf[attr];
		LOGGER.debug(`within(${attr}, ${loc}, ${dist}) a=${a}=>${typeof a}`);
		if (!a) return false;
		if (typeof a === 'number') {
			return this.mapids.includes(a);
		}
		if (Array.isArray(a)) {
			return a.reduce((acc, val)=>{
				return acc || _wi(val, loc);
			}, false);
		}
		if (typeof a === 'string') {
			if (a.indexOf(',') === -1) return this.mapids.includes(a);
			return _wi(a, loc);
		}
		return false;
		
		// a = target point, b = curr loc
		function _wi(a, b) {
			try {
				let [ ax, ay ] = a.split(',');
				let [ bx, by ] = b.split(',');
				ax = Number(ax); ay = Number(ay);
				bx = Number(bx); by = Number(by);
				LOGGER.trace(`_wi (ax=${ax},ay=${ay})(bx=${bx},by=${by})dist=${dist}`);
				LOGGER.trace(`(ax - dist < bx && bx < ax + dist) = (${ax - dist < bx} && ${bx < ax + dist})`);
				LOGGER.trace(`(ay - dist < by && by < ay + dist) = (${ay - dist < by} && ${by < ay + dist})`);
				if (ax - dist < bx && bx < ax + dist) {
					if (ay - dist < by && by < ay + dist) {
						return true;
					}
				}
				return false;
			} catch (e) {
				LOGGER.error('Error calculating within!', e);
			}
		}
	}
	
	locationOf(item) {
		if (this.locOf[item]) {
			if (!Array.isArray(this.locOf[item])) return [this.locOf[item]];
			return this.locOf[item];
		}
		return [];
	}
	
	[inspect.custom](depth, options) {
		// if (depth < 0) return `Node [${this.mapids[0]||'--'}](${this.name||` [${this._typename}] `})`;
		// if (depth < 1) {
		// 	const newopts = Object.assign({}, options, { depth: 0 });
		// 	const inner = inspect(Object.assign({}, this, {
		// 		children: this.children.length,
		// 		connections: this.connections.length,
		// 	}), newopts);
		// 	return "Node "+inner;
		// }
		// if (depth < 2) {
		// 	const newopts = Object.assign({}, options, { depth: -1 });
		// 	return inspect(Object.assign({}, this, {
		// 		parent: `[[${inspect(this.parent, newopts)}]]`,
		// 	}), options).replace(`'[[`,"").replace(`]]'`,"");
		// }
		// return this;
	}
}
MapNode.prototype.has = MapNode.prototype.is; //Alias
MapNode.prototype.can = MapNode.prototype.is; //Alias
MapNode.prototype.get = MapNode.prototype.is; //Alias