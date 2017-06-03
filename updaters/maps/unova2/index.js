// Unova (BW2)

const fs = require('fs');
const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
} = require("../map.js");

// Defaults for this particular region
const Center = function(mapids, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
	if (!Array.isArray(mapids)) mapids = [mapids];
	let me = new Node({ name:"Pokémon Center", mapids, attrs:Object.assign({
		"indoors": true,
		"healing": "pokecenter"
		"shopping": true,
		announce, the,
	}, attrs), locOf:Object.assign({
		"pc": ["4,12"],
	}, locOf) });
	me.addConnection(...connections);
	me.addConnection("Union Room");
	me._typename = "Center";
	return me;
};
const PokeCenter = Center;

// Gear Station Train Lines
const TrainLine = function(type, boarding_id) {
	let boarding = new Node({
		name: `Platform for ${type} Trains`,
		mapids:[id(boarding_id,62,165)],
		attrs:{
			"the": true,
			"subway":"lobby",
			"indoors": true,
			"shopping": true,
		},
		locOf: { "pc": ["5,11"], },
	});
	boarding._typename = "TrainLine";
	return boarding;
};

// The game's header table
const HEADER = (()=>{
	let file = fs.readFileSync(require.resolve('./MapHeaders.tsv'), { encoding:'utf8'});
	let reverse = {};
	let rows = file.split('\n').map((r, idx)=>{
		let x = r.split('\t').map((v, i)=>{
			if (i === 15) return v; // Area Name
			return Number(v);
		});
		x.matrix = x[3];
		x.mapid = x[13];
		x.parentid = x[14];
		x.name = x[15];
		x.fly_x = x[24];
		x.fly_z = x[26];
		x.index = idx;
		reverse[`${x.mapid}:${x.parentid}:${x.matrix}`] = idx;
		return x;
	});
	rows.reverse = reverse;
	return rows;
})();

// Helper functions
function id( mapid, parentId, matrix=0 ) {
	let d = HEADER.reverse[`${mapid}:${parentId}:${matrix}`];
	// console.log(`${mapid}:${parentId}:${matrix} => ${d}`);
	if (!d) return `${mapid}:${parentId}:${matrix}`;
	return `${d}`;
	// return { mapid, parentId, matrix };
}
function gameSpecific(black, white) {
	if (global.game == "Black2") return black;
	return white;
}

