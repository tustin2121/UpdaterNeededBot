// Johto (GSC)
// Includes Gen 2 Kanto

const fs = require('fs');
const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
} = require("../map.js");
const { Location } = require('../../../data-format');

// Defaults for this particular region

const Center = function(mapids, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
	if (!Array.isArray(mapids)) mapids = [mapids];
	let me = new Node({ name:"Pokémon Center", mapids, attrs:Object.assign({
		"indoors": true,
		"healing": "pokecenter",
		announce, the, noteworthy: true,
	}, attrs), locOf:Object.assign({
		"pc": ["9,2"],
	}, locOf) });
	me.addConnection(...connections);
	// me.addConnection("Union Room");
	me._typename = "Center";
	me.getName = function() {
		if (this.parent) return `${this.parent.getName()} ${this.name}`;
		return this.name;
	};
	return me;
};
const PokeCenter = Center;



// Helper functions
const id = ()=>{
	let currBank = 0;
	let currArea = 0;
	return function id( mapbank, mapid, areaid, set=true ) {
		if (areaid===undefined && mapid===undefined) {
			return `${currArea}:${currBank}.${mapbank}`;
		}
		if (areaid===undefined) {
			return `${currArea}:${mapbank}.${mapid}`;
		}
		if (set) {
			currBank = mapbank;
			currArea = areaid;
		}
		return `${areaid}:${mapbank}.${mapid}`;
	}
}();
function ref(mapbank, mapid, areaid) {
	return `${areaid}:${mapbank}.${mapid}`;
}
function r(num) { return `Route ${num}`; }
// function gameSpecific(black, white) {
// 	if (global.game == "Pyrite") return black;
// 	return white;
// }

const mapidFn = (mid)=>{
	if (mid instanceof Location) {
		return `${mid.area_id}:${mid.map_bank}.${mid.map_id}`;
	}
	if (typeof mid === 'string') {
		let res = /^(\d+)\:(\d+)\.(\d+)$/i.exec(other);
		if (!res) return 'invalid';
		return mid;
	}
	if (typeof mid === 'number') return `invalid`;
	return 'invalid';
};

