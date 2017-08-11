// map.js
// The base class for Map Graphs

const inspect = require('util').inspect;

class Region {
	constructor({ name, mapidFn }, nodes=[]) {
		this.name = name;
		this.normalizeMapId = mapidFn;
		
		this.nodes = {};
		this.nodesByName = {};
		this.nodesByParent = {};
		this.topNode = new Node({ name:"Mystery Zone", region:this, attrs:{
			// Default properties of the whole region and any nodes under it
			"the": false,		//If the location name should use an article [true=definite|string=other article]
			"indoors": false,	//If the location is inside (cannot fly)
			"inTown": false,	//If the location is in a town (not the wild)
			"healing": false,	//If the location offers healing [false|pokecenter|doctor|nurse|house|other field healing]
			"shopping": false,	//If the location offers buying (marts, vendors)
			"gym": false,		//If the location is a gym (badge/TM getting, attempt counting)
			"e4": false,		//If the location is part of the E4 [false|lobby|e4|champion|hallOfFame] (run counting)
			"dungeon": false,	//If the location is a cave or dungeon
			"legendary": false, //If the location is home to a legendary pokemon, name of it
			"entralink": false,
			
			"noteworthy":false,	//If the location is worthy of noting upon arrival
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
	
	addNode(...nodes) {
		this.topNode.addChild(...nodes);
	}
	
	__addNode(n) {
		n.region = this;
		n.mapids.forEach((mapid)=>{
			let id = this.normalizeMapId(mapid);
			if (this.nodes[id]) throw new ReferenceError(`Node ${n} is a duplicate id of ${inspect(id)}! (${this.nodes[id]})`);
			this.nodes[id] = n;
			// if (!this.nodes[id]) this.nodes[id] = [];
			// this.nodes[id].push(n);
		});
		if (n.name) {
			this.nodesByName[n.name] = n;
		}
	}
	
	/** Finalize the node graph by connecting things that are simply references at the moment. */
	resolve() {
		// console.log(this.nodesByName);
		this.topNode.__finalize1(12, this);
		this.topNode.__finalize2(12, this);
	}
	
	find(mapid) {
		let id = this.normalizeMapId(mapid);
		let n = this.nodes[id];
		if (!n) return this.topNode;
		return n;
	}
	findParent(parent) {
		// TODO
	}
	
	[inspect.custom](depth, options) {
		if (depth < 1) return `Region (${this.name})`;
		return this;
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
		
		// These functions act as announcements
		this._enter = null;
		this._exit  = null;
		
		this._pendingConnections = [];
		this._pendingReverseConns = [];
		
		Object.defineProperty(this, '_typename', { writable:true, value:"Generic" });
		
		// if (this.region) this.region.addNode(this);
	}
	
	get onEnter() { return this._enter || ()=>{}; }
	get onLeave() { return this._exit  || ()=>{}; }
	
	set announce(val){
		if (!val) return; //Ignore
		if (typeof val === 'function') {
			this._enter = val;
		}
		if (typeof val === 'string') {
			this._enter = ()=>val;
		}
		if (typeof val !== 'object') {
			this._enter = val.enter || val.onEnter || val.in;
			this._exit  = val.leave || val.onLeave || val.exit || val.onExit || val.out;
		}
	}
	
	toString() {
		return `${this.name} (${inspect(this.mapids)}`;
	}
	
	/** Finalize this node and its children. */
	__finalize1(depth, region) {
		if (depth < 0) throw new Error('Map resolution goes too deep! Possible graph loop!');
		// Resolve Map IDs
		this.mapids = this.mapids.map( region.normalizeMapId );
		region.__addNode(this);
		
		// Process children
		for (let child of this.children) {
			child.__finalize1(depth-1, region);
		}
	}
	__finalize2(depth, region) {
		if (depth < 0) throw new Error('Map resolution goes too deep! Possible graph loop!');
		
		// Resolve Pending connections
		for (let conn of this._pendingConnections) {
			if (typeof conn === "number") conn = `Route ${conn}`;
			let map = region.nodesByName[conn];
			if (!map) map = region.nodes[conn];
			if (map) {
				this.connections.push(map);
			} else {
				throw new ReferenceError(`Bad connection name "${conn}" in map node "${this.name}" (${this.mapids})`);
			}
		}
		delete this._pendingConnections;
		
		for (let conn of this._pendingReverseConns) {
			if (typeof conn === "number") conn = `Route ${conn}`;
			let map = region.nodesByName[conn];
			if (!map) map = region.nodes[conn];
			if (map) {
				map.connections.push(this);
			} else {
				throw new ReferenceError(`Bad connection name "${conn}" in map node "${this.name}" (${this.mapids})`);
			}
		}
		delete this._pendingReverseConns;
		
		// Process children
		for (let child of this.children) {
			child.__finalize2(depth-1, region);
		}
	}
	
	addChild(...nodes) {
		for (let node of nodes) {
			if (!(node instanceof Node)) throw new TypeError(`Can only add Nodes to children! ${node} is not a node!`);
			node.parent = this;
			this.children.push(node);
		}
	}
	
	addConnection(...names) {
		this._pendingConnections.push(...names);
	}
	addReverseConnection(...names) {
		this._pendingReverseConns.push(...names);
	}
	
	getName() {
		if (this.name) return this.name;
		if (this.parent) return this.parent.getName();
		return "...someplace I don't know about...";
	}
	
	/** Test if this node (or its parents) has the given attribute. */
	is(attr) {
		if (attr === 'announce') return !!this._enter || !!this._exit ;
		if (this.attrs[attr] !== undefined) return this.attrs[attr];
		if (attr in {noteworthy:1, onto:1, the:1}) return false;
		if (this.parent) return this.parent.is(attr);
		return undefined;
	}
	
	/** Test if this mode's coordinate attribute is within a certain range of the given value. */
	within(attr, loc, dist=6) {
		let a = this.locOf[attr];
		console.log(`within(${attr}, ${loc}, ${dist}) a=${a}=>${typeof a}`);
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
				console.log(`_wi (ax=${ax},ay=${ay})(bx=${bx},by=${by})dist=${dist}`);
				console.log(`(ax - dist < bx && bx < ax + dist) = (${ax - dist < bx} && ${bx < ax + dist})`);
				console.log(`(ay - dist < by && by < ay + dist) = (${ay - dist < by} && ${by < ay + dist})`);
				if (ax - dist < bx && bx < ax + dist) {
					if (ay - dist < by && by < ay + dist) {
						return true;
					}
				}
				return false;
			} catch (e) {
				console.log('Error calculating within!', e);
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
	
	/** Gets the number of steps of separation between two nodes.
	 * First it tries to find the relation via one step of connections,
	 * Then it finds them via a parent-child common ancestor. */
	getStepsTo(other) {
		if (!(other instanceof Node)) throw new TypeError('Other must be a node!');
		if (other.region !== this.region) return 10000;
		if (other === this) return 0; // No steps if same node
		
		// First find via connnections, moving from other node to this node
		/* // This way lies infinite loops
		let nextNodes = []; // processing queue, bredth first search
		let processed = [];
		nextNodes.push(...other.connections.map(x=>{ return {n:x, s:1}; }));
		while (nextNodes.length) {
			let p = nextNodes.shift();
			processed.push(p);
			if (p.n === this) return p.s;
			nextNodes.push(...p.n.connections
				.filter(x=>!processed.includes(x))
				.map(x=>{ return {n:x, s:p.n+1}; })
			);
		}
		processed.length = 0;
		*/
		for (let n of other.connections) {
			if (n === this) return 1;
		}
		
		// If no connections, perform lowest common ancestor search
		let an = this, bn = other;
		let as = 0, bs = 0;
		while (bn.parent) {
			while(an.parent) {
				if (an === bn) return as + bs;
				an = an.parent;
				// If this node represents a map, add some distance on
				if (an.mapids.length) as++;
				// If this node represents the top node, add a LOT of distance
				if (an === this.region.topNode) as += 100;
			}
			an = this; as = 0;
			bn = bn.parent;
			// If this node represents a map, add some distance on
			if (bn.mapids.length) bs++;
			// If this node represents the top node, add a LOT of distance
			if (bn === this.region.topNode) bs += 100;
		}
		return 10000; // Should never reach here
	}
	
	getArea() {
		let p = this;
		while (p && p.parent && p.parent !== this.region.topNode) {
			if (p.attrs['noteworthy']) break;
			p = p.parent;
		}
		return p;
	}
	
	// Allow iteration over children in for...of loops (NOT for...in loops, note)
	[Symbol.iterator]() {
		return this.children[Symbol.iterator]();
	}
	
	[inspect.custom](depth, options) {
		if (depth < 0) return `Node [${this.mapids[0]||'--'}](${this.name||` [${this._typename}] `})`;
		if (depth < 1) {
			const newopts = Object.assign({}, options, { depth: 0 });
			const inner = inspect(Object.assign({}, this, {
				children: this.children.length,
				connections: this.connections.length,
			}), newopts);
			return "Node "+inner;
		}
		if (depth < 2) {
			const newopts = Object.assign({}, options, { depth: -1 });
			return inspect(Object.assign({}, this, {
				parent: `[[${inspect(this.parent, newopts)}]]`,
			}), options).replace(`'[[`,"").replace(`]]'`,"");
		}
		return this;
	}
}
Node.prototype.has = Node.prototype.is; //Alias
Node.prototype.can = Node.prototype.is; //Alias
Node.prototype.get = Node.prototype.is; //Alias


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
	Area : function(name, mapids, { the=true, attrs={}, locOf={}, buildings=[], zones=[], connections=[], announce, legendary, noteworthy=false }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		if (legendary) locOf.legendary = legendary.loc;
		let me = new Node({ name, mapids, attrs:Object.assign({
			"onto": "into",
			noteworthy, legendary, the,
		}, attrs), locOf });
		me.announce = announce;
		me.addChild(...zones);
		me.addChild(...buildings);
		me.addConnection(...connections);
		me._typename = "Area";
		return me;
	},
	Town : function(name, mapids, { the=false, attrs={}, locOf={}, buildings=[], exits=[], connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		let me = new Node({ name, mapids, attrs:Object.assign({
			"inTown": true,
			"noteworthy": true,
			the,
		}, attrs), locOf });
		me.announce = announce;
		me.addChild(...buildings);
		me.addConnection(...exits);
		me.addConnection(...connections);
		me._typename = "Town/City";
		return me;
	},
	/** Multistory/Room Building */
	Building : function({ name, the=true, attrs={}, locOf={}, floors=[], connections=[], announce, }){
		let me = new Node({ name, attrs:Object.assign({
			"indoors": true,
			the,
		}, attrs), locOf });
		me.announce = announce;
		me.addChild(...floors);
		me.addConnection(...connections);
		me._typename = "Building";
		return me;
	},
	Floor : function(mapids, { name, the=false, attrs={}, locOf={}, connections=[], announce, legendary, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		if (legendary) locOf.legendary = legendary.loc;
		let me = new Node({ name, mapids, attrs:Object.assign({
			legendary, the,
		}, attrs), locOf });
		me.announce = announce;
		me.addConnection(...connections);
		me._typename = "Floor";
		return me;
	},
	/** Single Room Building */
	House : function(mapids, { name, the=false, attrs={}, locOf={}, connections=[], announce, legendary, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		if (legendary) locOf.legendary = legendary.loc;
		let me = new Node({ name, mapids, attrs:Object.assign({
			"indoors": true,
			legendary, the,
		}, attrs), locOf });
		me.announce = announce;
		me.addConnection(...connections);
		me._typename = "House";
		return me;
	},
	/** Common Pokemart */
	Mart : function(mapids, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		let me = new Node({ mapids, attrs:Object.assign({
			"indoors": true,
			"shopping": true,
			the,
		}, attrs), locOf });
		me.announce = announce;
		me.addConnection(...connections);
		me._typename = "Mart";
		return me;
	},
	/** Common Pokecenter */
	Center : function(mapids, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		let me = new Node({ name:"Pokémon Center", mapids, attrs:Object.assign({
			"indoors": true,
			"healing": "pokecenter",
			the,
		}, attrs), locOf:Object.assign({
			"pc": [],
		}, locOf) });
		me.announce = announce;
		me.addConnection(...connections);
		me._typename = "Center";
		return me;
	},
	/** Common Pokecenter */
	Gym : function(mapids, { name, leader, badge, the=true, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		let me = new Node({ name, mapids, attrs:Object.assign({
			"indoors": true,
			"gym": true,
			"noteworthy": true,
			leader, badge, the,
		}, attrs), locOf });
		me.announce = announce;
		me.addConnection(...connections);
		me._typename = "Gym";
		return me;
	},
	
	/** */
	Gatehouse : function(mapids, from, to, { name, the=true, attrs={}, locOf={}, connections=[], announce, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		if (!name) name = `${from} Gatehouse`;
		if (typeof to === "number") to = `Route ${to}`;
		let me = new Node({ name, mapids, attrs:Object.assign({
			the,
		}, attrs), locOf });
		me.announce = announce;
		me.addConnection(from, to);
		me.addReverseConnection(from, to);
		me.addConnection(...connections);
		me._typename = "Gatehouse";
		return me;
	},
	/** Outdoor routes */
	Route : function(name, mapids, { the=false, attrs={}, locOf={}, buildings=[], exits=[], connections=[], announce, legendary, }={}){
		if (!Array.isArray(mapids)) mapids = [mapids];
		if (typeof name === "number") name = `Route ${name}`;
		if (legendary) locOf.legendary = legendary.loc;
		let me = new Node({ name, mapids, attrs:Object.assign({
			"noteworthy": true,
			legendary, the,
		}, attrs), locOf });
		me.announce = announce;
		me.addChild(...buildings);
		me.addConnection(...exits);
		me.addConnection(...connections);
		me._typename = "Route";
		return me;
	},
	/** Multilevel Dungeons */
	Dungeon : function(name, { the=false, attrs={}, locOf={}, floors=[], connections=[], announce, }={}){
		let me = new Node({ name, attrs:Object.assign({
			"indoors": true,
			"dungeon": true,
			"noteworthy": true,
			"onto": "into",
			the,
		}, attrs), locOf });
		me.announce = announce;
		me.addChild(...floors);
		me.addConnection(...connections);
		me._typename = "Dungeon";
		return me;
	},
	
	Cutscene : function(mapids, { name, the=false, attrs={}, connections=[], announce, noteworthy=true }={}) {
		if (!Array.isArray(mapids)) mapids = [mapids];
		let me = new Node({ name, mapids, attrs:Object.assign({
			noteworthy, the,
		}, attrs) });
		me.announce = announce;
		me.addConnection(...connections);
		me._typename = "Cutscene";
		return me;
	},
};
// Aliases
module.exports.City = module.exports.Town;
// module.exports.Area = module.exports.Town;
module.exports.PokeMart = module.exports.Mart;
module.exports.PokeCenter = module.exports.Center;
module.exports.Cave = module.exports.Dungeon;

