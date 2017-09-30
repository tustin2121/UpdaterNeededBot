// Hoenn (RSE)

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	SingleCave, SingleDungeon,
	Mart, PokeMart, Gym,
	Cutscene, Node,
} = require("../map.js");
const { Location } = require('../../../data-format');

// Defaults for this particular region
const Center = function(mapid1, mapid2, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
	let me = new Node({ name:"Pokémon Center", mapids:[mapid1, mapid2], attrs:Object.assign({
		"indoors": true,
		"healing": "pokecenter",
		the, noteworthy: true,
	}, attrs), locOf:Object.assign({
		"pc": ["17,9"],
	}, locOf) });
	me.announce = announce;
	me.addConnection(...connections);
	me._typename = "Center";
	me.getName = function() {
		if (this.parent) return `${this.parent.getName()} ${this.name}`;
		return this.name;
	};
	return me;
};
const PokeCenter = Center;
const Others = function(...mapids){
	if (!Array.isArray(mapids)) mapids = [mapids];
	let me = new Node({ mapids, attrs:Object.assign({
		"indoors": true,
		"noteworthy": false,
	}) });
	me._typename = "Others";
	return me;
};


function id(mapbank, mapid, areaid){
	// if (areaid===undefined) {
		return `${mapbank}.${mapid}`;
	// } else {
	// 	return `${areaid}:${mapbank}.${mapid}`;
	// }
}
function r(num) { return `Route ${num}`; }
function firstTime(key, phrase) {
	return ({ reporter })=>{
		if (reporter.isFirstTime(key)) {
			return phrase;
		}
		return null;
	};
}

const mapidFn = (mid)=>{
	if (mid instanceof Location) {
		return `${mid.map_bank}.${mid.map_id}`;
	}
	if (typeof mid === 'string') {
		let res = /^(\d+)\.(\d+)$/i.exec(mid);
		if (!res) throw new Error(`Invalid ID: ${mid}`);//return 'invalid';
		return mid;
	}
	if (typeof mid === 'number') throw new Error(`Invalid ID: ${mid}`);//return `invalid`;
	throw new Error(`Invalid ID: ${mid}`);
	// return 'invalid';
};

