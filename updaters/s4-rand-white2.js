// updaters/s4-blazed-glazed.js
// The configuration for Season 4's Blazed Glazed

module.exports = {
	// The Reddit Live Updater ID to post to
	// liveID : "", 
	liveID : "ysqpsvyo0yjv",  // Test updater
	// Unix timestamp since when the run started
	runStart : 1496523600,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
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
				mapbank: `${mapbank}.${mapid}`,
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
			if (minfo.held_item.count > 0) {
				mon.item = minfo.held_item.name;
			} else {
				mon.item = null;
			}
			mon.gender = minfo.gender;
			mon.ability = minfo.ability;
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
		
		function categorizeLocation(location) {
			const pcs = [], marts = [];
			const e4_lobby = [], e4_start = [], e4_champ = [], e4_hof = [];
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