// The region itself
const Unova = module.exports =
new Region({ name:"Unova", mapid:"identity" }, [
	City("Aspertia City", id(163,427), {
		buildings: [
			House(id(167,427,257), {
				name: "Player's House",
				locOf: { "healing":"4,5", },
			}),
			House([id(170,427,406), id(171,427,262)]),
			House([id(168,427,406), id(169,427,258)], {
				name:"Rival's House",
			}),
			Building({
				name: "Trainer's School",
				floors: [
					Floor(id(164,427,51)),
					Gym(id(165,427,275), {
						name: "Aspertia Pokémon Gym",
						leader: "Cheren",
						badge: "Basic",
						locOf: { leader: "15,2", }
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
	Town("Floccesy Town", id(599,439), {
		buildings: [
			PokeCenter(id(600,439,13)),
			House(id(602,439,261)),
			House(id(603,439,261)),
			House(id(601,439,259), { name: "Alder's House", }),
			Area("Pledge Grove", id(604,439,414)),
		],
		connections: [ 19, 20 ],
	}),
	Route(20, id(560,446), {
		connections: [ "Floccesy Town", "Floccesy Ranch", "Cave of Being" ],
	}),
	Area("Cave of Being", id(392,517,310)), // Come here to unlock Uxie, Mesprit, and the other one
	Area("Floccesy Ranch", [id(305,444), id(306,444,255)], {
		the: false,
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
				locOf: { leader: id(176,448,120), }
			}),
			House(id(179,448,358), {
				name: "Virbank Daycare",
			}),
		],
		connections: [ id(307,456) ],
	}),
	Area("Virbank Complex", [id(307,456), id(308,456,256)], {
		noteworthy: true,
		the: false,
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
				connections: [ id(55,28,179) ],
			}),
			Area("Unity Pier", id(38,28,8)),
			Area("Liberty Pier", id(37,28,7), {
				connections: [ "Liberty Garden" ],
			}),
			Area("Thumb Pier", id(41,28,11), {
				connections: [ id(286,495,293) ], // Sewers
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
			Area("Central Plaza", id(31,28,1), {
				locOf: {
					vending: ["20,5","21,5","22,5","23,5"],
				},
			}),
			Area("Castelia Street", id(35,28,5), {
				the: false,
				locOf: {
					vending: ["5,41", "6,41"],
				},
				buildings: [
					House([id(50,28,243), id(51,28,43)], { name: "GAME FREAK", }), //Floor 1, 22
					House([id(57,28,33), id(58,28,43)]), //Floor 1, 11
				],
			}),
			Area("Mode Street", id(34,28,4), {
				the: false,
				attrs: {
					"shopping": true, // Ice Creame Store
				},
				buildings: [
					House(id(46,28,48), { name: "Studio Castelia", }),
				],
			}),
			Area("Narrow Street", id(36,28,6), {
				the: false,
				buildings: [
					House(id(56,28,192), { name: "Café Sonata", }),
				],
			}),
			Area("Gym Street", id(32,28,2), {
				the: false,
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
						locOf: { leader: id(30,28,274), }
					}),
				],
			}),
			Area("North Street", id(33,28,3), {
				the: false,
				locOf: {
					vending: ["10,18","11,18"],
				},
				buildings: [
					House([id(64,28,33),id(65,28,34)]), //Floor 1, 47
					House([id(52,28,33),id(53,28,43)]), //Floor 1, 11
					House([id(62,28,33),id(63,28,34)]), //Floor 1, 47
				],
			}),
			Area("Origin Square", id(42,28,296), {
				the: false,
				announce: "We surface in a small forgotten square in the middle of Castelia, where a lone tree stands...",
				connections: [ id(286,495,293) ], // Sewers
			}),
			Area("Castelia Back Alley", id(43,28,297), {
				the: 'a',
				announce: "We surface in a Castelia back alley... some people are dancing at the far end...",
				connections: [ id(286,495,293) ], // Sewers
			}),
		],
	}),
	Area("Liberty Garden", id(291,235), {
		the: false,
		locOf: {
			vending: ["292,757","291,757"],
		},
		buildings: [
			House([id(292,235,239), id(293,235,240)], {
				name: "Lighthouse",
			}),
		],
	}),
	Dungeon("Castelia Sewers", {
		floors: [
			Floor(id(286,495,293), {
				attrs: { healing: "doctor", },
				locOf: { healing: "25,32", },
				connections: [ "Thumb Pier", "Origin Square", "Castelia Back Alley", id(366,503,298) ], // Relic Passage
			}),
			Floor(id(290,495,295)),
			Floor(id(289,495,295)),
			Floor(id(287,495,294)),
			Floor(id(288,495,294)),
		],
		attrs: { }, //TODO Explore
	}),
	Building({
		the: false,
		name: "The Royal Unova",
		floors: [
			Cutscene(id(41,28,179), { // Cutscene: Royal Unova Pulling out of Dock
			}),
			Floor(id(55,28,179)), // Trainers Deck (The Cabins are all on the same map)
			Cutscene(id(566,389,179), { // No header index
				name: "Royal Unova's Observation Deck",
			}),
		],
		announce: "We've boarded the Royal Unova! And the ship is now leaving port!",
	}),
	
	Dungeon("Relic Passage", {
		floors: [
			Floor(id(366,503,298), { // South
				connections: [ id(286,495,293) ],
			}),
			Floor(id(367,503,299), { // Center
				connections: [ id(229,160,74) ],
			}),
			Floor(id(368,503,300), { // North
				connections: [ "PWT Plaza" ],
			}),
		],
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
		attrs: {
			"indoors": false,
		},
		floors: [
			Floor(id(204,154,16), {
				connections: [ id(396,249,41) ],
			}),
			Floor(id(205,154,224), { name:"Rumination Field" }),
			Floor(id(203,154), {
				attrs: { "dungeon": false, },
				connections: [ "Nacrene City" ],
			})
		],
	}),
	City("Nacrene City", id(16,16), {
		buildings: [
			PokeCenter(id(20,16,13)),
			House(id(26,16,30), { name:"Café Warehouse", }),
			House([id(17,16,52),id(18,16,377),id(19,16,378)], { name:"Nacrene Museum" }),
			House(id(22,16,31)),
			House(id(21,16,169)),
			House(id(23,16,31)),
			House(id(24,16,31), { attrs:{ "shopping":true } }),
			House(id(25,16,49)),
		],
		connections: [ id(203,154) ],
		attrs: { "flySpot":"637,599" },
	}),
	Gatehouse(id(27,321,50), "Nacrene City", 3),
	Route(3, id(477,321), {
		buildings: [
			House(id(479,321,28),{
				name: "Pokémon Daycare",
				locOf: { "pc":"9,9" },
			}),
			House(id(478,321,53), { attrs:{ "healing":"house", }}), // People Daycare
		],
		connections: [ "Striaton City" ],
	}),
	Dungeon("Wellspring Cave", {
		floors: [
			Floor(id(480,324,108)),
			Floor(id(481,324,109)),
		],
	}),
	City("Striaton City", id(6,6), {
		buildings: [
			PokeCenter(id(8,6,13)),
			House(id(7,6,374)), // Restaraunt
			House(id(15,6,29)), // Trainer's School
			House(id(9,6,26)), House(id(10,6,134), { locOf:{"pc":"7,7"} }), // Fennels Lab
			House([id(11,6,26),id(12,6,27)]),
			House([id(13,6,26),id(14,6,32)]),
		],
		connections: [ 3, 2 ],
	}),
	Route(2, id(475,319), {
		
	}),
	Gatehouse(id(476,319,50), "Accumula Town", 2),
	Town("Accumula Town", id(574,397), {
		buildings: [
			PokeCenter(id(575,397,13)),
			House([id(580,397,26), id(581,397,32)]),
			House([id(578,397,26), id(579,397,27)]),
			House([id(576,397,26), id(577,397,27)]),
			House(id(582,397,45)),
		],
		connections: [ 1 ],
	}),
	Route(1, id(473,317), {
		connections: [ "Accumula Town", "Nuvema Town"],
	}),
	Town("Nuvema Town", id(566,389), {
		buildings: [
			House(id(573,389,42), { name:"Juniper Pokémon Lab" }),
			House([id(567,389,39),id(568,389,40)], { name:"Previous Protagonist's House", attrs: {"healing":"house"} }),
			House([id(569,389,37),id(570,389,38)]),
			House([id(571,389,35),id(572,389,36)]),
		],
		connections: [ 1 ],
	}),
	Gatehouse(id(474,317,50), 17, 1),
	Route(17, id(610,423), {
		buildings: [
			Area("Plasma Frigate", id(294,238), { // Final resting place of the Plasma Frigate
				buildings: [
					House(id(295,238,191)),
				],
				connections: [ "Plasma Frigate" ],
			}),
		],
		connections: [ 18 ],
	}),
	Route(18, id(556,387), {
		buildings: [
			House(id(557,387,91)),
		],
		connections: [ 17 ],
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
					Floor(id(229,160,74),{
						connections: [ id(367,503,299) ], // Relic Passage
					}),
					Floor(id(224,160,72)),
					Floor(id(230,160,75)),
					Floor(id(225,160,72)),
					Floor(id(227,160,73)),
					Floor(id(231,160,76), {
						legendary: {
							name: "Volcarona",
							loc: "16,5",
							level: 65,
						},
					}),
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
		the: false,
		attrs: {
			"shopping": true,
			"indoors": true,
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
				the: false,
				name: "Gear Station",
				floors: [
					Floor(id(70,62,101), { name: "Gear Station", }),
					TrainLine("Wi-Fi", 77),
					TrainLine("Multi", 75),
					TrainLine("Super Multi", 76),
					TrainLine("Super Double", 74),
					TrainLine("Double", 73),
					TrainLine("Super Single", 72),
					TrainLine("Single", 71),
					
					Floor(id(79,62,167), {
						name: "Subway Train",
						attrs:{
							"subway":"train",
							"shopping": false,
						},
					}),
					Floor(id(80,62,166), {
						name: "Midway Platform",
						attrs:{
							"subway":"midway",
						},
						locOf: { "vending": "42,16", },
					}),
					
					Floor(id(78,62,165), {
						name: `Platform for the train to Anville Town`,
						locOf: { "pc":"5,11", },
						connections: [ "Anville Town" ],
					}),
				],
			}),
			Area("Nimbasa City Amusement Park", id(68,62,107), {
				locOf: {
					vending: ["45,12","46,12","47,12","48,12","62,12","63,12"],
				},
				buildings: [
					House(id(100,62,379), {name:"Shining Rollar Coaster"}),
					Cutscene(id(566,389,107), { // No Header index
						name: "Rondez-View Ferris Wheel",
						announce: "We took a break to ride on the ferris wheel...",
					}),
					Gym(id(67,62,57), {
						name: "Nimbasa City Gym",
						leader: "Elesa",
						badge: "Bolt",
						locOf: { "leader": "15,6", }
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
		connections: [ "Driftveil Drawbridge" ],
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
			House(id(118,96,60), { name: "Driftveil Market" }),
			House(id(117,96,59)),
			Gym([id(103,96,180), id(102,96,61)], {
				name: "Driftveil City Gym",
				leader: "Clay",
				badge: "Quake",
				locOf: { leader: "46,19", }
			}),
		],
		connections: [ "Driftveil Drawbridge", "Clay Tunnel", 6 ],
	}),
	Gatehouse(id(119,96,373), "PWT Plaza", "Driftveil City", {
		locOf: { "vending":["8,3","8,4"], },
	}),
	Area("PWT Plaza", id(240,191), {
		buildings: [
			Building("Pokémon World Tournament", {
				floors: [
					Floor(id(241,191,265), {
						locOf: {
							"vending":["25,24","26,24"],
							"pc":"17,7",
						}
					}), // Main entrance
					Floor(id(242,191,266), {
						announce: "**We've entered the Pokémon World Tournament's Arena! Time to battle!**"
					})
				],
			})
		],
		locOf: {
			"vending":["204,454","205,454","206,454","207,454"],
		},
		connections: [ id(368,503,300) ], // Relic Passage
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
			Floor(id(246,194,25)),
		],
	}),
	City("Mistralton City", id(120, 107), {
		buildings: [
			PokeCenter(id(122,107,13)),
			Gym(id(121,107,62), {
				name: "Mistralton City Gym",
				leader: "Skyla",
				badge: "Jet",
				locOf: { leader: "11,3", }
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
			Floor(id(253,198,311), {
				legendary: {
					name: "Regigigas",
					loc: "15,5",
				}
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
			House(id(132,113,359), { name: "Pokémon Fan Club", }),
			House(id(127,113,64), {
				name: "Former Icirrus City Gym", // Memory Link here
				locOf: { leader: "17,14", }
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
				},
				legendary: {
					name: gameSpecific("Zekrom", "Reshiram"),
					loc: "16,10",
				}
			}),
		],
	}),
	Route(8, id(514,345), {
		connections: [ "Icirrus City", "Moor of Icirrus" ],
	}),
	Area("Moor of Icirrus", id(515,346,183), {
		connections: [ 8 ],
	}),
	Gatehouse(id(516,345,129), "Tubeline Bridge", 8),
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
	Gatehouse(id(144,348,50), "Opelucid City", 9),
	City("Opelucid City", id(133,120), {
		buildings: [
			PokeCenter(id(135,120,13)),
			Gym(id(134,120,66), {
				name: "Opelucid City Gym",
				leader: "Dryden",
				badge: "Legend",
				locOf: { "leader": "15,18,57", },
			}),
			House([id(140,120,68),id(141,120,161)]),
			House([id(147,120,68),id(148,120,161)]),
			House([id(138,120,68),id(139,120,161)]),
			House([id(142,120,68),id(143,120,161)]),
			House([id(136,120,68),id(137,120,161)]), // Drayden's House
			
		],
		locOf: {
			"flySpot": "425,174",
			"vending": ["428,178","429,178"],
		}
	}),
	Gatehouse(id(146,365,50), "Opelucid City", 11),
	Route(11, id(534,365), { // Viziron is here after the game ends...?
		buildings: [
			House(id(536,365,65)),
		],
		legendary: {
			name: "Virizion",
			loc: "", //TODO
			requirement: "",
		}
	}),
	Gatehouse(id(535,365,50), "Village Bridge", 11),
	Area("Village Bridge", id(401,255,182), {
		buildings: [
			House(id(407,255,44), { attrs:{ "healing":"house" } }),
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
			PokeCenter(id(584,406,13)),
			House(id(585,406,47)),
			House(id(586,406,47)),
			House(id(587,406,47)),
			House(id(588,406,47)),
			
		],
		locOf: {
			"vending": ["665,177","666,177"],
			"flySpot": "660,186",
		},
		connections: [ 12, 13 ],
	}),
	Route(13, id(539,370), { // Cobold is here after the game ends...? "684,190"
		buildings: [
			House(id(540,370,47)),
			House(id(542,370,47)),
		],
		connections: [ "Lacunosa Town", "Giant Chasm" ],
	}),
	Dungeon("Giant Chasm", {
		the: true,
		floors: [
			Floor(id(280,230), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				}
			}),
			Floor(id(281,230,184), {
				connections: [ 23, 22 ],
			}),
			Floor(id(282,230,250), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				}
			}),
			Floor(id(284,230,252)),
			Floor(id(285,230,397), {
				legendary: {
					name: "Kyurem",
					loc: "15,15",
					requirement: "catch:"+gameSpecific("Zekrom", "Reshiram"),
				}
			}),
		],
		connections: [ 13 ],
	}),
	Route(22, id(562,474), { // Terrakon is just hanging out here...? "725,139"
		connections: [ id(281,230,184), id(333,573,337) ], // Giant Chasm, Victory Road
	}),
	Route(23, id(563,475), {
		buildings: [
			House(id(564,475,44), { attrs:{ "healing":"house" }, }),
			House(id(565,475,44)),
		],
		connections: [ id(281,230,184) ],
	}),
	Gatehouse(id(541,370,12), "Undella Town", 13),
	Town("Undella Town", id(589,412), {
		buildings: [
			PokeCenter(id(590,412,13)),
			House(id(593,412,44)),
			House(id(592,412,44)),
			House(id(591,412,271), {
				name:"Marine Tube",
				attrs: { "vending":"8,4" },
			}),
		],
		locOf: {
			"flySpot": "760,301",
		},
		connections: [ id(321,461,333), "Undella Bay", 14 ], // Reversal Mountan
	}),
	Gatehouse(id(411,464,273), id(591,412,271), id(191,465,272), {
		the: true,
		name: "Marine Tube",
	}),
	City("Humilau City", id(183,465), {
		buildings: [
			PokeCenter(id(185,465,13)),
			Gym(id(184,465,336), {
				name: "Humilau City Gym",
				leader: "Marlon",
				badge: "Wave",
				locOf: { leader: "16,5", }
			}),
			House(id(191,465,272), {
				name:"Marine Tube",
				attrs: { "vending":"14,4" },
			}),
			House(id(186,465,264)),
			House(id(189,465,264)),
			House(id(187,465,264)),
			House(id(188,465,264)),
			House(id(190,465,264)),
		],
		connections: [ 22, 21 ],
	}),
	Route(21, id(611,463), {
		connections: [ "Seaside Cave", "Humilau City" ],
	}),
	Dungeon("Seaside Cave", {
		floors: [
			Floor(id(390,515,312)),
			Floor(id(391,515,313)),
		],
		connections: [ "Undella Bay", 21 ],
	}),
	Route("Undella Bay", id(296,240), {
		connections: [ "Seaside Cave", "Abyssal Ruins" ],
	}),
	Dungeon("Abyssal Ruins", {
		the: true,
		floors: [
			Floor(id(298,241,244), {
				connections: [ "Undella Bay" ],
			}),
			Floor(id(301,241,247)),
			Floor(id(302,241,248)), // Assumption
			Floor(id(303,241,249)), // Assumption
			Floor(id(304,241,254)), // Assumption
		],
	}),
	Dungeon("Reversal Mountain", {
		floors: [
			Floor(id(321,461,333), {
				connections: [ "Undella Town" ],
			}),
			Floor(id(318,461,328), {
				attrs: { "healing":"doctor" },
				locOf: { "healing":"42,54" },
			}),
			Floor(id(319,461,331), {
				legendary: {
					name: "Heatran",
					loc: "10,13",
					requirement: "has:Magma Stone",
				}
			}),
			Floor(id(320,461,332)),
			Floor(id(316,461,330)),
			Floor(id(309,461), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				},
				connections: [ "Lentimas Town" ],
			}),
		],
	}),
	Town("Lentimas Town", id(605,458), {
		buildings: [
			PokeCenter(id(606,458,13)),
			House(id(607,458,263)),
			House(id(608,458,263)),
		],
		connections: [ id(309,461), "Mistralton City" ],
	}),
	Route(14, id(543,374), {
		connections: [ "Undella Town", "Abundant Shrine" ],
	}),
	Area("Abundant Shrine", id(545,376,190), {
		the: true,
		buildings: [
			House(id(546,376,46)),
		],
		connections: [ 14 ],
	}),
	Gatehouse(id(544,374,12), "White Forest", 14),
	City("White Forest", id(612,424,356), {
		attrs: {
			"shopping": true,
		},
		buildings: [
			PokeCenter(id(613,424,13)),
			Area("White Treehollow", id(378,478,278), {
				zones: [
					Floor(id(380,478,280)),
					Floor(id(381,478,281)), // Assumed
					Floor(id(382,478,282)), // Assumed
					Floor(id(383,478,283)), // Assumed
					Floor(id(384,478,284)), // Assumed
					Floor(id(385,478,285)), // Assumed
					Floor(id(386,478,286)), // Assumed
					Floor(id(387,478,287)), // Assumed
					Floor(id(388,478,288)),
				],
				locOf: {
					"pc": "2,8",
				},
			}),
			House(id(614,424,44)),
		],
	}),
	Gatehouse(id(548,378,50), "White Forest", 15),
	Route(15, id(547,378), {
		locOf: {
			"vending": ["602,426","603,426"],
		},
		buildings: [
			House(id(550,381,140), {
				name:"Pokémon Transfer Lab",
				locOf: {
					"pc":"7,8",
				},
			}),
			House(id(551,378,65)),
		],
	}),
	Gatehouse(id(549,378,131), "Marvelous Bridge", 15, {
		locOf: {
			"vending": "9,5",
		}
	}),
	Route("Marvelous Bridge", id(410,263,135), { // Cresselia is here after Lunar Wing "130,33"
		
	}),
	Gatehouse(id(553,383,130), "Marvelous Bridge", 16, {
		locOf: {
			"vending": "13,7",
		}
	}),
	Route(16, id(552,383), {
		buildings: [
			Area("Lostlorn Forest", id(554,385,238), {
				
			}),
		],
	}),
	Gatehouse(id(96,383,50), "Nimbasa City", 16),
	
	Town("Anville Town", id(595,418,128), {
		buildings: [
			House(id(596,418,46)),
			House(id(597,418,46)),
			House(id(598,418,46)),
		],
		connections: [ id(78,62,165) ],
	}),
	
	
	Dungeon("Victory Road", {
		floors: [
			Area("Badge Check", id(333,573,337), { // Badge Check lane
				attrs: {
					"indoors": false,
					"dungeon": false,
				},
				buildings: [
					PokeCenter(id(332,573,54), {
						locOf: { "pc":"4,12", },
					}),
				],
				locOf: {
					"flySpot":"43,18",
				},
			}),
			Floor(id(341,573,389)),
			Floor(id(335,573,383), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				},
			}),
			Floor(id(342,573,390), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				},
			}),
			Floor(id(343,573,391), { // Bridge to N's Castle
				connections: [ id(421,264,171) ],
			}),
			Floor(id(340,573,388)), // Northeast Cave
			Floor(id(337,573,385)), // South Cave
			Floor(id(338,573,386)), // North Cave
			Floor(id(339,573,387), { attrs: {"indoors":false} }), // Cliffside
			Floor(id(278,573,198)), //Topmost Room
			Floor(id(264,573,162), {
				attrs: {
					"indoors": false,
					"dungeon": false,
				},
			}),
		],
		locOf: {
			"flySpot":"43,18",
		},
	}),
	Dungeon("N's Castle", {
		floors: [
			Floor(id(421,264,171), {
				connections: [ id(343,573,391) ],
			}),
			Floor(id(422,264,163), { announce: "We poke around N's old room... and the creepy off-key music causes some WutFaces...", }),
			Floor(id(425,264,174)),
			Floor(id(426,264,212)),
		],
	}),
	Area("Pokémon League", id(149,136,87), {
		locOf: { "flySpot":"19,49" },
		attrs: { "e4":"lobby", },
		buildings: [
			PokeCenter(id(159,136,54), {
				locOf: { "pc":"4,12", },
			}),
			Area("Elite Four", id(150,136,210), {
				attrs: { "e4":"e4", },
				buildings: [
					House(id(153,136,121), {
						attrs: { "leader":"Shauntal", },
						locOf: { "leader":"15,9" },
					}),
					House(id(154,136,122), {
						attrs: { "leader":"Grimsley", },
						locOf: { "leader":"15,11" },
					}),
					House(id(155,136,123), {
						attrs: { "leader":"Marshal", },
						locOf: { "leader":"15,11" },
					}),
					House(id(156,136,124), {
						attrs: { "leader":"Caitlin", },
						locOf: { "leader":"15,11" },
					}),
					House(id(151,136,211), { // Note, this is also the start of the credits
						attrs: {
							"e4": "champion",
						},
						announce: "**We're climbing the stairs to the champion's room!**",
					}),
					House(id(157,136,125), {
						attrs: {
							"e4": "champion",
							"leader":"Iris",
						},
						locOf: { "leader":"16,43" },
					}),
					House(id(158,136,126), {
						attrs: {
							"e4": "hallOfFame",
						}
					}),
				],
			}),
		],
	}),
	
]);


