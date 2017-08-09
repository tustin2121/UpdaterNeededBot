// Johto (GSC)
// Includes Gen 2 Kanto

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
	Center, PokeCenter,
	
	Location,
	
	id, ref, r, firstTime,
} = require("./common.js");

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
const Johto = module.exports = new Region({ name:"Johto", mapidFn });

Johto.addNode(...require('./johto.js'));
Johto.addNode(...require('./kanto.js'));

Johto.addNode(...[
	House(id(23,13,255), {
		name: "Pokemon League Reception Gate",
		connections: [ r(27), r(22), r(28), "Victory Road" ],
	}),
	Area("Victory Road", id(3,91,89), {
		attrs: {
			indoors: true,
			dungeon: true,
			noteworthy: true,
			"onto": "into",
		},
		connections: [ ref(23,13,255) ],
	}),
	Building("Indigo Plateau", {
		floors: [
			Floor(id(16,1,90), {
				// Sub Area: Y<24 - Indigo Plateau
				// Sub Area: Y>24 - Indigo Plateau East Garden
				attrs: {
					indoors: false,
					announce: (loc, reporter)=>{
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
			Floor(id(0,0,91), {
				//credits
				announce: "The credits play!",
			}),
		],
	}),
	
	
	// Mt. Silver
	Route(28, id(19,1,95), {
		attrs: {
			announce: firstTime(id(1), "We step out onto Route 28 towards Mt. Silver, and are immedately spooted by our rival!"),
		},
		connections: [ ref(23,13,255) ],
	}),
]);

//TODO Map out ALL Fly Spots
//TODO Find a way to report teleporting from the League to New Bark Town

Johto.resolve();