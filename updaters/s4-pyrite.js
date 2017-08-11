// updaters/s4-pyrite.js
// The configuration for Season 4's Pokemon Pyrite run

const { SortedData, Pokemon } = require('../data-format');
const movePPTable = require('../data/gen2/movetable');

let testi = 0;
global.game = "Pyrite";

function correctCase(str) {
	if (typeof str !== 'string') return str;
	return str.split(' ')
			.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
			.join(' ');
}
function ofSet(...items) {
	let set = {};
	for (let i = 0; i < items.length; i++) {
		set[i] = true;
	}
	return set;
}
function sanatizeName(val) {
	val = val.replace(/ /i, '\xA0'); // Replace spaces with non-breaking spaces
	val = val.replace('π', 'Pk').replace('µ', 'Mn'); // Replace symbols
	return val;
}

const rivalClasses = ofSet(9,42);
const leaderClasses = ofSet(1,2,3,4,5,6,7,8, 17,18,19,21,26,35,46,64);
const e4Classes = ofSet(11,13,14,15);
const champClass = ofSet(16);

const legendaryMons = ofSet(144,145,146, 150,151, 243,244,245, 249,250,251);

module.exports = {
	// The Reddit Live Updater ID to post to
	// liveID : "",
	liveID : "z380f0na2tyd",
	// Unix timestamp since when the run started
	runStart : 1502571600,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 20, //20 seconds
	
	region: './maps/johto',
	
	// The function which parses the data into a normalized format
	infoParse : function(data) {
		let sorted = new SortedData();
		
		try {
			// Sanity Test: check if this is our protagonist
			if (data.id !== 32230 || data.secret !== 44970) {
				console.error('api/run_status: Trainer ID does not match!');
			}
			sorted.my_name = sanatizeName(data.name);
			sorted.rival_name = sanatizeName(data.rival_name);
			
			sorted.level_cap = data.level_cap;
			
			{ // Parse out location data to a standard display format:
				sorted.location.set(data);
				sorted.map_id = `${data.area_id}:${data.map_bank}.${data.map_id}`;
				
				const Johto = require('./maps/johto');
				let loc = Johto.find(data.location);
				if (loc._typename === "Cutscene") {
					// Confirm cutscene
					if (sorted.location.x === 255 && sorted.location.y === 0) {
						sorted.in_cutscene = true;
					}
				}
			}
			{ // Collate pokemon together
				sorted.party = data.party.map(normalizePokemon);
				sorted.allmon.push(...sorted.party);
				data.pc.boxes.forEach(box => {
					if (!box) return; //skip
					sorted.allmon.push(...box.box_contents.map(x => {
						x = normalizePokemon(x);
						x.storedIn = box.box_number;
						return x;
					}));
				});
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
				[data.item.pc].forEach(processItemList(sorted.items_pc));
			}
			{ // Sort battle data
				sorted.in_battle = data.in_battle;
				if (data.enemy_trainer) {
					sorted.trainer = {
						"class": data.enemy_trainer.class_id,
						id: data.enemy_trainer.id,
						className: correctCase(data.enemy_trainer.class_name),
						name: correctCase(data.enemy_trainer.name),
					};
					sorted.trainer.isRival = !!rivalClasses[sorted.trainer.class];
					sorted.trainer.isLeader = !!leaderClasses[sorted.trainer.class];
					sorted.trainer.isE4 = !!e4Classes[sorted.trainer.class];
					sorted.trainer.isChampion = !!champClass[sorted.trainer.class];
					
					if (sorted.trainer.isRival) {
						sorted.trainer.name = sorted.rival_name;
					}
					sorted.trainer.displayName = `${sorted.trainer.className} ${sorted.trainer.name}`.trim();
				}
				if (data.wild_species) {
					sorted.wildmon = {
						id : data.wild_species.national_dex,
						name : correctCase(data.wild_species.name),
					};
					sorted.wildmon.isLegendary = !!legendaryMons[sorted.wildmon.id];
				}
			}
			sorted.badges = {
				// Johto
				Zephyr:		!!(data.badges & (0x1 << 0x0)),
				Hive:		!!(data.badges & (0x1 << 0x1)),
				Plain:		!!(data.badges & (0x1 << 0x2)),
				Fog:		!!(data.badges & (0x1 << 0x3)),
				Mineral:	!!(data.badges & (0x1 << 0x4)),
				Storm:		!!(data.badges & (0x1 << 0x5)),
				Glacier:	!!(data.badges & (0x1 << 0x6)),
				Rising:		!!(data.badges & (0x1 << 0x7)),
				// Kanto
				Boulder:	!!(data.badges & (0x1 << 0x8)),
				Cascade:	!!(data.badges & (0x1 << 0x9)),
				Thunder:	!!(data.badges & (0x1 << 0xA)),
				Rainbow:	!!(data.badges & (0x1 << 0xB)),
				Marsh:		!!(data.badges & (0x1 << 0xC)),
				Volcano:	!!(data.badges & (0x1 << 0xD)),
				Earth:		!!(data.badges & (0x1 << 0xE)),
			};
		
		} finally {
			const path = require('path');
			require('fs').writeFile(path.join(__dirname,`../test/status_api.${testi}.json`), JSON.stringify(data, null, '\t'), ()=>{
				let out = testi; // save off current value for reporting
				console.log(`test data written to status_api.${out}.json`);
			});
			testi = (testi + 1) % 10;
		}
		return sorted;
		
		
		function normalizePokemon(minfo) {
			let mon = {};
			
			mon.species = minfo.is_egg? 'Egg': correctCase(minfo.species.name);
			mon.name = minfo.is_egg? 'Egg' : sanatizeName(minfo.name);
			mon.nicknamed = minfo.name === minfo.species.name;
			
			mon.dexid = minfo.species.national_dex;
			mon.types = [ minfo.species.type1 ];
			if (minfo.species.type1 !== minfo.species.type2) {
				mon.types.push(minfo.species.type2);
			}
			mon.shiny = minfo.shiny;
			mon.pokerus = minfo.pokerus.infected && !minfo.pokerus.cured;
			mon.traded = minfo.original_trainer.id !== data.id;
			
			mon.moves = minfo.moves.map(m=> correctCase(m.name) );
			mon.moveInfo = minfo.moves.map(m=>{
				// Gen 2 stores only current and number of PP Ups. We have to calculate max.
				let maxPP = movePPTable[m.id];
				// If there are PP Up's applied, increase by 20% of the max
				if (m.pp_up) {
					let ppUp = maxPP / 5;
					// Gen 1 and 2 reduced this from 8 to 7, so it wouldn't overflow.
					// https://github.com/pret/pokecrystal/blob/217b7b8d9ba0d243ccbd9d4ae0a5b3ac7ab856e8/items/item_effects.asm#L3161
					if (ppUp === 8) ppUp = 7;
					maxPP += ppUp * m.pp_up;
				}
				return {
					id: m.id,
					max_pp: maxPP, //m.max_pp,
					pp: m.pp,
					name: m.name,
					type: m.type
				};
			});
			
			mon.level = minfo.level;
			if (!minfo.experience.next_level && minfo.experience.remaining === -minfo.experience.current) {
				// next level bug
				const exptable = require('../data/gen2/exptable');
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
			} else {
				mon.item = null;
			}
			mon.gender = minfo.gender || '';
			mon.ability = minfo.ability;
			mon.nature = `${minfo.nature}, ${minfo.characteristic}`;
			if (minfo.met) {
				mon.caughtIn = minfo.met.caught_in;
			}
			if (minfo.health) {
				if (minfo.health[0] === 0) mon.hp = 0;
				else mon.hp = Math.max(1, Math.floor((minfo.health[0] / minfo.health[1])*100)); //At least 1% HP if not fainted
			}
			if (minfo.stats) {
				mon.stats = {
					atk: minfo.stats.attack,
					def: minfo.stats.defense,
					hp: minfo.stats.hp,
					spa: minfo.stats.special_attack,
					spd: minfo.stats.special_defense,
					spe: minfo.stats.speed,
				};
			}
			// mon.hash = minfo.personality_value | (minfo.ivs.attack | minfo.ivs.defense<<2 | minfo.ivs.hp<<4 | minfo.ivs.special_attack<<6 | minfo.ivs.special_defense<<8 | minfo.ivs.speed<<10);
			mon.hash = minfo.personality_value;
			mon._isEvolving = minfo.is_evolving || false;
			return mon;
		}
		
	},
	
};
