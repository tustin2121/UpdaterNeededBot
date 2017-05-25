// Unova (BW2)

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Center, PokeCenter, Gym,
	Cutscene,
} = require("../map.js");

function id( mapid, parentId, matrix=0 ) {
	return { mapid, parentId, matrix };
}

const Unova = module.exports =
new Region({ name:"Unova", mapid:"ds" }, [
	City("Aspertia City", id(163,427), {
		buildings: [
			House(id(167,427,257), {
				name: "${Player}'s House",
				locOf: { "healing":"4,5", },
			}),
			House([id(170,427,406), id(171,427,262)]),
			House([id(168,427,406), id(169,427,258)], {
				name:"${Rival}'s House",
			}),
			Building({
				name: "Trainer's School",
				floors: [
					Floor(id(164,427,51)),
					Gym(id(165,427,275), {
						name: "Aspertia Pokémon Gym",
						leader: "Cheren",
						badge: "Basic",
					}),
				],
			}),
			PokeCenter(id(166,427,13)),
			House([id(172,427,406), id(173,427,262)]),
		],
	}),
	Gatehouse(id(559,437,12), "Aspertia City", 19),
	Route(19, id(558, 437), {
		connections: [ "Floccesy Town" ],
	}),
	Town("Floccesy Town", id(), {
		buildings: [
			PokeCenter(id(600,439,13)),
			House(id(602,439,261)),
			House(id(603,439,261)),
			House(id(601,439,259), { name: "Alder's House", }),
		],
		connections: [ 19, 20 ],
	}),
	Route(20, id(560,446), {
		connections: [ "Floccesy Town", "Floccesy Ranch" ],
	}),
	Area("Floccesy Ranch", [id(305,444), id(306,444,255)], {
		
	}),
	Gatehouse(id(561,446,50), "Virbank City", 20),
	City("Virbank City", id(174,448), {
		buildings: [
			PokeCenter(id(177,448,13)),
			House(id(178,448,261)),
			House(id(181,448,260),{
				name: "Virbank Port",
				connections: [ id(566,389,260) ],
			}),
			Gym([id(175,448,55), id(176,448,120)], {
				name: "Virbank City Gym",
				leader: "Roxie",
				badge: "Toxic",
			}),
			House(id(179,448,358), {
				name: "Virbank Daycare",
			}),
		],
		connections: [ id(307,456) ],
	}),
	Area("Virbank Complex", [id(307,456), id(308,456,256)], {
		noteworthy: true,
		connections: [ "Virbank City" ],
	}),
	Gatehouse(id(182,448,12), "Virbank City", "Pokestar Studios"),
	Town("Pokestar Studios", id(192,566,380), {
		buildings: [
			Building({
				name: "Sound Stage",
				floors:[
					Floor(id(194,566,360), { // Lobby
						locOf: { pc:"18,13", },
					}),
					Floor(id(193,566,361)), // Sound stage
				],
			}),
			Building({
				name: "Theater",
				floors:[
					Floor(id(195,566,362), {
						locOf: { vending:["7,25","28,3","27,3"] },
					}),
				],
			})
		],
	}),
	
	
	City("Castelia City", id(28, 28, 132), {
		buildings: [
			PokeCenter(id(44,28,13)),
			Area("Prime Pier", id(39,28,9), {
				connections: [ id(181,448,260) ],
			}),
			Area("Cruise Ship Dock", id(40,28,10), {
				connections: [ id(55,23,179) ],
			}),
			Area("Unity Pier", id(38,28,8)),
			Area("Liberty Pier", id(37,28,7), {
				connections: [ "Liberty Garden" ],
			}),
			Area("Thumb Pier". id(41,28,11), {
				connections: [ id(286,495,293) ],
			}),
			House(id(45,28,177),{
				name: "Passerby Analytics HQ",
			}),
			Building({
				name: "Battle Company",
				floors: [
					Floor(id(47,28,33)), // Lobby
					Floor(id(48,28,34)), // Floor 47
					Floor(id(49,28,43)), // Floor 55
				],
			}),
			Area("Centra Plaza", id(31,28,1), {
				locOf: {
					vending: ["20,5","21,5","22,5","23,5"],
				},
			}),
			Area("Castelia Street", id(35,28,5), {
				locOf: {
					vending: ["5,41", "6,41"],
				},
				buildings: [
					House([id(50,28,243), id(51,28,43)], { name: "GAME FREAK", }), //Floor 1, 22
					House([id(57,28,33), id(58,28,43)]), //Floor 1, 11
				],
			}),
			Area("Mode Street", id(34,28,4), {
				attrs: {
					"shopping": true, // Ice Creame Store
				},
				buildings: [
					House(id(46,28,48), { name: "Studio Castelia", }),
				],
			}),
			Area("Narrow Street", id(36,28,6), {
				buildings: [
					House(id(56,28,192), { name: "Café Sonata", }),
				],
			}),
			Area("Gym Street", id(32,28,2), {
				buildings: [
					Building({
						floors:[
							Floor(id(59,28,33)), // Floor 1
							Floor(id(60,28,290)), // Floor 2: Medal Hut
							Floor(id(61,28,291), { // Floor 3: Fennel's lab
								locOf: { pc: "9,8", },
							}),
						],
					}), //Floor 1, 2, 3
					Gym([id(29,28,56), id(30,28,274)], {
						name: "Castelia City Gym",
						leader: "Burgh",
						badge: "Insect",
					}),
				],
			}),
			Area("North Street", id(33,28,3), {
				locOf: {
					vending: ["10,18","11,18"],
				},
				buildings: [
					House([id(64,28,33),id(55,28,34)]), //Floor 1, 47
					House([id(52,28,33),id(53,28,43)]), //Floor 1, 11
					House([id(62,28,33),id(63,28,34)]), //Floor 1, 47
				],
			}),
		],
	}),
	Area("Liberty Garden", id(291,235), {
		locOf: {
			vending: ["292,757","291,757"],
		},
		buildings: [
			House([id(292,235,239), id(293,235,240)], {
				name: "Lighthouse",
			}),
		],
	}),
	Dungeon("Castelia Sewers", id(286,495,293), {
		attrs: { }, //TODO Explore
	}),
	Building({
		name: "The Royal Unova",
		floors: [
			Cutscene(id(41,28,179), { // Cutscene: Royal Unova Pulling out of Dock
			}),
			Floor(id(55,23,179)), // Trainers Deck (The Cabins are all on the same map)
			Cutscene(id(566,389,179), {
				name: "Royal Unova's Observation Deck",
			}),
		],
		announce: "We've boarded the Royal Unova! And the ship is now leaving port!",
	}),
	
	
	Gatehouse(id(398,249,138), "Castelia City", id(395,249,133)),
	Route("Skyarrow Bridge", id(395,249,133), {
		buildings: [
			House(id(397,249,137)), // The Pinwheel-side gatehouse
			House(id(396,249,41), { // The pinwheel-side overlook
				connections: [ id(204,154,16) ],
			}),
		],
	}),
	Dungeon("Pinwheel Forest", {
		floors: [
			Floor(id(204,154,16), {
				connections: [ id(396,249,41) ],
			}),
			// TODO this branch
		],
	}),
	
	
	Gatehouse(id(54,326,139), "North Street", 4),
	Route(4, id(497,326),{
		buildings: [
			House(id(496,326,396)),
			House(id(495,326,396)),
			House(id(494,326,396)),
			House(id(493,326,396)),
			House(id(492,326,396)),
		],
		connections: [ "Desert Resort", "Join Avenue" ],
	}),
	Area("Desert Resort", [id(206,157)], {
		buildings: [
			House(id(208,157,12)), // Gatehouse
			Dungeon("Relic Castle",{
				floors: [
					Floor(id(209,160,17)),
					Floor(id(210,160,18)),
				],
			}),
		],
		zones: [
			Area("Desert Resort", id(207,157,103), {
				locOf: { "healing": ["81,74"], },
			})
		],
	}),
	Area("Join Avenue", id(197,490,376), {
		attrs: {
			"shopping": true,
		},
		buildings: [
			House(id(198,490,375), {
				locOf: { pc: "10,4", },
			}),
		],
		connections: [ 4, "Nimbasa City" ],
	}),
	
	
	City("Nimbasa City", id(66,62), {
		buildings: [
			PokeCenter(id(69,62,13)),
			House(id(97,62,241), {
				name: "Battle Institute",
				locOf: { pc: "9,10", }
			}),
			House([id(92,62,26), id(93,62,27)]),
			House([id(98,62,26), id(99,62,27)]),
			House([id(88,62,99), id(89,62,223), id(91,62,220)], {name:"Nimbasa City's Small Court"}),
			House([id(83,62,98), id(84,62,221), id(86,62,222)], {name:"Nimbasa City's Big Stadium"}),
			House([id(81,62,58)], {
				name:"Musical Theater",
				locOf: {
					pc: "21,12",
					vending: ["25,10","26,10"],
				},
				connections: [ id(82,62,116) ],
			}),
			Cutscene(id(82,62,116), {
				name: "Musical Stage",
				announce: "We've decided to participate in a musical!",
				connections: ["Musical Theater"],
			}),
			
			Building({
				name: "Gear Station",
				floors: [
					Floor(id(70,62,101), { name: "Gear Station", }),
					//TODO The trains
				],
			}),
			Area("Nimbasa City Amusement Park", id(68,62,107), {
				locOf: {
					vending: ["45,12","46,12","47,12","48,12","62,12","63,12"],
				},
				buildings: [
					House(id(100,62,379), {name:"Shining Rollar Coaster"}),
					Cutscene(id(566,389,107), {
						name: "Rondez-View Ferris Wheel",
						announce: "We took a break to ride on the ferris wheel...",
					}),
					Gym(id(67,62,57), {
						name: "Nimbasa City Gym",
						leader: "Elesa",
						badge: "Bolt",
					}),
				],
			}),
		],
	}),
	
	Gatehouse(id(95,329,50), "Nimbasa City", 5),
	Route(5, id(498,329), {
		buildings: [
			House(id(499,329,65)),
		],
		connections: [ "Driftbeil Drawbridge" ],
	}),
	Route("Driftveil Drawbridge", id(399,253,106), {
		connections: [ 5, "Driftveil City" ],
	}),
	City("Driftveil City", id(101,96), {
		buildings: [
			PokeCenter(id(104,96,13)),
			House([id(105,96,319), id(106,96,321), id(107,96,321)], { name: "Driftveil Chateau Hotel" }), //Floor 1, 11, 25
			House([id(108,96,319), id(109,96,320), id(110,96,320)], { name: "Grand Hotel Driftveil" }), //Floor 1, 14, 19
			House([id(111,96,319), id(112,96,320), id(113,96,321)], { name: "Driftveil Luxury Suites" }), //Floor 1, 29, 23
			House([id(114,96,319), id(115,96,320), id(116,96,321)], { name: "Driftveil Continental Hotel" }), // Floor 1, 23, 25
			House(id(118,96,214), { name: "Driftveil Market" }),
			House(id(117,96,59)),
			Gym([id(103,96,180), id(102,96,61)], {
				name: "Driftveil City Gym",
				leader: "Clay",
				badge: "Quake",
			}),
		],
		connections: [ "Driftveil Drawbridge", "Clay Tunnel" ],
	}),
	Dungeon("Clay Tunnel", {
		floors: [
			Floor(id(369,506,301)),
			Floor(id(370,506,302), {  //Behind a Rock Smash wall
				connections: [ id(502,333,110) ], // Mistralton Cave
			}),
			Floor(id(371,506,303), {  //Behind a Strength wall
				connections: [ id(252,198,97) ], // Twist Mountain
			}),
			Floor(id(372,506,351)), // Door which leads to different places whether sun is up
			Floor(id(373,506,409)), // Sun place = Rock Golem's Chambers
		],
	}),
	
	
	Dungeon("Mistralton Cave", {
		floors: [
			Floor(id(502,333,110), {
				connections: [ id(370,506,302) ], // Clay Tunnel
			}),
		],
	}),
	
	Dungeon("Twist Mountain", {
		floors: [
			Floor(id(252,198,97), {
				connections: [ id(371,506,303) ], // Clay Runnel
			}),
		],
	}),
	
	Area("Cave of Being", id(), {
		
	}),
	
]);


// Other areas that are not part of the main map
Unova.addNode(...[
	Area("Entralink", id(435,279,117), {
		zones: [
			Area("Entree Forest", [
				id(436,279,119),
				id(437,279,228),
				id(439,279,230),
				id(438,279,229),
				id(441,279,232),
				id(443,279,234),
				id(444,279,235),
			])
		],
		announce: "And we dive into the Entralink...!",
	}),
	Area("Union Room", id(609,422,88)), // Connection from any Pokecenter
	
	// Boat transition from Virbank to Castelia. There's no such transition back.
	Cutscene(id(566,389,260), {
		announce: "We take a ferry to Castelia City!",
		connections: [ id(39,28,9) ],
	})
]);
