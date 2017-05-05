// map.js
// The base class for Map Graphs

class Region {
	constructor({ name, mapid }) {
		this.name = name;
		this.mapidType = mapid;
		this.mapid = Region.createMapidHandler(mapid);
		
		this.nodes = {};
		this.nodesByName = {};
		this.topNode = new Node({ name:"Mystery Zone", region:this, attrs:{
			// Default properties of the whole region and any nodes under it
			"indoors": false,	//If the location is inside (cannot fly)
			"inTown": false,	//If the location is in a town (not the wild)
			"healing": false,	//If the location offers healing [false|true=pokecenters|array of coords=doctors or field healing]
			"shopping": false,	//If the location offers buying (marts, vendors)
			"vending": false,	//If the location has vending machines (water, lemonade, soda) [false|array of coords]
			"gym": false,		//If the location is a gym (badge/TM getting, attempt counting)
			"e4": false,		//If the location is part of the E4 [false|lobby|e4|champion|hallOfFame] (run counting)
			"dungeon": false,	//If the location is a cave or dungeon
			"flySpot": false,	//If the location has a spot to fly to
			"pc": false,		//If the location has a PC [false|array of coords]
		} });
	}
	
	static createMapidHandler(mapid) {
		switch (mapid) {
			case "gen3": // Uses "Bank.Id" format
				return (mapid)=>mapid;
			case "ds": // Uses "MatrixId" format, optionally "MatrixId:x,y" for overworld
				return (mapid)=>mapid;
		}
	}
	
	addNode(...nodes) {
		for(let n of nodes) {
			n.region = this;
			n.mapids.forEach((id)=>{
				this.nodes[id] = n;
			});
			if (n.name) {
				this.nodesByName[n.name] = n;
			}
		}
	}
	
	/** Finalize the node graph by connecting things that are simply references at the moment. */
	resolve() {
		__res(this.topNode, 12);
		return;
		
		function __res(node, depth) {
			if (depth < 0) throw new Error('Map resolution goes too deep! Possible graph loop!');
			for (let conn of node.pendingConnections) {
				let map = node.region.nodesByName[conn];
				if (!map) map = node.region.nodes[conn];
				if (map) {
					node.connections.push(map);
				} else {
					throw new ReferenceError(`Bad connection name "${conn}" in map node "${node.name}" (${node.mapids})`);
				}
			}
			node.pendingConnections.length = 0;
			for (let child of node) {
				__res(child, depth-1);
			}
		}
	}
}

class Node {
	constructor({ name, mapids=[], attrs={}, region, parent }) {
		if (!Array.isArray(mapids)) throw new TypeError('mapids must be an array!');
		if (region && !(region instanceof Region)) throw new TypeError('region must be a Region or undefined!');
		if (parent && !(parent instanceof Node)) throw new TypeError('parent must be a Node or undefined!');
		
		this.name = name;
		this.region = region;
		this.mapids = mapids;
		this.attrs = attrs;
		this.parent = parent;
		this.children = [];
		this.connections = [];
		this.pendingConnections = [];
		
		if (this.region) this.region.addNode(this);
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
		this.pendingConnections.push(...names);
	}
	
	/** Test if this node (or its parents) has the given attribute. */
	is(attr) {
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (this.parent) return this.parent.is(attr);
		return undefined;
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
	Town : function(name, mapid, { attrs={}, buildings=[], exits=[], connections=[] }){
		let me = new Node({ name, mapids:[mapid], attrs:Object.assign({
			"inTown": true,
		}, attrs) });
		me.addChild(...buildings);
		me.addConnection(...exits);
		me.addConnection(...connections);
		return me;
	},
	/** Multistory/Room Building */
	Building : function({ name, attrs={}, floors=[], connections=[] }){
		let me = new Node({ name, attrs:Object.assign({
			"indoors": true,
		}, attrs) });
		me.addChild(...floors);
		me.addConnection(...connections);
		return me;
	},
	Floor : function(mapid, { name, attrs={}, floors=[], connections=[] }){
		let me = new Node({ name, mapids:[mapid], attrs:Object.assign({
			
		}, attrs) });
		me.addConnection(...connections);
		return me;
	},
	/** Single Room Building */
	House : function(mapid, { name, attrs={}, connections=[] }){
		let me = new Node({ name, mapids:[mapid], attrs:Object.assign({
			"indoors": true,
		}, attrs) });
		me.addConnection(...connections);
		return me;
	},
	/** Common Pokemart */
	Mart : function(mapid, { attrs={}, connections=[] }){
		let me = new Node({ mapids:[mapid], attrs:Object.assign({
			"indoors": true,
			"shopping": true,
		}, attrs) });
		me.addConnection(...connections);
		return me;
	},
	/** Common Pokecenter */
	Center : function(mapid, { attrs={}, connections=[] }){
		let me = new Node({ mapids:[mapid], attrs:Object.assign({
			"indoors": true,
			"healing": true,
			"pc": ["5,10"], //TODO fill in with the common coordinate(s)
		}, attrs) });
		me.addConnection(...connections);
		return me;
	},
	/** Common Pokecenter */
	Gym : function(mapid, { attrs={}, connections=[] }){
		let me = new Node({ mapids:[mapid], attrs:Object.assign({
			"indoors": true,
			"gym": true,
		}, attrs) });
		me.addConnection(...connections);
		return me;
	},
	
	/** Outdoor routes */
	Route : function(name, mapid, { attrs={}, buildings=[], exits=[], connections=[] }){
		let me = new Node({ name, mapids:[mapid], attrs:Object.assign({
			
		}, attrs) });
		me.addChild(...buildings);
		me.addConnection(...exits);
		me.addConnection(...connections);
		return me;
	},
	/** Multilevel Dungeons */
	Dungeon : function(name, { attrs={}, floors=[], connections=[] }){
		let me = new Node({ name, attrs:Object.assign({
			"indoors": true,
			"dungeon": true,
		}, attrs) });
		me.addChild(...floors);
		me.addConnection(...connections);
		return me;
	},
};
// Aliases
module.exports.City = module.exports.Town;
module.exports.Area = module.exports.Town;
module.exports.PokeMart = module.exports.Mart;
module.exports.PokeCenter = module.exports.Center;
module.exports.Cave = module.exports.Dungeon;

