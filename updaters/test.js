// updaters/test.js
// The test configuration for UpdaterNeeded

module.exports = {
	// The Reddit Live Updater ID to post to
	liveID : "ysqpsvyo0yjv", 
	// Unix timestamp since when the run started
	runStart : 1491685200,
	
	// The Stream API URL to poll
	infoSource : "https://tppleague.me/tools/run_status.json",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 20, //15 seconds
	
	// The function which parses the data into a normalized format
	infoParse : function(data) {
		let sorted = {};
		
		// Sanity Test: check if this is our protagonist
		if (data.id !== 6702 || data.secret !== 60589) {
			console.error('api/run_status: Trainer ID does not match!');
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
			};
			sorted.location = categorizeLocation(sorted.location);
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
			[data.items, data.items_ball, data.items_berry, data.items_key, data.items_tm, data.pc_items].forEach(items=>{
				items.forEach(x=>{
					sorted.allitems[x.name] = (sorted.allitems[x.name] || 0) + x.count;
				});
			});
		}
		
		return sorted;
		function normalizePokemon(minfo) {
			let mon = {};
			
			mon.species = minfo.is_egg? 'Egg':minfo.species.name;
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
			mon.item = minfo.held_item.name;
			mon.gender = minfo.gender;
			mon.ability = minfo.ability;
			if (minfo.health) {
				mon.hp = Math.floor((minfo.health[0] / minfo.health[1])*100);
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
		
		function categorizeLocation(location) {
			return location;
		}
	},
	
};
