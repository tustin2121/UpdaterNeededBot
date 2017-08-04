// updaters/s4-pyrite.js
// The configuration for Season 4's Pokemon Pyrite run

let testi = 0;
global.game = "Pyrite";

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
		let sorted = {};
		
		try {
			// Sanity Test: check if this is our protagonist
			if (data.id !== 32230 || data.secret !== 44970) {
				console.error('api/run_status: Trainer ID does not match!');
			}
			
			{ // Parse out location data to a standard display format:
				const Johto = require('./maps/johto');
				sorted.map_id = `${data.area_id}:${data.map_bank}.${data.map_id}`;
				sorted.location = Johto.find(data.map_id);
				sorted.position = `${data.x},${data.z},${data.y}`;
			}
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
				sorted.allmon = [];
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
			{ // Collate items together
				sorted.allitems = {};
				[data.items, data.items_berry, data.items_free_space, data.items_key, data.items_medicine, data.items_tm].forEach(items=>{
					items.forEach(x=>{
						let count = x.count !== undefined? x.count : 1;
						sorted.allitems[x.name] = (sorted.allitems[x.name] || 0) + count;
					});
				});
			}
			sorted.in_battle = data.in_battle;
			sorted.badges = {
				Basic:	!!(data.badges & (0x1 << 0)),
				Toxic:	!!(data.badges & (0x1 << 1)),
				Insect:	!!(data.badges & (0x1 << 2)),
				Bolt:	!!(data.badges & (0x1 << 3)),
				Quake:	!!(data.badges & (0x1 << 4)),
				Jet:	!!(data.badges & (0x1 << 5)),
				Legend:	!!(data.badges & (0x1 << 6)),
				Wave:	!!(data.badges & (0x1 << 7)),
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
			
			mon.species = minfo.is_egg? 'Egg':minfo.species.name;
			mon.nicknamed = minfo.is_nicknamed;
			mon.dexid = minfo.species.national_dex;
			mon.types = [ minfo.species.type1 ];
			if (minfo.species.type1 !== minfo.species.type2) {
				mon.types.push(minfo.species.type2);
			}
			mon.shiny = minfo.shiny;
			mon.pokerus = minfo.pokerus.infected && !minfo.pokerus.cured;
			mon.traded = minfo.original_trainer.id !== data.id || minfo.original_trainer.secret !== data.secret;
			mon.name = minfo.is_egg? 'Egg' : minfo.name.replace(/ /i, '\xa0'); // replace pokemon names with non-breaking spaces
			mon.moves = minfo.moves.map(m=>m.name);
			mon.moveInfo = minfo.moves.map(m=>{
				return { id: m.id, max_pp:m.max_pp, pp:m.pp, name:m.name, type:m.type };
			});
			
			mon.level = minfo.level;
			if (!minfo.experience.next_level && minfo.experience.remaining === -minfo.experience.current) {
				// next level bug
				const exptable = require('../exptable');
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
				mon.item = minfo.held_item.name;
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
			return mon;
		}
		
	},
	
};
