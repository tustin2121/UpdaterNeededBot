// map.js
// The base class for Map Graphs

class Region {
	constructor({ name, mapid }, nodes=[]) {
		this.name = name;
		this.mapidType = mapid;
		this.normalizeMapId = Region.createMapidHandler(mapid);
		
		this.nodes = {};
		this.nodesByName = {};
		this.topNode = new Node({ name:"Mystery Zone", region:this, attrs:{
			// Default properties of the whole region and any nodes under it
			"indoors": false,	//If the location is inside (cannot fly)
			"inTown": false,	//If the location is in a town (not the wild)
			"healing": false,	//If the location offers healing [false|pokecenter|doctor|nurse|house|other field healing]
			"shopping": false,	//If the location offers buying (marts, vendors)
			"gym": false,		//If the location is a gym (badge/TM getting, attempt counting)
			"e4": false,		//If the location is part of the E4 [false|lobby|e4|champion|hallOfFame] (run counting)
			"dungeon": false,	//If the location is a cave or dungeon
			"legendary": false, //If the location is home to a legendary pokemon, name of it
			
			"noteworthy":false,	//If the location is worthy of noting upon arrival
			"announce":null,	//An announcement about this map, implies noteworthiness.
		},locOf:{
			"vending": false,	//If the location has vending machines (water, lemonade, soda) [false|coord or array of coords]
			"healing": false,	//If the location offers field healing [false|coord or array of coords=doctors or field healing]
			"shopping": false,	//If the location offers buying (marts, vendors)
			"pc": false,		//If the location has a PC [false|coord or array of coords]
			"flySpot": false,	//If the location has a spot to fly to
			"legendary": false, //If the location is home to a legendary, location of it
			"leader": false, 	//If the location is a gym, location of the gym leader [coord|mapid]
		} });
		
		this.addNode(...nodes);
	}
	
	static createMapidHandler(mapid) {
		switch (mapid) {
			case "gen3": // Uses "Bank.Id" format
				return (id)=>id;
			case "ds":
				return (id)=>{
					// { matrix:int, mapid:int, parentId:int }
					return id.mapid;
				}
		}
	}
	
	addNode(...nodes) {
		for(let n of nodes) {
			n.region = this;
			n.mapids.forEach((mapid)=>{
				let id = Region.createMapidHandler(mapid);
				if (!this.nodes[id]) this.nodes[id] = [];
				this.nodes[id].push(n);
			});
			if (n.name) {
				this.nodesByName[n.name] = n;
			}
		}
	}
	
	/** Finalize the node graph by connecting things that are simply references at the moment. */
	resolve() {
		this.topNode.__finalize(12);
	}
	
	find(mapid) {
		let id = Region.createMapidHandler(mapid);
		let nodes = this.nodes[id];
		if (!nodes) return null;
		for (let i = 0; i < nodes.length; i++) {
			for (let j = 0; j < nodes[i].mapids.length; j++) {
				let thisid = nodes[i].mapids[j];
				if (thisid.mapid !== mapid.mapid) continue;
				if (thisid.parentId !== mapid.parentId) continue;
				if (thisid.matrix !== mapid.matrix) continue;
				return nodes[i];
			}
		}
	}
}

class Node {
	constructor({ name, mapids=[], attrs={}, locOf={}, region, parent }) {
		if (!Array.isArray(mapids)) throw new TypeError('mapids must be an array!');
		if (region && !(region instanceof Region)) throw new TypeError('region must be a Region or undefined!');
		if (parent && !(parent instanceof Node)) throw new TypeError('parent must be a Node or undefined!');
		
		this.name = name;
		this.region = region;
		this.mapids = mapids;
		this.attrs = attrs;
		this.locOf = locOf;
		this.parent = parent;
		this.children = [];
		this.connections = [];
		
		this._pendingConnections = [];
		this._pendingReverseConns = [];
		
		
		if (this.region) this.region.addNode(this);
	}
	
	/** Finalize this node and its children. */
	__finalize(depth) {
		if (depth < 0) throw new Error('Map resolution goes too deep! Possible graph loop!');
		
		// Resolve Map IDs
		this.mapids = this.mapids.map( this.region.normalizeMapId );
		
		// Resolve Pending connections
		for (let conn of this._pendingConnections) {
			if (typeof conn === "number") conn = `Route ${conn}`;
			let map = this.region.nodesByName[conn];
			if (!map) map = this.region.nodes[conn];
			if (map) {
				this.connections.push(map);
			} else {
				throw new ReferenceError(`Bad connection name "${conn}" in map node "${this.name}" (${this.mapids})`);
			}
		}
		this._pendingConnections.length = 0;
		
		for (let conn of this._pendingReverseConns) {
			if (typeof conn === "number") conn = `Route ${conn}`;
			let map = this.region.nodesByName[conn];
			if (!map) map = this.region.nodes[conn];
			if (map) {
				map.connections.push(this);
			} else {
				throw new ReferenceError(`Bad connection name "${conn}" in map node "${this.name}" (${this.mapids})`);
			}
		}
		this._pendingReverseConns.length = 0;
		
		// Process children
		for (let child of this.children) {
			child.__finalize(depth-1);
		}
	}
	
	addChild(...nodes) {
		for (let node of nodes) {
			if (!(node instanceof Node)) throw new TypeError('Can only add Nodes to children!');
			node.parent = this;
			if (!node.region) this.region.addNode(node);
			this.children.push(node);
		}
	}
	
	addConnection(...names) {
		this._pendingConnections.push(...names);
	}
	addReverseConnection(...names) {
		this._pendingReverseConns.push(...names);
	}
	
	/** Test if this node (or its parents) has the given attribute. */
	is(attr) {
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (this.parent) return this.parent.is(attr);
		return undefined;
	}
	