const Hoenn = module.exports = 
new Region({ name:"Hoenn", mapidFn:mapidFn }, [
	Town("Littleroot Town", id(0,9), {
		buildings: [
			House([id(1,0), id(1,1)], { name: "Brenden's House", }),
			House([id(1,2), id(1,3)], { name: "May's House", }),
			House(id(1,4), { name: "Birch's Lab", }),
		],
		locOf: { flySpot: ["5,9","14,9"], },
		connections: [ r(101) ],
	}),
	Town("Oldale Town", id(0,10), {
		buildings: [
			Others(id(2,0), id(2,1)),
			PokeCenter(id(2,2),id(2,3)),
			PokeMart(id(2,4)),
		],
		locOf: { flySpot: "6,11", },
		connections: [ r(101), r(103), r(102), ],
	}),
	Town("Dewford Town", id(0,11), {
		buildings: [
			PokeCenter(id(3,1),id(3,2)),
			Others(id(3,0), id(3,5)),
			House(id(3,4), { name: "Dewford Hall", }),
			Gym(id(3,3), {
				leader: "Brawly",
				badge: "Knuckle",
				leaderClass: 0x10A,
				locOf: { leader: "4,2" },
			}),
		],
		locOf: { flySpot: "2,11", },
	}),
	Town("Lavaridge Town", id(0,12), {
		buildings: [
			PokeCenter(id(4,5),id(4,6)),
			PokeMart(id(4,0)),
			PokeMart(id(4,4)),
			Gym([id(4,1),id(4,2)], {
				leader: "Flannery",
				badge: "Heat",
				leaderClass: 0x10C,
				locOf: { leader: "13,9" },
			}),
			Others(id(4,3)),
		],
		locOf: { flySpot: "9,7", },
	}),
	Town("Fallarbor Town", id(0,13), {
		buildings: [
			House([id(5,1),id(5,2),id(5,3)], {
				name: "Battle Tent",
			}),
			PokeMart(id(5,0)),
			PokeCenter(id(5,4),id(5,5)),
			Others(id(5,6), id(5,7)),
		],
		locOf: { flySpot: "14,8", },
	}),
	Town("Verdanturf Town", id(0,14), {
		buildings: [
			House([id(6,0),id(6,1),id(6,2)], {
				name: "Battle Tent",
			}),
			PokeMart(id(6,3)),
			PokeCenter(id(6,4),id(6,5)),
			Others(id(6,6),id(6,7),id(6,8)),
		],
		locOf: { flySpot: "16,4", },
		connections: [ "Rusturf Tunnel" ],
	}),
	Town("Pacifidlog Town", id(0,15), {
		buildings: [
			PokeCenter(id(7,0),id(7,1)),
			Others(id(7,2),id(7,3),id(7,4),id(7,5),id(7,6)),
		],
		locOf: { flySpot: "16,4", },
	}),
	City("Petalburg City", id(0,0), {
		buildings: [
			Others(id(8,0), id(8,2), id(8,3)),
			PokeCenter(id(8,4), id(8,5)),
			PokeMart(id(8,6)),
			Gym(id(8,1), {
				leader: "Norman",
				badge: "Balance",
				leaderClass: 0x10D,
				locOf: { leader: "4,2" },
			}),
		],
		locOf: { flySpot: "20,17", },
	}),
	City("Slateport City", id(0,1), {
		buildings: [
			Others(id(9,0), id(9,1), id(9,9)),
			Others(id(9,5), id(9,10)),
			House([id(9,2),id(9,3),id(9,4)], {
				name: "Battle Tent",
			}),
			House(id(9,6), { name:"Pokemon Fan Club", }),
			House([id(9,7),id(9,8)], { name:"Oceanic Museum", }),
			PokeCenter(id(9,11), id(9,12)),
			PokeMart(id(9,13)),
		],
		locOf: { flySpot: "19,20", },
	}),
	City("Mauville City", id(0,2), {
		buildings: [
			Gym(id(10,0), {
				leader: "Wattson",
				badge: "Dynamo",
				leaderClass: 0x10B,
				locOf: { leader: "5,2" },
			}),
			Others(id(10,1),id(10,2),id(10,4)),
			House(id(10,3), { name:"Game Corner", }),
			PokeCenter(id(10,5), id(10,6)),
			PokeMart(id(10,7)),
		],
		locOf: { flySpot: "22,6", },
	}),
	City("Rustboro City", id(0,3), {
		buildings: [
			Others(id(11,0), id(11,1), id(11,2), id(11,4)),
			Gym(id(11,3), {
				leader: "Roxanne",
				badge: "Stone",
				leaderClass: 0x109,
				locOf: { leader: "5,2" },
			}),
			PokeCenter(id(11,5), id(11,6)),
			PokeMart(id(11,7)),
			Others(id(11,8), id(11,9), id(11,10), id(11,11), id(11,12), id(11,13), id(11,14), id(11,15), id(11,16)),
		],
		locOf: { flySpot: "16,39", },
	}),
	City("Fortree City", id(0,4), {
		buildings: [
			Others(id(12,0), id(12,5), id(12,6), id(12,7), id(12,8)),
			Gym(id(12,1), {
				leader: "Winona",
				badge: "Feather",
				leaderClass: 0x10E,
				locOf: { leader: "15,2" },
			}),
			PokeCenter(id(12,2), id(12,3)),
			PokeMart(id(12,4)),
			PokeMart(id(12,9)),
		],
		locOf: { flySpot: "5,7", },
	}),
	City("Lilycove City", id(0,5), {
		buildings: [
			Others(id(13,0), id(13,1), id(13,2), id(13,3), id(13,9), id(13,11), id(13,12), id(13,13), id(13,14), id(13,15)),
			House([id(13,4),id(13,5)], {
				name: "Contest Hall",
			}),
			PokeCenter(id(13,6), id(13,7)),
			PokeMart(id(13,8)),
			Others(id(13,10)),
			Others(id(13,16), id(13,17), id(13,18), id(13,19), id(13,20), id(13,21), id(13,22)),
		],
		locOf: { flySpot: "24,15", },
	}),
	City("Mossdeep City", id(0,6), {
		buildings: [
			Gym(id(14,0), {
				leader: "Tate & Liza",
				badge: "Mind",
				leaderClass: 0x10F,
				locOf: { leader: "23,7" },
			}),
			Others(id(14,1), id(14,2), id(14,6), id(14,7), id(14,8), id(14,12), id(14,11)),
			PokeCenter(id(14,3), id(14,4)),
			PokeMart(id(14,5)),
			House([id(14,9), id(14,10)], {
				name: "Mossdeep Space Center",
			}),
		],
		locOf: { flySpot: "24,15", },
	}),
	City("Sootopolis City", id(0,7), {
		buildings: [
			Gym([id(15,0), id(15,1)], {
				leader: "Juan", //Wallace
				badge: "Rain",
				leaderClass: 0x110,
				locOf: { leader: "23,7" },
			}),
			PokeCenter(id(15,2), id(15,3)),
			PokeMart(id(15,4)),
			Others(id(15,5), id(15,6), id(15,7), id(15,8), id(15,9), id(15,10), id(15,11), id(15,12), id(15,13), id(15,14)),
		],
		locOf: { flySpot: "43,32", },
	}),
	City("Ever Grande City", id(0,8), {
		buildings: [
			PokeCenter(id(16,12), id(16,13)),
			Building("Pokemon League", {
				floors: [
					Floor(id(16,10), {
						attrs: {
							"e4":"lobby",
							healing: true,
							shopping: true,
							locOf: { "pc":"6,2", },
						},
					}),
					Floor(id(16,14), {  }),
					Floor(id(16,9), {
						attrs:{ "e4":"e4" },
					}),
					Floor(id(16,0), {
						attrs:{ 
							"e4":"e4",
							leader:"Sidney",
							leaderClass:0x105,
						},
						locOf:{ leader:"6,5", },
					}),
					Floor(id(16,5), {
						attrs:{ "e4":"e4" },
					}),
					Floor(id(16,1), {
						attrs:{ 
							"e4":"e4",
							leader:"Phoebe",
							leaderClass:0x106,
						},
						locOf:{ leader:"6,5", },
					}),
					Floor(id(16,6), {
						attrs:{ "e4":"e4" },
					}),
					Floor(id(16,2), {
						attrs:{ 
							"e4":"e4",
							leader:"Glacia",
							leaderClass:0x107,
						},
						locOf:{ leader:"6,5", },
					}),
					Floor(id(16,7), {
						attrs:{ "e4":"e4" },
					}),
					Floor(id(16,3), {
						attrs:{ 
							"e4":"e4",
							leader:"Drake",
							leaderClass:0x108,
						},
						locOf:{ leader:"6,5", },
					}),
					Floor(id(16,8), {
						attrs:{ "e4":"champion" },
					}),
					Floor(id(16,4), {
						attrs:{ 
							"e4":"champion",
							leader:"Wallace",
							leaderClass:0x14F,
						},
						locOf:{ leader:"6,5", },
					}),
					Floor(id(16,11), {
						attrs:{ "e4":"hallOfFame", },
						locOf:{ leader:"6,5", },
					}),
				],
			}),
		],
		locOf: { flySpot: ["18,6","27,49"], },
		connections: [ "Victory Road" ],
	}),
	
	
	Route(101, id(0,16), {
		exits: [ "Littleroot Town", "Oldale Town" ],
	}),
	Route(102, id(0,17), {
		exits: [ "Oldale Town", "Petalburg City" ],
	}),
	Route(103, id(0,18), {
		exits: [ "Oldale Town", r(110) ],
	}),
	Route(104, id(0,19), {
		buildings: [
			House(id(17,0)),
			House(id(17,1)),
		],
		exits: [ r(105), "Rustboro City", "Petalburg City", "Petalburg Woods" ],
	}),
	Route(105, id(0,20), {
		exits: [ r(106), "Island Cave" ],
	}),
	Route(106, id(0,21), {
		exits: [ "Dewford Town", "Granite Cave" ],
	}),
	Route(107, id(0,22), {
		exits: [ "Dewford Town", r(108) ],
	}),
	Route(108, id(0,23), {
		exits: [ "Abandoned Ship", r(109) ],
	}),
	Route(109, id(0,24), {
		buildings: [
			House(id(28,0)),
		],
		exits: [ "Slateport City" ],
	}),
	Route(110, id(0,25), {
		buildings: [
			Building("Trick House", {
				floors: [
					Floor(id(29,0)),
					Floor([id(29,1),id(29,2)]),
					Floor(id(29,3)), // Cut Puzzle
					Floor(id(29,4)), // Switch Puzzle
					Floor(id(29,5)), // Door Puzzle
					Floor(id(29,6)), // Strength Puzzle
					Floor(id(29,7)), // Quiz Puzzle
					Floor(id(29,8)), // ??? Puzzle
					Floor(id(29,9)), // Spinning Puzzle
					Floor(id(29,10)), // Ice Puzzle
				],
			}),
			House([id(29,11),id(29,12)]), //gatehouse
		],
		exits: [ "Mauville City", "New Mauville" ],
	}),
	Route(111, id(0,26), {
		buildings: [
			House(id(18,0)),
			House(id(18,1)),
			SingleCave("Desert Ruins", id(24,6), {
				legendary: {
					name: "Regice",
					loc: "8,7",
				},
			}),
		],
		exits: [ "Mauville City", r(112), r(113), "Mirage Tower" ],
	}),
	Route(112, id(0,27), {
		buildings: [
			SingleCave("Fiery Path", id(24,14)),
		],
		exits: [ "Lavaridge Town" ],
	}),
	Gatehouse([id(19,0),id(19,1)], r(112), "Mt. Chimney"),
	Route(113, id(0,28), {
		buildings: [
			House(id(30,0)),
		],
		exits: [ "Fallarbor Town" ],
	}),
	Route(114, id(0,29), {
		buildings: [
			House([id(20,0),id(20,1)]),
			House([id(20,2)]),
			SingleCave("Desert Underpass", id(24,98)),
		],
		exits: [ "Fallarbor Town", "Meteor Falls" ],
	}),
	Route(115, id(0,30), {
		exits: [ "Rustboro City", "Meteor Falls" ],
	}),
	Route(116, id(0,31), {
		buildings: [
			House(id(21,0)),
		],
		exits: [ "Rustboro City", "Rusturf Tunnel" ],
	}),
	Route(117, id(0,32), {
		buildings: [
			House(id(22,0), { name:"Daycare" }),
		],
		exits: [ "Verdanturf Town", "Mauville City" ],
	}),
	Route(118, id(0,33), {
		exits: [ "Mauville City", r(119), r(123) ],
	}),
	Route(119, id(0,34), {
		buildings: [
			Building("Weather Institute", {
				floors: [
					Floor(id(32,0)),
					Floor(id(32,1)),
				],
			}),
			House(id(32,2)),
		],
		exits: [ "Fortree City" ],
	}),
	Route(120, id(0,35), {
		buildings: [
			SingleCave("Scorched Slab", id(24,73)),
			SingleCave("Ancient Tomb", id(24,68), {
				legendary: {
					name: "Regirock",
					loc: "8,7",
				},
			}),
		],
		exits: [ "Fortree City", r(121) ],
	}),
	Route(121, id(0,36), {
		buildings: [
			House(id(23,0)),
		],
		exits: [ "Lilycove City", "Safari Zone", r(122) ],
	}),
	Route(122, id(0,37), {
		exits: [ r(123), "Mt. Pyre" ],
	}),
	Route(123, id(0,38), {
		buildings: [
			House(id(31,0)),
		],
	}),
	Route("Underwater", [
		id(0,50), id(0,51), id(0,52), id(0,53),
		id(0,54), id(0,56), //No way to get here
		id(24,5), //Sootopolis City
	], {
		buildings: [
			House(id(24,26)),
		],
		exits: [ "Sootopolis City" ],
	}),
	Route(124, id(0,39), {
		buildings: [
			House(id(33,0)),
		],
		exits: [ "Lilycove City", "Underwater", "Mossdeep City" ],
	}),
	Route(125, id(0,40), {
		exits: [ "Shoal Cave", "Mossdeep City" ],
	}),
	Route(126, id(0,41), {
		exits: [ "Underwater", r(124), r(127) ],
	}),
	Route(127, id(0,42), {
		exits: [ "Underwater", "Mossdeep City", r(128) ],
	}),
	Route(128, id(0,43), {
		exits: [ "Underwater", "Ever Grande City", r(129) ],
	}),
	Route(129, id(0,44), {
		exits: [ r(130) ],
	}),
	Route(130, id(0,45), {
		exits: [ r(131) ],
	}),
	Route(131, id(0,46), {
		exits: [ "Sky Pillar", "Pacifidlog Town" ],
	}),
	Route(132, id(0,47), {
		exits: [ "Pacifidlog Town", r(133) ],
	}),
	Route(133, id(0,48), {
		exits: [ r(134) ],
	}),
	Route(134, id(0,49), {
		exits: [ "Slateport City" ],
	}),
	
	
	SingleCave("New Mauville", [id(24,52),id(24,53)]),
	SingleCave("Island Cave", id(24,67), {
		legendary: { name: "Regice", loc:"8,7" },
	}),
	SingleCave("Petalburg Woods", id(24,11)),
	SingleCave("Rusturf Tunnel", id(24,4), {
		connections: [ "Verdanturf Town" ],
	}),
	Dungeon("Victory Road", {
		floors: [
			Floor(id(24,43)),
			Floor(id(24,44)),
			Floor(id(24,45)),
		],
		connections: [ "Ever Grande City" ],
	}),
	Dungeon("Cave of Origin", {
		floors: [
			Floor(id(24,37)),
			Floor(id(24,38)),
			Floor(id(24,39)),
			Floor(id(24,40)),
			Floor(id(24,41)),
			Floor(id(24,42)),
		],
		connections: [ "Sootopolis City" ],
	}),
	Dungeon("Granite Cave", {
		floors: [
			Floor(id(24,7)),
			Floor(id(24,8)),
			Floor(id(24,9)),
			Floor(id(24,10), {
				announce: firstTime(id(24,10), "We enter a deep cavern and find Steven staring at the cave wall..."),
			}),
		],
	}),
	Dungeon("Abandoned Ship", {
		floors: [
			Floor(id(24,54)),
			Floor(id(24,55)),
			Floor(id(24,56)),
			Floor(id(24,57)),
			Floor(id(24,58)),
			Floor(id(24,59)),
			Floor(id(24,60)),
			Floor(id(24,61)),
			Floor(id(24,62)),
			Floor(id(24,63)),
			Floor(id(24,64)),
			Floor(id(24,65)),
			Floor(id(24,66)),
		],
	}),
	Area("Mt. Chimney", id(24,12), {
		attrs: {
			leader: "Maxie",
			leaderClass: 0x25A,
		},
		locOf: { leader:"13,6" },
	}),
	Area("Safari Zone", [id(26,3),id(26,2),id(26,1),id(26,0),id(26,13),id(26,12)], {
		buildings: [
			House(id(26,11)),
		],
	}),
	Route("Jagged Pass", id(24,13), {
		exits: [ "Mt. Chimney", r(112),  ],
	}),
	Dungeon("Mt. Pyre", {
		floors: [
			Floor(id(24,15)),
			Floor(id(24,16)),
			Floor(id(24,17)),
			Floor(id(24,18)),
			Floor(id(24,19)),
			Floor(id(24,20)),
			Floor(id(24,21), { attrs:{ "indoors":false }, }),
			Floor(id(24,22), { 
				announce: "We reach the top of Mt. Pyre.",
				attrs:{ "indoors":false }, 
			}),
		],
	}),
	Dungeon("Meteor Falls", {
		floors: [
			Floor(id(24,0)),
			Floor(id(24,1)),
			Floor(id(24,2)),
			Floor(id(24,3)),
			Floor(id(24,107), {
				attrs: {
					leader: "Steven",
					leaderClass: 0x324,
				},
				locOf: { leader:"19,3" },
			}),
		],
	}),
	Dungeon("Aqua Hideout", {
		floors: [
			Floor(id(24,23)),
			Floor(id(24,24)),
			Floor(id(24,25)),
		],
	}),
	Dungeon("Magma Hideout", {
		floors: [
			Floor(id(24,86)),
			Floor(id(24,87)),
			Floor(id(24,88)),
			Floor(id(24,89)),
			Floor(id(24,90)),
			Floor(id(24,91), {
				attrs: {
					leader: "Maxie",
					leaderClass: 0x259,
				},
				locOf: { leader:"16,21" },
			}),
			Floor(id(24,93)),
			Floor(id(24,92)),
		],
	}),
	Dungeon("Shoal Cave", {
		floors: [
			Floor(id(24,46)),
			Floor(id(24,47)),
			Floor(id(24,48)),
			Floor(id(24,49)),
			Floor(id(24,50)),
			Floor(id(24,51)),
			Floor(id(24,83)),
		],
	}),
	Dungeon("Sky Pillar", {
		floors: [
			Floor(id(24,77)),
			Floor(id(24,78)),
			Floor(id(24,79)),
			Floor(id(24,80)),
			Floor(id(24,81)),
			Floor(id(24,82)),
			Floor(id(24,84)),
			Floor(id(24,85)),
		],
	}),
	Dungeon("Mirage Tower", {
		floors: [
			Floor(id(24,94)),
			Floor(id(24,95)),
			Floor(id(24,96)),
			Floor(id(24,97)),
		],
	}),
	
	SingleCave("Secret Base", [
		id(25,0), id(25,1), id(25,2), id(25,3), id(25,4), id(25,5), id(25,6), id(25,7), id(25,8), id(25,9), 
		id(25,10), id(25,11), id(25,12), id(25,13), id(25,14), id(25,15), id(25,16), id(25,17), id(25,18), id(25,19),
		id(25,20), id(25,21), id(25,22), id(25,23),
	]),
	Area("Battle Frontier", [id(26,4)], {
		buildings: [
			// TODO care
			Others(...[
				id(26, 5),id(26, 6),id(26, 7),id(26, 8),
				id(26,14),id(26,15),id(26,16),id(26,17),id(26,18),id(26,19),
				id(26,20),id(26,21),id(26,22),id(26,23),id(26,24),id(26,25),id(26,26),id(26,27),id(26,28),id(26,29),
				id(26,30),id(26,31),id(26,32),id(26,33),id(26,34),id(26,35),id(26,36),id(26,37),id(26,38),id(26,39),
				id(26,40),id(26,41),id(26,42),id(26,43),id(26,44),id(26,45),id(26,46),id(26,47),id(26,48),id(26,49),
				id(26,50),id(26,51),id(26,52),id(26,53),id(26,54),id(26,55),
			]),
		],
	}),
]);

Hoenn.resolve();