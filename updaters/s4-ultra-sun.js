// updaters/s4-blazed-glazed.js
// The configuration for Season 4's Blazed Glazed

const { SortedData, Pokemon, Location } = require('../data-format');

let testi = 0;
global.game = "UltraSun";
global.gen = 7;

function correctCase(str) { return str; }
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

const rivalClasses = ofSet(...[]);
const leaderClasses = ofSet(...[]);
const e4Classes = ofSet(...[]);
const champClass = ofSet(...[]);
const teamLeaderClass = ofSet(...[]);

const legendaryMons = ofSet(...[
	144,145,146, 150,151,
	243,244,245, 249,250,251,
	377,378,379, 380,381, 382,383,384, 385, 386,
	480,481,482, 483,484,485, 486, 487, 488,489,490,491,492,493,
	494,638,639,640,647, 641,642,645, 643,644,646, 648,649,
	716,717,718, 719,720,721
]);

const Alola = makeRegion();

module.exports = {
	// The Reddit Live Updater ID to post to
	liveID : "zr4lmzz2p2tp",
	
	// The Discord LiveUpdater channel snowflake
	discordID: '366698530343223306',
	
	// Unix timestamp since when the run started
	runStart : 1511643600,
	
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
			if (data.id !== 57263 || data.secret !== 10183) {
				console.error('api/run_status: Trainer ID does not match!');
			}
			sorted.my_name = sanatizeName(data.name);
			sorted.rival_name = "Hau";
			
			{ // Parse out location data to a standard display format:
				sorted.location.set(data);
				sorted.map_id = `${data.map_bank}.${data.map_id}`;
				
				let name = data.area_name;
				let mapid = data.map_id;
				sorted.loc_ex = {
					display: `${name}`, mapid,
				};
				
				let loc = Alola.find(sorted.location);
				if (!loc || loc === Alola.topNode) {
					const { Node } = require('./maps/map');
					loc = new Node({ 
						name:correctCase(name), 
						mapids:[mapid],
						attrs: {
							noteworthy: false,
						},
						region: Alola,
						parent: Alola.topNode,
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
				
				[
					data.items.berries, 
					data.items.items,
					data.items.tms, 
					data.items.key,
					data.items.free_space,
					data.items.medicine,
					data.items.rotom_powers,
					data.items.z_crystals,
				].forEach(processItemList(sorted.items_bag));
				
				sorted.ball_count = data.ball_count || 0;
			}
/*			{ // Sort battle data
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
						
						if (!sorted.trainer.displayName) {
							sorted.trainer.displayName = `${Tr.className} ${Tr.name}`.trim();
						} else {
							sorted.trainer.displayName += `& ${Tr.className} ${Tr.name}`.trim();
						}
						if (Tr.id !== 0) {
							if (!sorted.trainer.id) {
								sorted.trainer.id = Tr.id;
							} else {
								if (!Array.isArray(sorted.trainer.id))
									sorted.trainer.id = [ sorted.trainer.id ];
								sorted.trainer.id.push(Tr.id);
							}
						}
						
						
						sorted.trainer.trainers.push(Tr);
					}
					sorted.trainer.isDouble = (sorted.trainer.trainers.length > 1);
					// sorted.trainer.id = sorted.trainer.trainers.map(x=>x.id);
					
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
			} //*/
			// sorted.badges = {
			// 	// Hoenn
			// 	Stone:		!!(data.badges & (0x1 << 0x0)),
			// 	Knuckle:	!!(data.badges & (0x1 << 0x1)),
			// 	Dynamo:		!!(data.badges & (0x1 << 0x2)),
			// 	Heat:		!!(data.badges & (0x1 << 0x3)),
			// 	Balance:	!!(data.badges & (0x1 << 0x4)),
			// 	Feather:	!!(data.badges & (0x1 << 0x5)),
			// 	Mind:		!!(data.badges & (0x1 << 0x6)),
			// 	Rain:		!!(data.badges & (0x1 << 0x7)),
			// };
			
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
			if (minfo.pokerus) mon.pokerus = minfo.pokerus.infected && !minfo.pokerus.cured;
			mon.traded = minfo.original_trainer.id !== data.id || minfo.original_trainer.secret !== data.secret;
			
			mon.moves = minfo.moves.filter(m=>m.id).map(m=> correctCase(m.name) );
			mon.moveInfo = minfo.moves.filter(m=>m.id).map(m=>{
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
			mon.nature = `${minfo.nature}`;
			if (minfo.met) {
				mon.caughtIn = minfo.met.caught_in;
			}
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

function makeRegion() {
	const { Region, Node } = require('./maps/map.js');
	
	const mapidFn = (id)=>{
		if (id instanceof Location) {
			return `${id.map_id}`;
		}
		return ''+id;
	};
	
	const Alola = new Region({ name:"Alola", mapidFn }, [
		new Node({ mapids:['0','1','2'], name:"Route 1 (Hau’oli Outskirts)", }),
		new Node({ mapids:['3','4','5'], name:"Route 1", }),
		new Node({ mapids:['6'], name:"Route 3", }),
		new Node({ mapids:['7'], name:"Route 2", }),
		new Node({ mapids:['8'], name:"Kala’e Bay", }),
		new Node({ mapids:['9','10'], name:"Melemele Sea", }),
		new Node({ mapids:['11'], name:"Big Wave Beach", }),
		new Node({ mapids:['12'], name:"Hau’oli City (Beachfront)", }),
		new Node({ mapids:['13'], name:"Hau’oli City (Shopping District)", }),
		new Node({ mapids:['14','15'], name:"Hau’oli City (Marina)", }),
		new Node({ mapids:['16','17','18'], name:"Iki Town", }),
		new Node({ mapids:['19'], name:"Mahalo Trail", }),
		new Node({ mapids:['20','21'], name:"Mahalo Trail (Plank Bridge)", }),
		new Node({ mapids:['22','23','24','25'], name:"Ruins of Conflict", }),
		new Node({ mapids:['26'], name:"Ten Carat Hill", }),
		new Node({ mapids:['27'], name:"Ten Carat Hill (Farthest Hollow)", }),
		new Node({ mapids:['28'], name:"Hau’oli Cemetery", }),
		new Node({ mapids:['29'], name:"Melemele Meadow", }),
		new Node({ mapids:['30'], name:"Seaward Cave", }),
		new Node({ mapids:['31'], name:"Berry Fields", }),
		new Node({ mapids:['32'], name:"Sandy Cave", }),
		new Node({ mapids:['33'], name:"Verdant Cavern (Trial Site)", }),
		new Node({ mapids:['34'], name:"Verdant Cavern (Totem’s Den)", }),
		new Node({ mapids:['35','36','37','38'], name:"Route 1 (Hau’oli Outskirts)", }),
		new Node({ mapids:['39','40','41','42','43','44','45'], name:"Iki Town", }),
		new Node({ mapids:['46','47'], name:"Route 1 (Hau’oli Outskirts)", }),
		new Node({ mapids:['48'], name:"Hau’oli City (Shopping District)", }),
		new Node({ mapids:['49','50'], name:"Route 2", }),
		new Node({ mapids:['51','52','53'], name:"Hau’oli City (Shopping District)", }),
		new Node({ mapids:['54'], name:"Berry Fields", }),
		new Node({ mapids:['55','56','57','58','59','60','61','62'], name:"Route 1 (Trainers’ School)", }),
		new Node({ mapids:['63','64','65','66','67'], name:"Hau’oli City (Shopping District)", }),
		new Node({ mapids:['68','69'], name:"Hau’oli City (Marina)", }),
		new Node({ mapids:['70','71'], name:"Hau’oli City (Shopping District)", }),
		new Node({ mapids:['72','73'], name:"Route 2", }),
		new Node({ mapids:['74','75','76','78'], name:"Hau’oli City (Shopping District)", }),
		new Node({ mapids:['77'], name:"Route 1 (Hau’oli Outskirts)", }),
		new Node({ mapids:['79'], name:"Route 2", }),
		new Node({ mapids:['80'], name:"Route 4", }),
		new Node({ mapids:['81'], name:"Route 5", }),
		new Node({ mapids:['82'], name:"Route 6", }),
		new Node({ mapids:['83'], name:"Route 7", }),
		new Node({ mapids:['84'], name:"Route 8", }),
		new Node({ mapids:['85'], name:"Route 9", }),
		new Node({ mapids:['86'], name:"Hano Grand Resort", }),
		new Node({ mapids:['87'], name:"Hano Beach", }),
		new Node({ mapids:['88'], name:"Heahea Beach", }),
		new Node({ mapids:['89'], name:"Paniola Town", }),
		new Node({ mapids:['90'], name:"Heahea City", }),
		new Node({ mapids:['91'], name:"Konikoni City", }),
		new Node({ mapids:['92'], name:"Royal Avenue", }),
		new Node({ mapids:['93'], name:"Dividing Peak Tunnel", }),
		new Node({ mapids:['94','95','96'], name:"Ruins of Life", }),
		new Node({ mapids:['97'], name:"Memorial Hill", }),
		new Node({ mapids:['98'], name:"Akala Outskirts", }),
		new Node({ mapids:['99'], name:"Diglett’s Tunnel", }),
		new Node({ mapids:['100'], name:"Wela Volcano Park", }),
		new Node({ mapids:['101'], name:"Wela Volcano Park (Totem’s Den)", }),
		new Node({ mapids:['102','103'], name:"Brooklet Hill", }),
		new Node({ mapids:['104'], name:"Brooklet Hill (Totem’s Den)", }),
		new Node({ mapids:['105','106','107','108','109'], name:"Lush Jungle", }),
		new Node({ mapids:['110','111','112','113'], name:"Paniola Town", }),
		new Node({ mapids:['114','115','116','117','118','119','120','121','122'], name:"Konikoni City", }),
		new Node({ mapids:['123','124','125','126','127','128','129','130','131','132','133','134','135','136','137'], name:"Heahea City", }),
		new Node({ mapids:['138'], name:"Route 8", }),
		new Node({ mapids:['139'], name:"Hano Grand Resort", }),
		new Node({ mapids:['140'], name:"Royal Avenue", }),
		new Node({ mapids:['141','142'], name:"Route 8", }),
		new Node({ mapids:['143'], name:"Royal Avenue", }),
		new Node({ mapids:['144','145'], name:"Konikoni City", }),
		new Node({ mapids:['146'], name:"Route 9", }),
		new Node({ mapids:['147'], name:"Battle Royal Dome", }),
		new Node({ mapids:['148'], name:"Route 8", }),
		new Node({ mapids:['149','150','151'], name:"Paniola Ranch", }),
		new Node({ mapids:['152'], name:"Heahea City", }),
		new Node({ mapids:['153','154'], name:"Konikoni City", }),
		new Node({ mapids:['155'], name:"Royal Avenue", }),
		new Node({ mapids:['156'], name:"Heahea City", }),
		new Node({ mapids:['157'], name:"Pikachu Valley", }),
		new Node({ mapids:['158'], name:"Heahea City", }),
		new Node({ mapids:['159'], name:"Royal Avenue", }),
		new Node({ mapids:['160'], name:"Route 8", }),
		new Node({ mapids:['161'], name:"Konikoni City", }),
		new Node({ mapids:['162'], name:"Paniola Town", }),
		new Node({ mapids:['163'], name:"Route 5", }),
		new Node({ mapids:['164'], name:"Route 10", }),
		new Node({ mapids:['165'], name:"Route 11", }),
		new Node({ mapids:['166'], name:"Ula’ula Beach", }),
		new Node({ mapids:['167'], name:"Route 13", }),
		new Node({ mapids:['168'], name:"Tapu Village", }),
		new Node({ mapids:['169'], name:"Route 14", }),
		new Node({ mapids:['170'], name:"Route 15", }),
		new Node({ mapids:['171'], name:"Route 16", }),
		new Node({ mapids:['172'], name:"Route 17", }),
		new Node({ mapids:['173'], name:"Route 12", }),
		new Node({ mapids:['174'], name:"Malie City", }),
		new Node({ mapids:['175'], name:"Malie City (Outer Cape)", }),
		new Node({ mapids:['176'], name:"Po Town", }),
		new Node({ mapids:['177','178','179','180','181','182','183','184'], name:"Haina Desert", }),
		new Node({ mapids:['185'], name:"Ula’ula Meadow", }),
		new Node({ mapids:['186'], name:"Malie Garden", }),
		new Node({ mapids:['187'], name:"Mount Hokulani", }),
		new Node({ mapids:['188'], name:"Blush Mountain", }),
		new Node({ mapids:['189','190','191'], name:"Ruins of Abundance", }),
		new Node({ mapids:['192','193','194','195'], name:"Lake of the Sunne", }),
		new Node({ mapids:['196','197','198','199'], name:"Lake of the Moone", }),
		new Node({ mapids:['200','201','202','204','205','206','207'], name:"Mount Lanakila", }),
		new Node({ mapids:['208','209','210','211','212','213','214','215','216','217','218','219'], name:"Shady House", }),
		new Node({ mapids:['220','221','222'], name:"Thrifty Megamart (Abandoned Site)", }),
		new Node({ mapids:['223','224','225','226','227','228','229','230','231','232','233'], name:"Malie City", }),
		new Node({ mapids:['234','235','236'], name:"Route 15", }),
		new Node({ mapids:['237','238'], name:"Route 13", }),
		new Node({ mapids:['239'], name:"Route 17", }),
		new Node({ mapids:['240','241'], name:"Route 16", }),
		new Node({ mapids:['242','243','244','245'], name:"Hokulani Observatory", }),
		new Node({ mapids:['246'], name:"Blush Mountain", }),
		new Node({ mapids:['247'], name:"Malie City (Outer Cape)", }),
		new Node({ mapids:['248'], name:"Route 15", }),
		new Node({ mapids:['249','250'], name:"Route 13", }),
		
		new Node({ mapids:['262'], name:"Mount Lanakila Pokecenter", attrs: { "e4":"lobby", 'indoors':true, } }),
		new Node({ mapids:['203'], name:"Mount Lanakila: League Path", attrs: { "e4":"lobby", 'indoors':false, } }),
		new Node({ mapids:['251'], name:"Pokémon League: Central Hub", attrs: { "e4":"e4", 'indoors':true, 'onto':'into', 'the':true, } }),
		new Node({ mapids:['252'], name:"Pokémon League: Molayne's Steel Chamber", attrs: { "e4":"e4", 'indoors':true, 'onto':'into', 'the':true, } }),
		new Node({ mapids:['253'], name:"Pokémon League: Olivia's Rock Chamber", attrs: { "e4":"e4", 'indoors':true, 'onto':'into', 'the':true, } }),
		new Node({ mapids:['254'], name:"Pokémon League: Acerola's Ghost Chamber", attrs: { "e4":"e4", 'indoors':true, 'onto':'into', 'the':true, } }),
		new Node({ mapids:['255'], name:"Pokémon League: Kahili's Flying Chamber", attrs: { "e4":"e4", 'indoors':true, 'onto':'into', 'the':true, } }),
		new Node({ mapids:['256'], name:"Pokémon League: Champion's Plynth", attrs: { "e4":"champion", 'the':true, } }),
		new Node({ mapids:['257'], name:"Pokémon League", attrs: { "e4":"hallOfFame" } }),
		
		new Node({ mapids:['258'], name:"Malie City", }),
		new Node({ mapids:['259'], name:"Tapu Village", }),
		new Node({ mapids:['260'], name:"Po Town", }),
		new Node({ mapids:['261'], name:"Route 16", }),
		// new Node({ mapids:['262'], name:"Mount Lanakila", }),
		new Node({ mapids:['263'], name:"Mount Hokulani", }),
		new Node({ mapids:['264'], name:"Poni Wilds", }),
		new Node({ mapids:['265'], name:"Ancient Poni Path", }),
		new Node({ mapids:['266'], name:"Poni Breaker Coast", }),
		new Node({ mapids:['267'], name:"Poni Grove", }),
		new Node({ mapids:['268'], name:"Poni Plains", }),
		new Node({ mapids:['269'], name:"Poni Coast", }),
		new Node({ mapids:['270'], name:"Poni Gauntlet", }),
		new Node({ mapids:['271'], name:"Poni Beach", }),
		new Node({ mapids:['272'], name:"Seafolk Village", }),
		new Node({ mapids:['273'], name:"Poni Meadow", }),
		new Node({ mapids:['274','275','276','277','278','279'], name:"Vast Poni Canyon", }),
		new Node({ mapids:['280','281'], name:"Altar of the Sunne", }),
		new Node({ mapids:['282','283'], name:"Altar of the Moone", }),
		new Node({ mapids:['284','285','286'], name:"Ruins of Hope", }),
		new Node({ mapids:['287','288','289'], name:"Resolution Cave", }),
		new Node({ mapids:['290'], name:"Exeggutor Island", }),
		new Node({ mapids:['291'], name:"Plains Grotto", }),
		new Node({ mapids:['292','293','294','295','296'], name:"Seafolk Village", }),
		new Node({ mapids:['297'], name:"Ancient Poni Path", }),
		new Node({ mapids:['298'], name:"Ancient Poni Path", }),
		new Node({ mapids:['299'], name:"Seafolk Village", }),
		new Node({ mapids:['300','301','302','303'], name:"Battle Tree", }),
		new Node({ mapids:['304','305','306','307','308','309','310','311','312','313','314','315','316','317'], name:"Aether Paradise", }),
		new Node({ mapids:['318','319','320'], name:"Route 1 (Hau’oli Outskirts)", }),
		new Node({ mapids:['321'], name:"Ultra Deep Sea", }),
		new Node({ mapids:['322','323'], name:"Ultra Megalopolis", }),
		new Node({ mapids:['324','325'], name:"Megalo Tower", }),
		new Node({ mapids:['326'], name:"Ultra Plant", }),
		new Node({ mapids:['327'], name:"Ultra Crater", }),
		new Node({ mapids:['328'], name:"Ultra Desert", }),
		new Node({ mapids:['329'], name:"Ultra Forest", }),
		new Node({ mapids:['330'], name:"Ultra Jungle", }),
		new Node({ mapids:['331','332'], name:"Ultra Ruin", }),
		new Node({ mapids:['333','334','335','336'], name:"Ultra Space Wilds", }),
		new Node({ mapids:['337'], name:"Aether Paradise", }),
		new Node({ mapids:[
			'338','339',
			'340','341','342','343','344','345','346','347','348','349',
			'350','351','352','353','354','355','356','357','358','359',
			'360','361','362','363','364','365','366','367','368','369',
			'370','371','372','373','374','375','376','377','378','379',
		], name:"Team Rocket’s Castle", }),
	]);
	Alola.resolve();
	return Alola;
}