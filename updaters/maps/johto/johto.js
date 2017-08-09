// Johto (GSC)
// This is gen 2 Johto

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
	Center, PokeCenter,
	
	Location,
	
	id, ref, r, firstTime,
} = require("./common.js");

module.exports = [
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
		connections: [ r(29), r(27) ],
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
			Floor(id(3,78,44), { connections: [ r(31), r(46) ], }),
			Floor(id(3,79,44), { connections: [ r(45) ], })
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
				leaderClass: 1,
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
				leaderClass: 3,
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
				leaderClass: 2,
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
					Floor(id(19)),
					Floor(id(20)),
					Floor(id(21)),
				],
			}),
			Building({
				name: "Underground",
				floors: [
					Floor(id(3,54,16)), //Entrance
					Floor(id(53)),	// Hallway
					Floor(id(55), { // Dept Store Basement (in another map bank)
						connections: [ ref(11,17,16) ],
					}),
					Floor(id(56), {
						locOf: {
							leader: "12,8", //Director
						}
					}), //BF2
					Floor(id(54)), //BF3
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
			PokeCenter(id(3)),
			PokeMart(id(6)),
			House(id(5), { name: "Ecruteak Dance Theater" }),
			House(id(8)), //Item finder house
			House(id(4)),
			House(id(25,7), { name:"Move Tutor's House" }),
			Gym(id(7), {
				leader: "Morty",
				leaderClass: 4,
				badge: "Fog",
				locOf: {
					leader: "5,1",
				}
			})
			Building("Tin Tower Entrance", {
				floors: [
					Floor(id(1)),
					Floor(id(2)),
				],
			}),
			Building("Tin Tower", {
				floors: [
					Floor(id(3,4,23)),
					
				],
			}),
			Building("Burned Tower", {
				floors: [
					Floor(id(3, 13, 24)),
					Floor(id(14)),
				],
			}),
		],
		connections: [ r(37), ],
	}),
	
	Gatehouse(id(2,4,255), "Ecruteak City", r(42), {
		name: "Ecruteak City Eastern Gatehouse",
	}),
	Route(42, id(2,5,34), {
		connections: [ "Mahogany Town", ref(3,57,35) ],
	}),
	Dungeon("Mt. Mortar", {
		floors: [
			Floor(id(3,57,35), {
				connections: [ r(42) ],
			}),
			Floor(id(3,58,35)),
			Floor(id(3,59,35)),
			Floor(id(3,60,35)),
		],
	}),
	Town("Mahogany Town", id(2,7,36), {
		buildings: [
			PokeCenter(id(3)),
			Gym(id(2), {
				leader: "Pryce",
				leaderClass: 5,
				badge: "Glacier",
				locOf: {
					leader: "2,3",
				}
			}),
			House(id(1)),
			House(id(3, 48, 36), { // Rocket Hideout
				attrs:{ shopping:true, }
				connections: [ ref(3,49,36) ],
			}),
			Building("Rocket Hideout", {
				attrs: { "dungeon": true, },
				floors: [
					Floor(id(49), {
						connections: [ ref(3,48,36) ],
					}),
					Floor(id(50)),
					Floor(id(51)),
				],
			}),
		],
		connections: [ r(42), r(44), ],
	}),
	Gatehouse(id(9,3,255), "Mahogany Town", r(43)),
	Route(43, id(9,5,37), {
		buildings: [
			House(id(9,4,255)), //Toll house
		],
		connections: [ "Lake of Rage" ],
	}),
	Area("Lake of Rage", id(9,6,38), {
		buildings: [
			House(id(2), { name:"Fishing Guru's House", }),
			House(id(1)), //House in the back
		],
		locOf: {
			leader: "18,22", //gyarados
		},
		connections: [ r(43) ],
	}),
	
	Gatehouse(id(1,9,255), "Ecruteak City", r(38), {
		name: "Ecruteak City Western Gatehouse",
	}),
	Route(38, id(1,12,25), {
		connections: [ r(39) ],
	}),
	Route(39, id(1,13,26), {
		buildings: [
			House(id(11)), // House
			House(id(10)), // Stable
		],
		connections: [ r(38), "Olivine City" ],
	}),
	City("Olivine City", id(1,14,27), {
		buildings: [
			PokeCenter(id(1)),
			PokeMart(id(8)),
			Gym(id(2), {
				leader: "Jasmine",
				leaderClass: 6,
				badge: "Mineral",
				locOf: {
					leader: "5,3",
				},
			}),
			House(id(6)),
			House(id(7), { name:"Olivine Cafe", }),
			House(id(3)),
			House(id(5)),
			Building("Glitter Lighthouse", {
				floors: [
					Floor(id(3,42,28)),
					Floor(id(43)),
					Floor(id(44)),
					Floor(id(45)),
					Floor(id(46)),
					Floor(id(47)), //Top
				],
			}),
			House([id(15,8,27), id(1)]),
		],
		connections: [ r(39), r(40) ],
	}),
	Route(40, id(22,1,30), {
		connections: [ r(41) ],
	}),
	Gatehouse(id(22,15,255), "Battle Tower", r(40)),
	Building({
		name: "Battle Tower",
		floors: [
			Floor(id(22,16,29), {
				attrs: { indoors:false, },
			}),
			Floor(id(11)), //Lobby
			Floor(id(13), { //Elevator
				announce: "We've entered the battle tower challenge!",
			}),
			Floor(id(14)), //Hallway
			Floor(id(12)), //Battle Room
		],
	}),
	Route(41, id(22,2,32), {
		connections: [ r(40), ref(3,67,31), "Cianwood City" ],
	}),
	Dungeon("Whirl Islands", {
		floors: [
			Floor(id(3,67,31)),
			Floor(id(71)),
			Floor(id(72)),
			Floor(id(73)),
			Floor(id(68)),
			Floor(id(66)),
			Floor(id(69)),
		],
		connections: [ r(40) ],
	}),
	City("Cianwood City", id(22,3,33), {
		buildings: [
			PokeCenter(id(6)),
			House(id(7), { attrs:{ shopping:true, } }),
			House(id(4)), //Shuckle House
			House(id(9)),
			House(id(8), { name:"Cianwood Photo Studio" }),
			House(id(10), { name:"The Pokeseer's House" }),
			Gym(id(5), {
				leader: "Chuck",
				leaderClass: 7,
				badge: "Storm",
				locOf: {
					leader: "4,1",
				},
			}),
		],
		connections: [ r(40) ],
	}),
	
	Route(44, id(2,6,39) {
		connections: [ "Mahogany Town", ref(3,61,40) ],
	}),
	Cave("Ice Path", {
		floors: [
			Floor(id(3,61,40), {
				connections: [ r(44), "Blackthorn City" ],
			}),
			Floor(id(62)),
			Floor(id(63)),
			Floor(id(65)),
			Floor(id(64)),
		],
	}),
	City("Blackthorn City", id(5,10,41), {
		buildings: [
			PokeCenter(id(6)),
			PokeMart(id(5)),
			House(id(4)),
			House(id(7), { name:"Move Deleter's House", noteworthy:true, }),
			House(id(3)),
			Gym([id(1), id(2)], {
				leader: "Clair",
				leaderClass: 8,
				badge: null, //"Rising",
				locOf: {
					leader: "5,3",
				}
			}),
		],
		connections: [ ref(3,61,40), ref(3,80,42), r(45) ],
	}),
	Cave("Dragon Den", {
		floors: [
			Floor(id(3,80,42), {
				connections: [ "Blackthorn City" ],
			}),
			Floor(id(81)),
			Floor(id(82), {
				name:"Dragon Shrine",
				announce: firstTime(id(82), "We enter the Dragon Shrine, and approach the old dragon master. He begins to ask us some questions..."),
			}),
		],
	}),
	Route(45, id(5,8,43), {
		connections: [ "Blackthorn City", ref(3,79,44) ], //Dark Cave
	}),
	Route(46, id(5, 9, 45), {
		connections: [ ref(3,78,44) ], //Dark Cave
	}),
	
	Route(27, id(24,2,93), {
		buildings: [
			House(id(12)),
			Area("Tohjo Falls", id(3,83,94), {
				attrs: {
					indoors: true,
					dungeon: true,
					noteworthy: true,
					"onto": "into",
				},
			}),
		],
		connections: [ "New Bark Town", r(26) ],
	}),
	Route(26, id(24,1,92), {
		buildings: [
			House(id(11)), // Weekday Siblings' House
			House(id(10), {
				attrs: { healing:"house" },
			}),
		],
		connections: [ r(27), ref(23,13,255) ],
	}),
];