// The region itself
const Johto = module.exports =
new Region({ name:"Johto", mapidFn }, [
	Town("New Bark Town", id(24,4,1), {
		buildings: [
			House([id(24,6,1), id(7)], {
				name: "Player's House",
				locOf: { healing:"7,4" },
			}),
			House(id(9), {
				name: "Elm's House",
			}),
			House(id(8)),
			House(id(5), {
				name: "Elm's Lab",
				noteworthy: true,
				locOf: { healing:"2,2" },
			}),
		],
		connections: [ r(29) ],
	}),
	Route(29, id(24,3,2), {
		locOf: {
			berrytree:"13,2",
		}
		connections: [ "New Bark Town", "Cherrygrove City" ],
	}),
	Gatehouse(id(24,13,255), r(29), r(46))
	Town("Cherrygrove City", id(26,3,3), {
		buildings: [
			PokeCenter(id(5)),
			PokeMart(id(4)),
			House(id(6)),
			House(id(7), { name: "Guide Gent's House", }),
			House(id(8)),
		],
		connections: [ r(29), r(30) ],
	}),
	Route(30, id(26,1,4), {
		buildings: [
			House(id(9)),
			House(id(10), { name: "Mr. Pokemon's House", }),
		],
		locOf: {
			berrytree:"13,5",
		}
		connections: [ "Cherrygrove City", r(31) ],
	}),
	Route(31, id(26,2,5), {
		connections: [ r(30), ref(3,78,44) ],
	}),
	Cave("Dark Cave", {
		floors: [
			Floor(id(3,78,44), { connections: [ r(31) ], }),
		],
	}),
	Gatehouse(id(26,11,255), "Violet City", r(31)),
	Town("Violet City", id(10,5,6), {
		buildings: [
			PokeCenter(id(10)),
			PokeMart(id(6)),
			House(id(8), { name:"Earl's Pokemon Academy", }),
			House(id(11)),
			House(id(9)),
			Gym(id(7), {
				leader: "Falkner",
				badge: "Zypher",
				locOf: {
					"leader": "5,1",
				},
			}),
			Dungeon("Sprout Tower", {
				floors: [
					Floor(id(3,1,7), { attrs:{ "dungeon":false, }}),
					Floor(id(2)),
					Floor(id(3)),
				],
			}),
		],
		connections: [ r(36), r(32) ],
	}),
	
	Route(32, id(10,1,8), {
		buildings: [
			PokeCenter(id(13)),
		],
		connections: [ "Violet City", ref(3,37,10) ], //Union Cave
	}),
	Gatehouse(id(10,12,255), "Ruins of Alph", r(32)),
	Dungeon("Ruins of Alph", {
		floors: [
			Floor(id(3,22,9), {
				attrs: { "indoors":false, }
				connections: [ ref(3,38,10)/*"Union Cave"*/ ],
			}),
			Floor(id(26), { name: "Arodactyle Chamber", }),
			Floor(id(25), { name: "Omanyte Chamber", }),
			Floor(id(24), { name: "Kabuto Chamber", }),
			Floor(id(23), { name: "Ho-Oh Chamber", }),
			Floor(id(27), { name: "Main Chamber", }),
		],
	}),
	Cave("Union Cave", {
		floors: [
			Floor(id(3,37,10), {
				connections: [ r(32), r(33), ],
			}),
			Floor(id(38), {
				connections: [ ref(3,22,9) ], //Ruins of Alph
			}),
			Floor(id(39)),
		],
	}),
	Route(33, id(8,6,11), {
		connections: [ "Azalea Town", ref(3,37,10) ], //Union Cave
	}),
	Town("Azalea Town", id(8,7,12), {
		buildings: [
			PokeCenter(id(1)),
			PokeMart(id(3)),
			House(id(2)),
			House(id(4), { name:"Kurt's House", }),
			Dungeon("Slowpoke Well", {
				floors: [
					Floor(id(3,40,13)),
					Floor(id(41)),
				],
			}),
			Gym(id(8,5,12), {
				leader: "Bugsy",
				badge: "Hive",
				locOf: {
					leader: "5,7",
				}
			}),
		],
		connections: [ r(33), ],
	}),
	Gatehouse(id(11,22,255), "Ilex Forest", "Azalea Town"),
	Area("Ilex Forest", id(3,52,14), {
		attr: { dungeon:true, },
		noteworthy: true,
	}),
	Gatehouse(id(11,23,255), "Ilex Forest", r(34)),
	Route(34, id(11,1,15), {
		buildings: [
			House(id(24), {
				name:"Daycare",
				locOf: { pc:"7,2", },
				noteworthy:true,
			}),
		],
		connections: [ "Goldenrod City" ],
	}),
	City("Goldenrod City", id(11,2,16), {
		buildings: [
			PokeCenter(id(20)),
			House(id(19), { name:"Game Corner", noteworthy:true }),
			House(id(6)), //Bill's house?
			House(id(10), { attr:{ "namerater":true } }),
			House(id(5)), //Friendship House
			House(id(4), { name:"Bike Shop"} ),
			House(id(7), { name:"Goldenrod City Train Station" }),
			House(id(9)),
			House(id(8), { name:"Flower Shop" }),
			Gym(id(3), {
				leader: "Whitney",
				badge: "Plain",
				locOf: {
					leader: "8,3",
				},
			}),
			Building({
				name: "Goldenrod City Department Store",
				attrs: { "shopping":true },
				floors: [
					Floor(id(11)),
					Floor(id(12)),
					Floor(id(13)),
					Floor(id(14)),
					Floor(id(15)),
					Floor(id(16), {
						locOf:{
							vending:["9,2","10,2","11,2"]
						},
					}),
					Floor(id(18)), // Rooftop
					Floor(id(17), { // Elevator
						connections: [ ref(3,55,16) ],
					}),
				]
			}),
			Building({
				name: "Radio Tower",
				floors: [
					Floor(id(3,17,17)),
					Floor(id(18)),
				],
			}),
			Building({
				name: "Underground",
				floors: [
					Floor(id(3,54,16)), //Entrance
					Floor(id(53)),
					Floor(id(55), { // Dept Store Basement (in another map bank)
						connections: [ ref(11,17,16) ],
					}),
					Floor(id(56)), //BF2
					Floor(id(54)),
				],
			}),
		],
		connections: [ r(34) ],
	}),
	Gatehouse(id(10,44,255), "Goldenrod City", r(35)),
	Route(35, id(10,2,18), {
		connections: [ r(36) ],
	}),
	Gatehouse(id(10,15,255), "National Park", r(35), {
		locOf: { pc:["7,1"] },
	}),
	Area("National Park", id(3,15,19), {}),
	Gatehouse(id(10,15,255), "National Park", r(36), {
		locOf: { pc:["9,1"] },
	}),
	Route(36, id(10,3,20), {
		connections: [ "Violet City", r(35), r(37) ],
	}),
	Gatehouse(id(10,16,255), "Ruins of Alph", r(36)),
	Route(37, id(14,4,21), {
		connections: [ r(36), "Ecruteak City" ],
	}),
	City("Ecruteak City", id(4,9,22), {
		buildings: [
			//TODO
		],
		connections: [ r(37), ],
	}),
	
	//TODO
	
	Route(46, id(5, 9, 45)),
]);

Johto.resolve();