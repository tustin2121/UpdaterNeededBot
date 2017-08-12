// Johto (GSC)
// Includes Gen 2 Kanto

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

const mapidFn = (mid)=>{
	if (mid instanceof Location) {
		return `${mid.area_id}:${mid.map_bank}.${mid.map_id}`;
	}
	if (typeof mid === 'string') {
		let res = /^(\d+)\:(\d+)\.(\d+)$/i.exec(mid);
		if (!res) throw new Error(`Invalid ID: ${mid}`);//return 'invalid';
		return mid;
	}
	if (typeof mid === 'number') throw new Error(`Invalid ID: ${mid}`);//return `invalid`;
	throw new Error(`Invalid ID: ${mid}`);
	// return 'invalid';
};

// The region itself
const Johto = module.exports = new Region({ name:"Johto", mapidFn });

Johto.addNode(...require('./johto.js'));
Johto.addNode(...require('./kanto.js'));

Johto.addNode(...[
	Cutscene(id(0,0,0), {
		announce: ({ curr, loc })=>{
			let str = "**The game has been reset!**";
			if (loc.x === 255) return `${str} On the title screen!`;
			if (curr.in_battle && !curr.trainer && !curr.wildmon)
				return `${str} Evidently, this game pak is designed only for use on the Game Boy Color.`;
			return str;
		}
	}),
	
	
	Building("Fast Ship S.S. Aqua", {
		attrs: {
			the:true,
			announce: ({ prev, loc })=>{
				let lastLoc = prev.location;
				if (lastLoc.map_bank !== loc.map_bank) {
					if (lastLoc.area_id === 62) { //Vermilion
						return "We hop aboard the Fast Ship SS Aqua, heading to Olivine!";
					} else if (lastLoc.area_id === 27) { //Olivine
						return "We board the SS Aqua! Onward to Vermilion!!";
					}
				}
				return null;
			},
		},
		floors: [
			Floor(id(15, 3, 96), {
				connections: [ ref(15,1,27), ref(15,2,62) ],
			}),
			Floor(id(4)),
			Floor(id(5), {
				locOf: { pc:"0,1" },
			}),
			Floor(id(6)),
			Floor(id(7)),
		],
	}),
	
	House(id(23,13,255), {
		name: "Pokemon League Reception Gate",
		connections: [ r(27), r(22), r(28), "Victory Road" ],
	}),
	SingleCave("Victory Road", id(3,91,89), {
		connections: [ ref(23,13,255) ],
	}),
	Building("Indigo Plateau", {
		floors: [
			Floor(id(16,1,90), {
				// Sub Area: Y<24 - Indigo Plateau
				// Sub Area: Y>24 - Indigo Plateau East Garden
				attrs: {
					indoors: false,
					announce: ({ reporter, loc })=>{
						if (loc.y > 24) return "We step outside into the east garden of the Indigo Plateau. Several trainers are resting here between E4 attempts.";
						if (reporter.isFirstTime("indigo")) {
							return "We emerge from Victory Road! **We've arrived at the Indigo Plateau!**";
						}
						return null;
					},
				},
				connections: [ "Victory Road" ],
			}),
			Floor(id(16,2,91), { //Entryway
				attrs: {
					"e4":"lobby",
					healing: true,
					shopping: true,
					locOf: {
						"pc": "7,7",
					}
				},
			}),
			Floor(id(16,3,91), {
				attrs: {
					"e4":"e4",
					leader:"Koga",
				},
				locOf: { leader:"5,7", },
			}),
			Floor(id(16,5,91), {
				attrs: {
					"e4":"e4",
					leader:"Bruno",
				},
				locOf: { leader:"5,7", },
			}),
			Floor(id(16,4,91), {
				attrs: {
					"e4":"e4",
					leader:"Will",
				},
				locOf: { leader:"5,7", },
			}),
			Floor(id(16,6,91), {
				attrs: {
					"e4":"e4",
					leader:"Karen",
				},
				locOf: { leader:"5,7", },
			}),
			Floor(id(16,7,91), {
				attrs: {
					"e4":"champion",
					leader:"Lance",
				},
				locOf: { leader:"5,3", },
			}),
			Floor(id(16,8,91), {
				attrs: {
					"e4":"hallOfFame",
				},
			}),
			Cutscene(id(0,0,91), {
				attrs: { credits: true, },
				announce: "The credits play!",
			}),
		],
	}),
	
	// Mt. Silver
	Route(28, id(19,1,95), {
		buildings: [
			House(id(4)),
		],
		announce: firstTime(id(1), "We step out onto Route 28 towards Mt. Silver, and are immedately spooted by our rival!"),
		connections: [ ref(23,13,255), ref(19,2,46) ],
	}),
	Cave("Silver Cave", {
		floors:[
			Floor(id(19,2,46), {
				buildings: [
					PokeCenter(id(3)),
				],
				connections: [ r(28) ],
			}),
			Floor(id(3,74,46), {
				announce: firstTime(id(74), "We take our first step into the dark depths of Mt. Silver!"),
			}),
			Floor(id(75)),
			Floor(id(76), {
				announce: firstTime(id(76), "We reach the top of Mt. Silver! We can see an older boy in a red cap standing on the summit not far off..."),
				locOf: {
					leader: "9,10",
				}
			}),
			Floor(id(77), {
				legendary: {
					name: "Mew",
					loc: "7,12",
				},
			}),
			Cutscene(id(0,0,46), {
				attrs: { credits: true, },
				announce: "**Defeated Red! The credits play again!** ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ",
			}),
		],
	}),
]);

//TODO Map out ALL Fly Spots
//TODO Find a way to report teleporting from the League to New Bark Town
//TODO look through this: https://github.com/pret/pokecrystal/blob/700321a7fb2d6c852ffc91cc0b8867526cb76813/constants/map_constants.asm#L50

Johto.resolve();