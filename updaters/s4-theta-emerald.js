// updaters/s4-blazed-glazed.js
// The configuration for Season 4's Blazed Glazed

const { SortedData, Pokemon } = require('../data-format');

let testi = 0;
global.game = "ThetaEmerald";
global.gen = 3;

function correctCase(str) {
	if (typeof str !== 'string' || !str.length) return str;
	str = str.split(' ')
			.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
			.join(' ');
	if (str.startsWith("Tm")) str = "TM"+str.substr(2);
	return str;
}
function ofSet(...items) {
	let set = {};
	for (let i = 0; i < items.length; i++) {
		set[items[i]] = true;
	}
	return set;
}
function sanatizeName(val) {
	val = val.replace(/ /i, '\xA0'); // Replace spaces with non-breaking spaces
	val = val.replace('π', 'ᵖᵏ').replace('Π', 'ᵖᵏ').replace('\u00ca', 'ᵖᵏ'); // Replace symbols
	val = val.replace('µ', 'ᵐᶰ').replace('Μ', 'ᵐᶰ').replace('Ë', 'ᵐᶰ'); // Replace symbols
	return val;
}

const rivalClasses = ofSet(...[
	0x207, 0x290, 0x291, 0x292, 0x293, 0x294, //Wally
	0x208, 0x209, 0x20A, 0x20B, 0x20C, 0x20D, 0x20E, 0x20F, 0x210, //Brendan
	0x257, 0x295, 0x296, 0x297, //Brendan (2)
]);
const leaderClasses = ofSet(0x109, 0x10A, 0x10B, 0x10C, 0x10D, 0x10E, 0x10F, 0x110);
const e4Classes = ofSet(...[
	0x105, 0x106, 0x107, 0x108, //First Time
	0x353, 0x354, 0x355, 0x356, //Rematch
]);
const champClass = ofSet(0x14F);
const teamLeaderClass = ofSet(...[
	0x259, 0x25A, 0x2DE, //Maxie
	0x022, // Archie
]);

const legendaryMons = ofSet(...[
	144,145,146, 150,151,
	243,244,245, 249,250,251,
	377,378,379, 380,381, 382,383,384, 385, 386,
	480,481,482, 483,484,485, 486, 487, 488,489,490,491,492,493,
	494,638,639,640,647, 641,642,645, 643,644,646, 648,649,
	716,717,718, 719,720,721
]);


