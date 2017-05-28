// Unova (BW2)

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene,
} = require("../map.js");

// Defaults for this particular region
const Center = function(mapids, { attrs={}, locOf={}, connections=[], announce, }={}){
	if (!Array.isArray(mapids)) mapids = mapids;
	let me = new Node({ mapids, attrs:Object.assign({
		"indoors": true,
		"healing": true,
		"shopping": true,
		announce,
	}, attrs), locOf:Object.assign({
		"pc": ["4,12"],
	}, locOf) });
	me.addConnection(...connections);
	me.addConnection("Union Room");
	return me;
};
const PokeCenter = Center;

// Helper functions
function id( mapid, parentId, matrix=0 ) {
	return { mapid, parentId, matrix };
}
function gameSpecific(black, white) {
	if (global.game == "Black2") return black;
	return white;
}

// The region itself
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
						locOf: {
							leader: "", //TODO
						}
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
						locOf: {
							leader: id(30,28,274)],
						}
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
						locOf: {
							"leader": "", //TODO
						}
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
				locOf: {
					"leader": "", //TODO
				}
			}),
		],
		connections: [ "Driftveil Drawbridge", "Clay Tunnel", 6 ],
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
				connections: [ 6, id(370,506,302) ], // Clay Tunnel, and Route 6
			}),
			Floor(id(503,333,111)),
			Floor(id(504,333,112), {
				
			}), // Where Cobalion is located
		],
	}),
	Route(6, id(500,331), {
		buildings: [
			House(id(501,331,92), { name: "Seasons Research Lab" }), //Note: has a deerling giveaway
			House(id(505,331,44), { attrs: { "healing":"house", } }),
		],
		connections: [ "Driftveil City", "Chargestone Cave", id(502,333,110) ],
	}),
	Dungeon("Chargestone Cave", {
		floors: [
			Floor(id(243,194), {
				connections: [ 6, "Mistralton City" ],
				attrs: {
					"indoors": false,
					"dungeon": false,
				},
			}),
			Floor(id(244,194,23)),
			Floor(id(245,194,24)),
			Floor(id(246,195,25)),
		],
	}),
	City("Mistralton City", id(120, 107), {
		buildings: [
			PokeCenter(id(122,107,13)),
			Gym(id(121,107,62), {
				name: "Mistralton City Gym",
				leader: "Skyla",
				badge: "Jet",
				locOf: {
					leader: "", //TODO find location again
				}
			}),
			House(id(124,107,63), { name: "Mistralton Cargo Service", }), // Plane
			House(id(125,107,46)),
			House(id(123,107,46)),
		],
		connections: [ id(243,194), 7 ],
		locOf: { flySpot: "108,306" },
	}),
	Route(7, id(506,337), {
		buildings: [
			House(id(512,337,44)), // Trade Emolga for a Gigalith
			House(id(513,337,44), { attrs: {"healing":"house"} }),
		],
		connections: [ "Mistralton City", id(247,198),  ],
	}),
	Dungeon("Celestial Tower", {
		floors: [
			Floor(id(507,338,185)), // Base floor
			Floor(id(508,338,186)),
			Floor(id(509,338,187)),
			Floor(id(510,338,188)),
			Floor(id(511,338,189), {
				attrs: {
					"indoors": false,
				},
				announce: "We're at the top of Celestial Tower!",
			}),
		],
	}),
	Dungeon("Twist Mountain", {
		floors: [
			Floor(id(247,198), {
				connections: [ 7 ],
				attrs: {
					"indoors": false,
					"dungeon": false,
				}
			}),
			Floor(id(248,198,93), {
				attrs: {
					"indoors": false,
					"healing": "nurse",
				},
				locOf: {
					"healing":"50,38",
					"vending":["26,27","27,27"],
				},
			}),
			Floor(id(249,198,94)), // Floor 3
			Floor(id(250,198,95)), // Floor 2
			Floor(id(251,198,96), { // Floor 1
				connections: [ "Icirrus City" ],
			}),
			Floor(id(252,198,97), { // Floor BF1
				connections: [ id(371,506,303) ], // Clay Tunnel
			}),
			Floor(id(253,198,331), {
				attrs: { "legendary": "Regigigas" },
				locOf: { "legendary": "15,5", },
			}), // Regigiga's Room
		],
	}),
	City("Icirrus City", id(126,113), {
		locOf: { "flySpot":"184,197" },
		buildings: [
			PokeCenter(id(128,113,13)),
			House(id(129,113,46)),
			House(id(130,113,44), { announce: `We're in the quiz house! We're pounced on and force to answer a "Pep Quiz"!`, }),
			House(id(131,113,46)), // Unreachable other than Winter
			House(id(132,113,359), { name: "Pokemon Fan Club", }),
			Gym(id(127,113,64), {
				name: "Former Icirrus City Gym", // Memory Link here
				locOf: {
					"leader": "17,14",
				}
			}),
		],
		connections: [ id(251,198,96), id(255,205), 8 ], // Twist, Dragonspiral
	}),
	Dungeon("Dragonspiral Tower", {
		floors: [
			Floor(id(255,205), {
				connections: [ "Icirrus City" ],
				attrs: {
					"indoors": false,
					"dungeon": false,
				}
			}),
			Floor(id(256,205,208), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				}
			}),
			Floor(id(257,205,200)),
			Floor(id(258,205,201)),
			Floor(id(259,205,202)),
			Floor(id(260,205,203)),
			Floor(id(261,205,204)), // Spiral Room
			Floor(id(262,205,205)),
			Floor(id(263,205,206), {
				attrs: {
					"indoors": false,
					"legendary": gameSpecific("Zekrom", "Reshiram")
				},
				locOf: { "legendary": "16,10", },
			}),
		],
	}),
	Route(8, id(514,345), {
		connections: [ "Icirrus City", "Moor of Icirrus" ],
	}),
	Area("Moor of Icirrus", id(515,346,183), {
		connections: [ 8 ],
	}),
	Gatehouse(id(516,345,129), 8, "Tubeline Bridge"),
	Route("Tubeline Bridge", id(400,254,136), {
		connections: [ id(516,345,129) ],
	}),
	Gatehouse(id(518,348,129), "Tubeline Bridge", 9),
	Route(9, id(517,348), {
		buildings: [
			Building({
				name: "Shopping Mall Nine",
				floors: [
					Floor(id(519,348,90), {
						attrs: { "shopping": true, },
						locOf: {
							"shopping": ["7,16","9,10","7,3","9,3","21,10"],
							"vending": ["21,2","22,2","22,3"],
						}
					}),
					Floor(id(520,348,141)),
				],
			}),
		],
		locOf: {
			"vending": ["366,169","367,169","368,169","369,169"],
		},
	}),
	Gatehouse(id(144,348,50), 9, "Opelucid City"),
	City("Opelucid City", id(133,120), {
		buildings: [
			PokeCenter(id(135,120,13)),
			Gym(id(134,120,66), {
				name: "Opelucid City Gym",
				leader: "Dryden",
				badge: "Legend",
				locOf: {
					"leader": "15,18", //15,57,18
				},
			}),
			House([id(140,120,67),id(141,120,160)]),
			House([id(147,120,67),id(148,120,160)]),
			House([id(138,120,67),id(139,120,160)]),
			House([id(142,120,67),id(143,120,160)]),
			House([id(136,120,67),id(137,120,160)]), // Drayden's House
			
		],
		locOf: {
			"vending": ["428,178","429,178"],
		}
	}),
	Gatehouse(id(146,365,50), "Opelucid City", 11),
	Route(11, id(534,365), { // Viziron is here after the game ends...?
		buildings: [
			House(id(536,365,65)),
		],
	}),
	Gatehouse(id(535,365,50), 11, "Village Bridge"),
	Area("Village Bridge", id(401,255,182), {
		buildings: [
			House(id(407,255,44), attrs:{ "healing":"house", }),
			House(id(406,255,44)),
			House(id(404,255,44)),
			House(id(405,255,44)),
			House(id(403,255,44)),
			House(id(402,255,44)),
		],
		locOf: {
			"vending": ["5,12","6,12"],
		},
	}),
	Gatehouse(id(538,368,50), "Village Bridge", 12),
	Route(12, id(537,368), {
		connections: [ "Lacunosa Town" ],
	}),
	Town("Lacunosa Town", id(583,406), {
		buildings: [
			House(id(585,406,47)),
			
		],
		connections: [ 12 ],
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

Unova.resolve();