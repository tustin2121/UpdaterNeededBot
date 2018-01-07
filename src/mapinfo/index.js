// mapinfo/index.js
// Base classes for MapNode graphs

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
	}
}