// Other areas that are not part of the main map
Unova.addNode(...[
	Dungeon("Plasma Frigate", id(344,552,338), {
		the: true,
		floors: [
			Floor(id(355,522,249)),
			Floor(id(346,552,340)),
			Floor(id(356,552,350)),
			Floor(id(347,552,341)), // Bridge
			Floor(id(349,552,343)),
			Floor(id(350,552,344)),
			Floor(id(361,552,367)), // Barracks
			Floor(id(362,552,368)), // Barracks
			Floor(id(363,552,369)), // Barracks
			Floor(id(364,552,370)), // Barracks
			Floor(id(365,552,371)), // Mess Hall
		],
	}),
	
	Area("Entralink", id(435,279,117), {
		the: true,
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
	Cutscene(id(566,389,260), { // No header index
		announce: "We take a ferry to Castelia City!",
		connections: [ id(39,28,9) ],
	}),
	// Cutscene(id(152,136,211), {
	// 	announce: "Fireworks explode as the credits play!",
	// })
	Cutscene([id(7465,60045,0), id(44496,2691,0)], {
		name: "Title Screen",
		announce: "We return to the title screen!",
	}),
	Cutscene([id(49772,3786,21479)], {
		name: "Load Screen",
	}),
	Cutscene(id(548,3783), {
		announce: "We start a new game! Welcome to the world of Pokémon!",
	})
]);

// Unova.find = function(mapid){
// 	let header = HEADER[mapid];
// 	console.log(`Unova.find(${mapid}) => ${header.matrix}:${header.mapid}:${header.parentid}`);
// 	return Region.prototype.find.call(this, {
// 		matrix:header.matrix,
// 		mapid:header.mapid,
// 		parentId:header.parentid,
// 	});
// };

Unova.resolve();