module.exports = {
	// The Reddit Live Updater ID to post to
	liveID : "zmxw6yogfa8q",
	// liveID : "ysqpsvyo0yjv",  // Test updater
	// Unix timestamp since when the run started
	runStart : 1506805200,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 15, //15 seconds
	
	region: './maps/hoenn',
	
	// The function which parses the data into a normalized format
	infoParse : function(data) {
		let sorted = new SortedData();
		try {
			// Sanity Test: check if this is our protagonist
			if (data.id !== 51890 || data.secret !== 49705) {
				console.error('api/run_status: Trainer ID does not match!');
			}
			sorted.my_name = sanatizeName(data.name);
			sorted.rival_name = "Brendan";
			
			{ // Parse out location data to a standard display format:
				sorted.location.set(data);
				sorted.map_id = `${data.map_bank}.${data.map_id}`;
				
				let areaid = data.area_id;
				let name = data.area_name;
				let x = data.x;
				let y = data.y;
				let mapbank = data.map_bank;
				let mapid = data.map_id;
				sorted.loc_ex = {
					display: `${name}`,
					mapid: `${areaid}:${mapbank}.${mapid}`,
					mapbank: `${mapbank}.${mapid}`,
				};
				
				const Hoenn = require('./maps/hoenn');
				let loc = Hoenn.find(sorted.location);
				if (!loc) {
					const { Node } = require('./maps/map');
					loc = new Node({ 
						name:correctCase(name), 
						mapids:[`${mapbank}.${mapid}`],
						attrs: {
							noteworthy: false,
						},
						region: Hoenn,
						parent: Hoenn.topnode,
					});
				}
				sorted.location.set(loc);
			}
			{ // Collate pokemon together
				sorted.party = data.party.map(normalizePokemon).filter(x=>x);
				sorted.allmon.push(...sorted.party);
				data.pc.boxes.forEach(box => {
					if (!box) return; //skip
					sorted.allmon.push(...box.box_contents.map(x => {
						x = normalizePokemon(x);
						if (!x) return null;
						x.storedIn = box.box_number;
						return x;
					}).filter(x=>x));
				});
				if (data.daycare) {
					data.daycare.forEach(x=>{
						x = normalizePokemon(x);
						if (!x) return null;
						x.storedIn = 'daycare';
						return x;
					});
				}
			}
			if (data.items)
			{ // Collate items together
				const processItemList = (inv)=>{
					return (list)=>{
						list.forEach(x=>{
							let name = correctCase(x.name);
							let count = x.count !== undefined? x.count : 1;
							inv[name] = (inv[name] || 0) + count;
							sorted.inventory[name] = (sorted.inventory[name] || 0) + count;
						});
					}
				};
				
				[data.items.balls, data.items.items, data.items.tms, data.items.key]
					.forEach(processItemList(sorted.items_bag));
				[data.items.pc].forEach(processItemList(sorted.items_pc));
				
				sorted.ball_count = data.ball_count || 0;
			}
			{ // Sort battle data
				sorted.in_battle = data.in_battle;
				if (data.enemy_trainers && data.enemy_party) {
					sorted.trainer = {
						trainers: [],
						
						numPokemon: data.enemy_party.length,
						numHealthy: 0,
					};
					for (let t of data.enemy_trainers) {
						let Tr = {
							id: t.id,
							className: correctCase(sanatizeName(t.class_name)),
							name: correctCase(t.name),
						};
						
						sorted.trainer.isRival = !!rivalClasses[t.id];
						sorted.trainer.isLeader = !!leaderClasses[t.id];
						sorted.trainer.isE4 = !!e4Classes[t.id];
						sorted.trainer.isChampion = !!champClass[t.id];
						sorted.trainer.isTeamLeader = !!teamLeaderClass[t.id]; 
						
						sorted.trainer.displayName = `${sorted.trainer.className} ${sorted.trainer.name}`.trim();
						
						sorted.trainer.trainers.push(Tr);
					}
					sorted.trainer.isDouble = (sorted.trainer.trailers.length > 1);
					sorted.trainer.id = sorted.trainer.trailers.join(',');
					
					if (data.enemy_party.length) {
						let active = data.enemy_party.filter((x)=>{
							return x.active; //(x.health[0] > 0 && x.species.id > 0);
						});
						let mon = active[0];
						
						sorted.trainer.activeMon = {
							id: mon.species.national_dex,
							name: correctCase(mon.species.name),
							hp: Math.max(1, Math.floor((mon.health[0] / mon.health[1])*100)), //At least 1% HP if not fainted
						};
						if (mon.health[0] === 0) sorted.trainer.activeMon.hp = 0;
						
						sorted.trainer.numHealthy = 0; 
						data.enemy_party.forEach((x)=>{
							if (x.health[0] > 0) sorted.trainer.numHealthy++;
						});
					}
					
					
					console.log('Fight:', sorted.trainer);
				}
				if (data.wild_species) {
					sorted.wildmon = {
						id : data.wild_species.national_dex,
						name : correctCase(data.wild_species.name),
					};
					sorted.wildmon.isLegendary = !!legendaryMons[data.wild_species.national_dex];
				}
			}
			sorted.badges = {
				// Hoenn
				Stone:		!!(data.badges & (0x1 << 0x0)),
				Knuckle:	!!(data.badges & (0x1 << 0x1)),
				Dynamo:		!!(data.badges & (0x1 << 0x2)),
				Heat:		!!(data.badges & (0x1 << 0x3)),
				Balance:	!!(data.badges & (0x1 << 0x4)),
				Feather:	!!(data.badges & (0x1 << 0x5)),
				Mind:		!!(data.badges & (0x1 << 0x6)),
				Rain:		!!(data.badges & (0x1 << 0x7)),
			};
			
			if (data.time) {
				sorted.time = {
					ofDay : (()=>{
						if (data.time.h >= 20) return "night";
						if (data.time.h >= 12) return "day";
						if (data.time.h >= 6) return "morning";
						return "night";
					})(),
				};
			}
			
		} finally {
			const path = require('path');
			require('fs').writeFile(path.join(__dirname,`../test/status_api.${testi}.json`), JSON.stringify(data, null, '\t'), ()=>{
				let out = testi; // save off current value for reporting
				console.log(`test data written to status_api.${out}.json`);
			});
			testi = (testi + 1) % 50;
		}
		return sorted;
		
		function normalizePokemon(minfo) {
			let mon = new Pokemon();
			
			mon.species = minfo.is_egg? 'Egg': correctCase(minfo.species.name);
			mon.name = minfo.is_egg? 'Egg' : sanatizeName(minfo.name);
			mon.nicknamed = minfo.name !== minfo.species.name.toUpperCase();
			// console.log(mon.name, ' = ', minfo.name, ' => ', minfo.species.name, 'nicked=', mon.nicknamed);
			
			mon.dexid = minfo.species.national_dex;
			mon.types = [ minfo.species.type1 ];
			if (minfo.species.type1 !== minfo.species.type2) {
				mon.types.push(minfo.species.type2);
			}
			mon.shiny = minfo.shiny;
			mon.pokerus = minfo.pokerus.infected && !minfo.pokerus.cured;
			mon.traded = minfo.original_trainer.id !== data.id || minfo.original_trainer.secret !== data.secret;
			
			mon.moves = minfo.moves.map(m=> correctCase(m.name) );
			mon.moveInfo = minfo.moves.map(m=>{
				return { id: m.id, max_pp:m.max_pp, pp:m.pp, name:correctCase(m.name), type:m.type };
			});
			
			mon.level = minfo.level;
			if (!minfo.experience.next_level && minfo.experience.remaining === -minfo.experience.current) {
				// next level bug
				const exptable = require('../data/exptable');
				let grow_rate;
				if (!minfo.species.growth_rate) { // growth_rate bug
					grow_rate = exptable.dex[minfo.species.id-1];
				} else {
					grow_rate = minfo.species.growth_rate;
				}
				mon.level_reported = mon.level;
				mon.level_calculated = exptable[grow_rate].getLevelFromExp(minfo.experience.current);
				if (!minfo.box_slot) console.log(`EXP rate: (${mon.species}) lvl=${mon.level_reported}, calc=${mon.level_calculated}, exp=${minfo.experience.current}`);
			}
			
			if (minfo.held_item.id > 0) {
				mon.item = correctCase(minfo.held_item.name);
				sorted.addItemOnPokemon(mon.item);
			} else {
				mon.item = null;
			}
			mon.gender = minfo.gender || '';
			mon.ability = minfo.ability || '';
			if (minfo.health) {
				if (minfo.health[0] === 0) mon.hp = 0;
				else mon.hp = Math.max(1, Math.floor((minfo.health[0] / minfo.health[1])*100)); //At least 1% HP if not fainted
			}
			if (minfo.stats) { mon.stats = minfo.stats; }
			mon.hash = minfo.personality_value;
			mon._isEvolving = minfo.is_evolving || false;
			return mon;
		}
	},
	
};
