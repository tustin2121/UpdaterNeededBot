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
			if (data.id !== 6702 || data.secret !== 60589) {
				console.error('api/run_status: Trainer ID does not match!');
			}
			sorted.my_name = sanatizeName(data.name);
			sorted.rival_name = sanatizeName(data.rival_name);
			
			{ // Parse out location data to a standard display format:
				let areaid = data.area_id;
				let name = data.area_name;
				let x = data.x;
				let y = data.y;
				let mapbank = data.map_bank;
				let mapid = data.map_id;
				sorted.location = {
					display: `${name}`,
					mapid: `${areaid}:${mapbank}.${mapid}`,
					mapbank: `${mapbank}.${mapid}`,
				};
				sorted.location = categorizeLocation(sorted.location);
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
				if (data.enemy_trainer) {
					sorted.trainer = {
						"class": data.enemy_trainer.class_id,
						id: data.enemy_trainer.id,
						className: correctCase(sanatizeName(data.enemy_trainer.class_name)),
						name: correctCase(data.enemy_trainer.name),
						
						numPokemon: data.enemy_trainer.party.length,
						numHealthy: 0,
					};
					if (data.enemy_trainer.party.length) {
						let active = data.enemy_trainer.party.filter((x)=>{
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
						data.enemy_trainer.party.forEach((x)=>{
							if (x.health[0] > 0) sorted.trainer.numHealthy++;
						});
					}
					
					sorted.trainer.isRival = !!rivalClasses[sorted.trainer.class];
					sorted.trainer.isLeader = !!leaderClasses[sorted.trainer.class];
					sorted.trainer.isE4 = !!e4Classes[sorted.trainer.class];
					sorted.trainer.isChampion = !!champClass[sorted.trainer.class];
					sorted.trainer.isMtSilverFight = !!redClass[sorted.trainer.class];
					
					if (sorted.trainer.isRival) {
						sorted.trainer.name = sorted.rival_name;
					}
					sorted.trainer.displayName = `${sorted.trainer.className} ${sorted.trainer.name}`.trim();
					
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
					ofWeek : data.time.d.toLowerCase(),
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
			f (!minfo.experience.next_level && minfo.experience.remaining === -minfo.experience.current) {
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
		
		function categorizeLocation(location) {
			const pcs = [], marts = [];
			const e4_lobby = [], e4_start = [], e4_champ = [], e4_hof = [];
			pcs.push('2.2'); marts.push('2.4'); //Oldale Town
			pcs.push('8.4'); marts.push('8.6'); // Petalburg City
			
			
			
			
			
			pcs.push('7.0'); marts.push('7.1'); //Chocco Town
			pcs.push('11.5'); marts.push('11.7'); //Ocean View City
			pcs.push('12.2'); marts.push('12.4'); //Serenity Isle
			pcs.push('8.4'); marts.push('8.6'); // Northcoast Town
			pcs.push('13.6'); marts.push('10.7'); // Cape Azure
			pcs.push('9.11'); marts.push('9.13'); // Southerly City
			pcs.push('14.9'); marts.push('14.9'); // Palmtree Resort
			pcs.push('5.4'); marts.push('5.0'); // Geminite Village
			pcs.push('4.5'); marts.push('4.4'); // Stormy City
			pcs.push('10.5'); marts.push('13.16'); marts.push('13.17'); marts.push('13.18'); marts.push('13.19'); marts.push('13.20'); // Seaspray Town
			pcs.push('15.2'); marts.push('15.5'); // Darkwood Town
			pcs.push('15.1'); pcs.push('16.12'); // Path of Victory
			
			pcs.push('16.10'); marts.push('16.10'); e4_lobby.push('16.10') // Tunod League
			e4_start.push('16.0');
			
			pcs.push('24.54'); marts.push('25.2'); // Cherrygrove City
			pcs.push('24.55'); //marts.push('25.2'); // Violet City
			pcs.push('24.56'); //marts.push('25.2'); // Ecruteak City
			pcs.push('26.73'); //marts.push('25.2'); // Olivine City
			pcs.push('26.71'); marts.push('26.6'); // Mahogany Town
			pcs.push('26.82'); //marts.push('25.2'); // Blackthorn City
			pcs.push('26.80'); //marts.push('25.2'); // Azalia Town
			pcs.push('26.78'); marts.push('17.0'); // Goldenrod Town
			pcs.push('26.86'); //marts.push('25.2'); // Whitewood City
			pcs.push('26.76'); marts.push('10.6'); // Cianwood City
			pcs.push('26.84'); //marts.push('25.2'); // Evergreen Town
			pcs.push('3.1');  // Victory Road Center
			
			pcs.push('26.87'); marts.push('26.87'); e4_lobby.push('26.87') // Johto League
			e4_start.push('16.5');
			
			pcs.push('26.72'); marts.push('26.72'); // Reefen Isle
			pcs.push('26.79'); marts.push('26.79'); // Nitro Isle
			pcs.push('26.74'); marts.push('26.74'); // Olcan Isle
			pcs.push('26.77'); marts.push('26.77'); // Kolo Isle
			pcs.push('26.81'); marts.push('26.81'); marts.push('26.50'); // Alpha Isle
			pcs.push('26.83'); marts.push('26.83'); marts.push('13.9'); // Reign Isle
			
			location.isCenter = pcs.includes(location.mapbank);
			location.isMart = marts.includes(location.mapbank);
			
			location.isE4Lobby = e4_lobby.includes(location.mapbank);
			location.isE4RunStart = e4_start.includes(location.mapbank);
			location.isE4Champ = e4_champ.includes(location.mapbank);
			location.isHallOfFame = e4_hof.includes(location.mapbank);
			
			return location;
		}
	},
	
};
