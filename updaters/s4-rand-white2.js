// updaters/s4-rand-white2.js
// The configuration for Season 4's Randomized White 2

global.game = "White2";

module.exports = {
	// The Reddit Live Updater ID to post to
	// liveID : "",
	liveID : "z18ujd1blvg3",
	// Unix timestamp since when the run started
	runStart : 1496523600,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 20, //15 seconds
	
	region: './maps/unova2',
	
	// The function which parses the data into a normalized format
	infoParse : function(data) {
		let sorted = {};
		
		// Sanity Test: check if this is our protagonist
		if (data.id !== 32230 || data.secret !== 44970) {
			console.error('api/run_status: Trainer ID does not match!');
		}
		
		{ // Parse out location data to a standard display format:
			const Unova = require('./maps/unova2');
			sorted.location = Unova.find(data.map_id);
			sorted.position = `${data.x},${data.z},${data.y}`;
		}
		{ // Collate pokemon together
			sorted.allmon = [];
			sorted.party = data.party.map(normalizePokemon);
			sorted.allmon.push(...sorted.party);
			data.pc.boxes.forEach(box => {
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
			mon.name = minfo.is_egg? 'Egg' : minfo.name;
			mon.moves = minfo.moves.map(m=>m.name);
			mon.moveInfo = minfo.moves.map(m=>{
				return { id: m.id, max_pp:m.max_pp, pp:m.pp, name:m.name, type:m.type };
			});
			mon.level = minfo.level;
			if (minfo.experience.current === minfo.experience.next_level) {
				mon.level++; //Correct for level descrepency
			}
			if (minfo.held_item.count > 0) {
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
			mon.hash = minfo.personality_value | (minfo.ivs.attack | minfo.ivs.defense<<2 | minfo.ivs.hp<<4 | minfo.ivs.special_attack<<6 | minfo.ivs.special_defense<<8 | minfo.ivs.speed<<10);
			return mon;
		}
		
	},
	
};
