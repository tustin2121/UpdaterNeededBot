// Johto (GSC)
// This is gen 2 Kanto

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
	Center, PokeCenter,
	SingleCave, SingleDungeon, Cave1, Dungeon1,
	
	Location,
	
	id, ref, r, firstTime,
} = require("./common.js");

module.exports = [
	Route(22, id(23,2,88), {
		connections: [ ref(23,13,255), "Viridian City", ],
	}),
	City("Viridian City", id(23,3,49), {
		buildings: [
			PokeCenter(id(9)),
			PokeMart(id(8)),
			House(id(5)),
			House([id(6),id(7)], {
				name: "Trainer House",
				locOf: { pc:"2,2" },
			}),
			Gym(id(4), {
				leader: "Blue",
				leaderClass: 64, //TODO
				badge: "Earth",
				locOf: {
					leader: "5,3",
				},
			}),
		],
		connections: [ r(22), r(1), r(2) ],
	}),
	Route(1, id(13,1,48), {
		connections: [ "Viridian City", "Pallet Town" ],
	}),
	Town("Pallet Town", id(13,2,47), {
		buildings: [
			House([id(3),id(4)], { name:"Red's House" }),
			House(id(5), { name:"Blue's House" }),
			House(id(6), { name:"Oak's Lab" }),
		],
		connections: [ r(1), r(21) ],
	}),
	
	Route(2, id(23,1,50), {
		buildings: [
			House(id(11)),
		],
		connections: [ "Viridian City", "Diglett's Cave", "Viridian Forest", "Pewter City" ],
	}),
	SingleCave("Diglett's Cave", id(3,84,63), {
		connections: [ r(2) ],
	}),
	Gatehouse(id(23,12,255), "Viridian Forest", r(2)),
	SingleCave("Viridian Forest", id(3,90,51), {
		connections: [ r(2) ],
	}),
	
	City("Pewter City", id(14,2,52), {
		buildings: [
			PokeCenter(id(6)),
			PokeMart(id(5)),
			House(id(8)),
			House(id(3)),
			Gym(id(4), {
				leader: "Brock",
				leaderClass: 17,
				badge: "Boulder",
				locOf: {
					leader: "5,1",
				}
			}),
		],
		connections: [ r(2), r(3) ],
	}),
	Route(3, id(14,1,53), {
		connections: [ "Pewter City", "Mt. Moon" ],
		
	}),
	Cave("Mt. Moon", id(3,85,54), {
		announce: firstTime(id(85), "We step into Mt. Moon, and are immedately spooted by our rival, who challenges us to a battle!"),
		buildings: [
			Area("Mt. Moon Square", id(15,10,54), {
				buildings: [
					House(id(11), { attrs:{ shopping:true } }),
				],
				attrs: {
					indoors: false,
				},
			})
		],
		connections: [ r(3), r(4) ],
	}),
	Route(4, id(7,12,55), {
		connections: [ "Mt. Moon", "Cerulean City" ],
	}),
	City("Cerulean City", id(7,17,56), {
		buildings: [
			PokeCenter(id(4)),
			PokeMart(id(7)),
			House(id(3)),
			House(id(1)),
			House(id(2)),
			Gym(id(6), {
				leader: "Misty",
				leaderClass: 18, //TODO
				badge: "Cascade",
				locOf: {
					leader: "5,2",
				},
			}),
			Cave("Cerulean Cave",{
				floors:[
					Floor(id(12,13,56), {
						legendary: {
							name: "Mewtwo",
							loc: "19,30",
						},
					}),
					Floor(id(1,4,56)), //Team Rocket Hideout
				],
			}),
		],
		connections: [ r(4), r(9) ],
	}),
	Route(24, id(7,15,57), {
		connections: [ r(25), "Cerulean City" ],
	}),
	Route(25, id(7,16,58), {
		buildings: [
			House(id(11), { name:"Sea Cottage", })
		],
		connections: [ r(24) ],
	}),
	Route(5, id(25, 1, 59), { //For some reason, this name is not signposted anywhere in Pyrite
		buildings: [
			House(id(15)),
			House(ref(25,13,255), {
				connections: [ "Underground Path" ],
			}),
		],
		connections: [ "Cerulean City" ],
	}),
	Route(9, id(7,13,66), {
		connections: [ "Cerulean City", ref(3,87,67), r(10) ], //Rock Tunnel
	}),
	Route(10, id(7,14,68), { //Another route that doesn't signpost
		buildings: [
			PokeCenter(id(8)),
			House(id(7, 10, 69), { name: "Kanto Power Plant", }),
		],
		connections: [ r(9), ref(3,87,67) ],
	}),
	Cave("Rock Tunnel", {
		floors: [
			Floor(id(3,87,67)),
			Floor(id(88)),
		],
		connections: [ r(9), r(10) ],
	}),
	Town("Lavender Town", id(18,4,70), {
		buildings: [
			PokeCenter(id(5)),
			PokeMart(id(10)),
			House(id(8)),
			House(id(9), { attrs:{ "namerater":true } }),
			House(id(7), { name:"Lavender Volunteer Pokemon House" }),
			House(id(11), { name:"Soul House" }),
			House(id(18,12,71), {
				name: "Kanto Radio Tower",
				locOf:{ pc:"2,1" },
			}),
		],
		connections: [ r(10), r(8), r(12) ],
	}),
	Route(8, id(18,1,65), {
		connections: [ "Lavender Town" ],
	}),
	Gatehouse(id(18,13,255), "Saffron City", r(8), {
		name: "Saffron City Eastern Gatehouse",
	}),
	
	SingleCave("Underground Path", id(3,86,255), {
		connections: [ ref(25,13,59), ref(25,14,255) ],
	}),
	City("Saffron City", id(25,2,73), {
		buildings: [
			PokeCenter(id(6)),
			PokeMart(id(5)),
			House([id(11, id(12))], { name:"Copycat's House" }),
			House(id(8)),
			House(id(10), { name:"Silph Co. Building" }),
			House(id(9), {
				name:"Saffron City Magnet Train Station",
				connections: [ ref(11,7,16) ],
			}),
			House(ref(25,14,255), {
				connections: [ "Underground Path" ],
			}),
			House(id(3), { name:"Fighting Dojo" }),
			Gym(id(4), {
				leader: "Sabrina",
				badge: "Marsh",
				leaderClass: 35,
				locOf: {
					leader: "11,8",
				}
			})
		],
	}),
	
	Gatehouse(id(12,12,255), "Saffron City", r(6), {
		name: "Saffron City Southern Gatehouse",
	}),
	Route(6, id(12,1,61), {
		connections: [ "Vermilion City" ],
	}),
	City("Vermilion City", id(12,3,62), {
		buildings: [
			PokeCenter(id(5)),
			PokeMart(id(9)),
			House(id(4)),
			House(id(8)),
			House(id(10)),
			House(id(7), { name:"Pokemon Fan Club" }),
			Gym(id(11), {
				leader: "Lt. Surge",
				badge: "Thunder",
				leaderClass:
				locOf: {
					leader: "5,0",
				},
			}),
			House([id(15,2,62), id(9)], {
				connections: [ ref(15, 3, 96) ],
			}),
		],
		connections: [ r(6), r(11), "Diglett's Cave" ],
	}),
	Route(11, id(12,2,74), {
		connections: [ "Vermilion City", r(12) ],
	}),
	Route(12, id(18,2,75), {
		buildings: [
			House(id(14)),
		],
		connections: [ r(11), "Lavender Town", r(13) ],
	}),
	Route(13, id(12,1,76), {
		connections: [ r(14), r(12) ],
	}),
	Route(14, id(17,2,77), {
		connections: [ r(15), r(13)],
	}),
	Route(15, id(17,3,78), {
		connections: [ r(14) ], //Gatehouse to Fuchsia
	}),
	
	Gatehouse(id(21,25,255), "Saffron City", r(7), {
		name: "Saffron City Western Gatehouse",
	}),
	Route(7, id(21,1,64), {
		connections: [ "Celadon City" ],
	}),
	City("Celadon City", id(21,4,72), {
		buildings: [
			PokeCenter(id(17)),
			House(id(19), { name:"Celedon Game Corner", }),
			House(id(20)), //Reward house
			House(id(22)), //Restaraunt
			Building({
				name: "Celadon Mansion",
				floors: [
					Floor(id(12)),
					Floor(id(13)),
					Floor(id(14)),
					Floor(id(15)),
					Floor(id(16)), //Penthouse
				],
			}),
			Building({
				name: "Celadon Department Store",
				floors: [
					Floor(id(5)),
					Floor(id(6)),
					Floor(id(7)),
					Floor(id(8)),
					Floor(id(9)),
					Floor(id(10), {
						attrs: {
							vending: ["8,2","10,2","11,2"],
						}
					}),
					Floor(id(11)), // Elevator
				],
			}),
			Gym(id(), {
				leader: "Erika",
				leaderClass: 21,
				badge: "Rainbow",
				locOf: {
					leader: "5,3",
				},
			}),
		],
		connections: [ r(7), r(16) ],
	}),
	Route(16, id(21,2,79), {
		buildings: [
			House(id(23)),
			House(id(21,24,255), { name:"Cycling Road North Gatehouse", }),
		],
		connections: [ "Celedon City", r(17) ],
	}),
	Route(17, id(21,3,80), {
		connections: [ r(16) ],
	}),
	Gatehouse(id(21,26,255), r(17), r(18), {
		name: "Cycling Road South Gatehouse",
	}),
	Route(18, id(17,4,81), {
		connections: [ "Fuchsia City" ],
	}),
	City("Fuchsia City", id(17, 5, 82), {
		buildings: [
			PokeCenter(id(10)),
			PokeMart(id(6)),
			House(id(9)),
			House(id(12) { name:"Safari Zone Warden's House" }),
			House(id(7)), //Empty bar?
			Gym(id(8), {
				leader: "Janine",
				leaderClass: 26,
				badge: "Soul",
				locOf: {
					leader: "14,6",
				},
			}),
		],
		connections: [ r(18), r(19) ],
	}),
	Gatehouse(id(17,13,255), "Fuchsia City", r(15)),
	Gatehouse(id(6,3,255), "Fuchsia City", r(19)),
	Route(19, id(6,5,83), {
		connections: [ r(20) ],
	}),
	Route(20, id(6,6,84), {
		buildings: [
			Dungeon("Seafoam Islands", {
				floors: [
					Floor(id(6,4,85), { // Ice Island
						legendary: {
							name: "Articuno",
							loc: "8,14",
						},
					}),
					Floor(id(7,9,85), { // Heat Island
						legendary: {
							name: "Moltres",
							loc: "58,44",
						},
					}),
					Floor(id(7,5,85), { // Dark Island
						legendary: {
							name: "Zapdos",
							loc: "55,34",
						}
					})
				],
			}),
		],
		connections: [ r(19), "Cinnabar Island" ],
	}),
	Town("Cinnabar Island", id(6,8,86), {
		buildings: [
			PokeCenter(id(1)),
			Gym(id(2), {
				leader: "Blaine",
				leaderClass: 46,
				badge: "Volcano",
				locOf: {
					leader: "3,3",
				},
			}),
		],
		connections: [ r(20), r(21) ],
	}),
	Route(21, id(6,7,87), {
		connections: [ "Pallet Town", "Cinnabar Island" ],
	}),
	
];