	/** Test if this mode's coordinate attribute is within a certain range of the given value. */
	within(attr, loc, dist=6) {
		let a = this.locOf[attr];
		if (!a) return false;
		if (Array.isArray(a)) {
			return a.reduce((acc, val)=>{
				return acc || _wi(val, loc);
			}, false);
		}
		if (typeof a === 'string') {
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
				
				if (ax - dist < bx && bx < ax + dist) {
					if (ay - dist < by && by < ay + dist) {
						return true;
					}
				}
			} catch (e) {
				console.log('Error calculating within!', e);
			} finally {
				return false;
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
	
	getArea() {
		let p = this;
		while (p && p.parent && p.parent !== this.region.topNode) {
			if (p.attr['noteworthy']) break;
			p = p.parent;
		}
		return p;
	}
	
	// Allow iteration over children in for...of loops (NOT for...in loops, note)
	[Symbol.iterator]() {
		return this.children[Symbol.iterator]();
	}
}
Node.prototype.has = Node.prototype.is; //Alias
Node.prototype.can = Node.prototype.is; //Alias


/*
Layout of a Map Town:

module.exports = Town("Example Town", "12.0", {
	buildings: [
		House("12.1"),
		House("12.2", { has:"Move Deleter" }),
		PokeCenter("12.3"),
		Mart("12.4"),
		Gym("12.5", { leader:"Roxanne", badge:"Rock", }),
	],
	exits: [],
})

*/

module.exports = {
	Region: Region,
	Node: Node,
	Area : function(mapids, { name, attrs={}, locOf={}, buildings=[], zones=[], connections=[], announce, noteworthy=false }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ name, mapids, attrs:Object.assign({
			noteworthy, announce,
		}, attrs), locOf });
		me.addChild(...zones);
		me.addChild(...buildings);
		me.addConnection(...connections);
		return me;
	},
	Town : function(name, mapids, { attrs={}, locOf={}, buildings=[], exits=[], connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ name, mapids, attrs:Object.assign({
			"inTown": true,
			"noteworthy": true,
			announce,
		}, attrs), locOf });
		me.addChild(...buildings);
		me.addConnection(...exits);
		me.addConnection(...connections);
		return me;
	},
	/** Multistory/Room Building */
	Building : function({ name, attrs={}, locOf={}, floors=[], connections=[], announce, }){
		let me = new Node({ name, attrs:Object.assign({
			"indoors": true,
			announce,
		}, attrs), locOf });
		me.addChild(...floors);
		me.addConnection(...connections);
		return me;
	},
	Floor : function(mapids, { name, attrs={}, locOf={}, floors=[], connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ name, mapids, attrs:Object.assign({
			announce,
		}, attrs), locOf });
		me.addConnection(...connections);
		return me;
	},
	/** Single Room Building */
	House : function(mapids, { name, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ name, mapids, attrs:Object.assign({
			"indoors": true,
			announce,
		}, attrs), locOf });
		me.addConnection(...connections);
		return me;
	},
	/** Common Pokemart */
	Mart : function(mapids, { attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ mapids, attrs:Object.assign({
			"indoors": true,
			"shopping": true,
			announce,
		}, attrs), locOf });
		me.addConnection(...connections);
		return me;
	},
	/** Common Pokecenter */
	Center : function(mapids, { attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ mapids, attrs:Object.assign({
			"indoors": true,
			"healing": true,
			announce,
		}, attrs), locOf:Object.assign({
			"pc": [],
		}, locOf) });
		me.addConnection(...connections);
		return me;
	},
	/** Common Pokecenter */
	Gym : function(mapids, { name, leader, badge, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ mapids, attrs:Object.assign({
			"indoors": true,
			"gym": true,
			"noteworthy": true,
			leader, badge, announce,
		}, attrs), locOf });
		me.addConnection(...connections);
		return me;
	},
	
	/** */
	Gatehouse : function(mapids, from, to, { name, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		if (!name) name = `${from} Gatehouse`;
		if (typeof to === "number") to = `Route ${to}`;
		let me = new Node({ name, mapids, attrs:Object.assign({
			announce,
		}, attrs), locOf });
		me.addConnection(from, to);
		me.addReverseConnection(from, to);
		me.addConnection(...connections);
		return me;
	},
	/** Outdoor routes */
	Route : function(name, mapids, { attrs={}, locOf={}, buildings=[], exits=[], connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = mapids;
		if (typeof name === "number") name = `Route ${name}`;
		let me = new Node({ name, mapids, attrs:Object.assign({
			"noteworthy": true,
			announce,
		}, attrs), locOf });
		me.addChild(...buildings);
		me.addConnection(...exits);
		me.addConnection(...connections);
		return me;
	},
	/** Multilevel Dungeons */
	Dungeon : function(name, { attrs={}, locOf={}, floors=[], connections=[], announce, }={}){
		let me = new Node({ name, attrs:Object.assign({
			"indoors": true,
			"dungeon": true,
			"noteworthy": true,
			announce,
		}, attrs), locOf });
		me.addChild(...floors);
		me.addConnection(...connections);
		return me;
	},
	
	Cutscene : function(mapids, { name, attrs={}, connections=[], announce, noteworthy=true }={}) {
		if (!Array.isArray(mapids)) mapids = mapids;
		let me = new Node({ name, mapids, attrs:Object.assign({
			noteworthy, announce,
		}, attrs) });
		me.addConnection(...connections);
		return me;
	},
};
// Aliases
module.exports.City = module.exports.Town;
// module.exports.Area = module.exports.Town;
module.exports.PokeMart = module.exports.Mart;
module.exports.PokeCenter = module.exports.Center;
module.exports.Cave = module.exports.Dungeon;

