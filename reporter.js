// reporter.js
// A single persistent class which compares previous and current API responses and
// generates reports on the differences.

let discoveries, discoveries_party, collators;

class Reporter {
	constructor(memoryBank={}, currInfo=null) {
		this.pastInfo = {};
		this.prevInfo = null;
		this.currInfo = currInfo;
		
		// Defines information that needs to be kept long-term (over restarts).
		this.memory = memoryBank;
		
		// Defines various information that should be kept short term
		this.pmem = {}; // Progressive text responses memory
		this.prevLocs = [null, null, null, null, null]; // Previous location queue
		this.prevAreas = [null, null, null]; // Previous top-level areas
		this.checkpoint = null;
		
		// Defined variables used for collecting reportable information
		this.report = {};
		this.caughtMon = [];
		this.shopping = {};
		this.collatedInfo = null;
	}
	
	clone(other) {
		this.pastInfo = other.pastInfo;
		this.prevInfo = other.prevInfo;
		this.currInfo = other.currInfo;
		
		this.memory = other.memory;
		
		this.pmem = other.pmem;
		this.prevLocs = other.prevLocs;
		this.prevAreas = other.prevAreas;
		this.checkpoint = other.checkpoint;
		
		this.report = other.report;
		this.collatedInfo = other.collatedInfo;
	}
	
	
	///////////////////// Helper Functions /////////////////////
	
	progressive(memKey, ...opts) {
		memKey = `%progressive.${memKey}`;
		this.pmem[memKey] = (this.pmem[memKey] || 0) + 1;
		let t = opts[Math.ceil(this.pmem[memKey])];
		if (!t) t = opts[opts.length-1];
		return t;
	}
	progressiveTickDown(memKey) {
		memKey = `%progressive.${memKey}`;
		this.pmem[memKey] = Math.max((this.pmem[memKey] || 0) - 0.25, 0);
	}
	
	rand(...opts) {
		return opts[Math.floor(Math.random()*opts.length)];
	}
	randA(opts) {
		return opts[Math.floor(Math.random()*opts.length)];
	}
	plural(n, txt1, txtn) {
		if (n === 1) return txt1;
		return txtn;
	}
	correctCase(str) {
		return str.split(' ')
				.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
				.join(' ');
	}
	lowerCase(str) {
		if (typeof str === 'string') return str.toLowerCase();
		return str;
	}
	
	getName(mon, skipDiff=false) {
		let name = undefined;
		if (this.memory.nicknames) name = this.memory.nicknames[mon.hash];
		if (name) return name;
		if (mon.nicknamed) name = `${mon.name} (${mon.species})`;
		else name = `${mon.species}`;
		
		if (!skipDiff) { // Skip differentiation
			//TODO test if this mon's "name" is the same as another mon's name in the party
			// Then differentiate between them with the first-found-difference
			// In order being: shiny, gender, level, nature, stat differences, met timestamp, met location
		}
		return name;
	}
	
	alertUpdaters(text) {} //Must be overridden
	
	generateExtendedInfo(mon, includeStats=false) {
		if (mon.species === 'Egg') {
			return 'Egg';
		}
		
		let exInfo = `${mon.types.join('/')} | Item: ${mon.item?mon.item:"None"} | Ability: ${mon.ability} | Nature: ${mon.nature}\n`;
		exInfo += `Caught In: ${mon.caughtIn} | Moves: ${mon.moves.join(', ')}`;
		
		if (includeStats && mon.stats) {
			let stats = [];
			stats.push(`HP: ${mon.stats.hp}`);
			stats.push(`ATK: ${mon.stats.atk}`);
			stats.push(`DEF: ${mon.stats.def}`);
			stats.push(`SPA: ${mon.stats.spa}`);
			stats.push(`SPD: ${mon.stats.spd}`);
			stats.push(`SPE: ${mon.stats.spe}`);
			exInfo += `\n${stats.join(' | ')}`;
		}
		
		let f = [];
		if (mon.pokerus) f.push(`Has PokeRus`);
		if (mon.shiny) f.push('Shiny');
		if (mon.sparkly) f.push('Sparkly (N\'s Pokemon)');
		if (mon.level_reported) f.push(`Levels: API says ${mon.level_reported}, we calculated ${mon.level_calculated}`);
		if (f.length) exInfo += `\n${f.join(' | ')}`;
		
		return exInfo;
	}
	
	///////////////////// Main Functions /////////////////////
	
	/** Takes the passed current API data and compares it to the stored previous API data.
	 *  Generates a report, which is put together with a call to collate(). */
	discover(currInfo) {
		this.prevInfo = this.currInfo;
		this.currInfo = currInfo;
		if (!this.prevInfo) return false; // Can't do anything with nothing to compare to
		
		// Step 1, find map changes
		discoveries.forEach(fn=>{
			fn.call(this, this.prevInfo, this.currInfo, this.report);
		});
		return true;
	}
	
	collate(tags=null) {
		let texts = [];
		collators.forEach((fn)=>{
			let t = fn.call(this, tags);
			if (t) texts.push(t);
		});
		if (!texts.length) return null;
		return texts.join(' ');
	}
	
	clear() {
		this.report = {};
		this.caughtMon = [];
		// Not clearing shopping
	}
	
	clearHelping() {
		this.shopping = {};
	}
	
	///////////////////// Auxillary Functions /////////////////////
	
	generateUpdate(type) {
		try {
			if (type === 'team') {
				let info = [];
				this.currInfo.party.forEach(mon => {
					let exInfo = this.generateExtendedInfo(mon, true);
					let line = `* [\`${mon.name}\` (${mon.species}) ${mon.gender==='Female'?'♀':'♂'} L${mon.level}](#info "${exInfo}")`;
					if (mon.hp < 100) {
						if (mon.hp === 0) line += " (fainted)"
						else line += ` (${mon.hp}% health)`;
					}
					info.push(line);
				});
				return `[Info] Current Party:\n\n${info.join('\n')}`;
			}
		} catch (e) {
			console.error(`Error generating requested update!`, e);
		}
		return null;
	}
	
	geneateCatchTable(timestamp) {
		try {
			if (!this.caughtMon.length) return null;
			let output = `| Species | Name | Nick | Gender | Level | Held | Ability | Move 1 | Move 2 | Move 3 | Move 4 | Nature | Pokeball | Time Caught | Box # |\n`;
			output +=    `| ------- | ---- | ---- | ------ |:-----:| ---- | ------- | ------ | ------ | ------ | ------ | ------ | -------- | ----------- | ----- |\n`;
			this.caughtMon.forEach(m=>{
				output +=`| ${m.species} | ${m.nicknamed?m.name:""} | | ${m.gender.charAt(0).toLowerCase()} `;
				output +=`| ${m.level} | ${m.item||"none"} | ${m.ability} `;
				output +=`| ${m.moves[0]||""} | ${m.moves[1]||""} | ${m.moves[2]||""} | ${m.moves[3]||""} `;
				output +=`| ${m.nature.slice(0, m.nature.indexOf(',') )} | ${m.caughtIn} | ${timestamp} | ${m.storedIn} |\n`;
			});
			return output;
		} catch (e) {
			console.error('Error generating catch table!', e);
		}
		return `[*Error generating table*]`;
	}
}


/** Compares two arrays to see if everything from arr1 is accounted for in arr2, and returns the difference. */
function differenceBetween(arr1, arr2, hashFn) {
	if (!Array.isArray(arr1) || !Array.isArray(arr2)) throw new TypeError('Pass arrays!');
	let hash2 = {};
	arr2.forEach(x=> hash2[hashFn(x)] = true);
	return arr1.filter(a=> !hash2[hashFn(a)] );
}

/////////////////////////////////////////// Discoveries ////////////////////////////////////////////

discoveries = [
	function mapChange(prev, curr, report) {
		console.log(require('util').inspect(curr.location, { depth: 1 }));
		if (prev.location === curr.location) return; // No map change
		report.mapChange = {}; // Submit a report on the map change
		let steps = report.mapChange.steps = curr.location.getStepsTo(prev.location);
		if (steps <= 1) {
			// Simple movement between rooms
			if (curr.location.is('indoors')) {
				if (!prev.location.is('indoors')) report.mapChange.movementType = 'enter';
			} else {
				if (prev.location.is('indoors')) report.mapChange.movementType = 'exit';
				if (curr.location.is('inTown') && !prev.location.is('inTown')) {
					report.mapChange.movementType = 'arrive'; // arrive in town
				}
			}
		} else if (steps > 5) {
			// Swift momvement beyond connections
			if (!prev.location.is('entralink') && curr.location.is('entralink')) {
				report.mapChange.movementType = 'entralink-in';
			}
			if (prev.location.is("entralink") && !curr.location.is('entralink')) {
				report.mapChange.movementType = 'entralink-out';
			}
			else if (curr.location.within('flySpot', curr.position)) {
				report.mapChange.movementType = 'fly';
			}
			// TODO check if we're in the pokemon center above these flySpots
			else if (prev.location.is('dungeon') && !curr.location.is('dungeon')) {
				report.mapChange.movementType = 'dig'; // check if used escape rope later
			}
		}
		if (this.prevLocs.includes(curr.location)) {
			report.mapChange.recent = true;
			report.mapChange.last = this.prevLocs[0] === curr.location;
		} else if (curr.location.has('announce')) {
			report.mapChange.announcement = curr.location.has('announce');
		}
		this.prevLocs.pop(); // Pop oldest location
		this.prevLocs.unshift(curr.location); // Put newest location on front of queue
		
		let area = curr.location.getArea();
		if (this.prevAreas[0] !== area) {
			report.mapChange.newArea = true;
			if (this.prevAreas.includes(area)) {
				report.mapChange.newAreaAgain = true;
			}
			
			this.prevAreas.pop(); // Pop oldest location
			this.prevAreas.unshift(curr.location); // Put newest location on front of queue
		}
	},
	function aquirePokemon(prev, curr, report) {
		let deltamons = differenceBetween(curr.allmon, prev.allmon, x=>x.hash);
		if (deltamons.length) {
			report.newPokemon = deltamons;
		}
	},
	function releasePokemon(prev, curr, report) {
		let deltamons = differenceBetween(prev.allmon, curr.allmon, x=>x.hash);
		if (deltamons.length) {
			report.lostPokemon = deltamons;
		}
	},
	function itemDeltas(prev, curr, report) {
		let deltaitems = {};
		Object.keys(curr.allitems).forEach(x => deltaitems[x] = curr.allitems[x]);
		Object.keys(prev.allitems).forEach(x => deltaitems[x] = (deltaitems[x] || 0) - prev.allitems[x]);
		Object.keys(deltaitems).forEach(x =>{ if (deltaitems[x] == 0) delete deltaitems[x]; });
		if (Object.keys(deltaitems).length) {
			report.deltaItems = deltaitems;
		}
	},
	function discoverInParty(prev, curr, report) {
		let sameMons = [];
		// Find our mon pars from previous party to next party.
		for (let a = 0; a < prev.party.length; a++) {
			for (let b = 0; b < curr.party.length; b++) {
				if (curr.party[b].hash === prev.party[a].hash) {
					sameMons.push({ prev:prev.party[a], curr:curr.party[b]});
				}
			}
		}
		
		let monReports = [];
		sameMons.forEach((pair)=>{
			let rep = { mon : pair.curr };
			discoveries_party.forEach((f)=>{
				f.call(this, pair, rep);
			});
			if (Object.keys(rep).length) monReports.push(rep);
			if (rep.hatched) {
				report.hatched = (report.hatched||[]);
				report.hatched.push(pair.curr);
			}
		});
		if (monReports.length) report.monChanges = monReports;
		
		/////////////////////
		let hpWasHealed = 0;
		let ppWasHealed = 0;
		sameMons.forEach(({prev:p, curr:c})=>{
			let ppheal = 0;
			for (let i = 0; i < c.moveInfo.length; i++) {
				if (c.moves[i] !== p.moves[i]) continue;
				if (c.moveInfo[i].pp === c.moveInfo[i].max_pp) {
					if (p.moveInfo[i].pp < p.moveInfo[i].max_pp) ppheal++;
				}
				if (c.moveInfo[i].pp < c.moveInfo[i].max_pp) {
					ppheal -= 5; //If there's still missing PP, we weren't healed
				}
			}
			if (ppheal > 0) ppWasHealed++;
			
			if (p.hp < 100 && c.hp === 100) hpWasHealed++;
		});
		
		console.log(`blackout discovery: pp=${ppWasHealed}, hp=${hpWasHealed}`);
		if (ppWasHealed > 0 && hpWasHealed > 1) {
			if ((prev.location.is('e4') && !curr.location.is('e4')) || curr.location.is('e4') === 'lobby' || curr.location.is('e4') === 'e4') {
				report.blackout = 'e4turnover';
			} else if (report.mapChange  && (curr.location.is('healing') === 'pokecenter' || report.mapChange.steps > 2)) {
				// This is definitely a blackout
				report.blackout = true;
			} else if (curr.location.is('healing') === 'pokecenter') {
				report.healed = 'atCenter';
			} else if (curr.location.within('healing', curr.position)) {
				report.healed = curr.location.get('healing');
			} else {
				report.healed = true;
			}
		}
	},
	function gymWatch(prev, curr, report) {
		if (curr.location.is('gym')) {
			console.log(`IN GYM: in_battle=${curr.in_battle} pos=${curr.position} near=${curr.location.within('leader', curr.position, 2)}`)
			if (curr.in_battle && curr.location.within('leader', curr.position, 2)) {
				let leader = curr.location.get('leader');
				report.gymFight = leader;
				// let badge = curr.location.has('badge');
			}
			let b = curr.location.get('badge');
			if (!prev.badges[b] && curr.badges[b]) {
				report.badgeGet = b;
			}
		}
	},
	function e4watch(prev, curr, report) {
		if (prev.location.is('e4') === 'lobby') {
			if (curr.location.is('e4') === 'e4') {
				report.e4 = 'runStarted';
			}
		} else if (prev.location.is('e4') !== 'lobby' && prev.location.is('e4') !== 'e4') {
			if (curr.location.is('e4') === 'e4') {
				report.e4 = 'runStarted';
			}
		} else if (prev.location.is('e4') === 'e4') {
			if (curr.location.is('e4') === 'champion') {
				report.e4 = 'championReach';
			}
		} else if (prev.location.is('e4') === 'champion') {
			if (curr.location.is('e4') === 'hallOfFame') {
				report.e4 = 'hallOfFame';
			}
		} else if (prev.location.is('e4')) {
			if (!curr.location.is('e4')) {
				report.e4 = 'turnover';
			}
		}
		if (curr.location.is('e4')) {
			if (curr.in_battle && curr.location.within('leader', curr.position, 6)) {
				report.e4Fight = curr.location.get('leader');
			}
		}
	},
];

discoveries_party = [
	function levelUp({prev, curr}, report) {
		if (prev.level < curr.level) {
			report.levelup = curr.level;
		}
	},
	function evolution({prev, curr}, report) {
		if (prev.species !== curr.species) {
			if (prev.species === 'Egg') {
				report.hatched = true;
			} else {
				report.evolved = { from:prev.species, to:curr.species };
			}
		}
	},
	function pokerus({prev, curr}, report) {
		if ((!prev.pokerus && curr.pokerus) || (prev.pokerus && !curr.pokerus)) {
			report.pokerus = curr.pokerus;
		}
	},
	function hpwatch({prev, curr}, report) {
		if (prev.hp > 0 && curr.hp === 0) {
			report.fainted = true;
		}
	},
	function itemwatch({prev, curr}, report) {
		if (prev.item !== curr.item) {
			report.helditem = { took:prev.item, given:curr.item };
		}
	},
	function moveLearn({prev, curr}, report) {
		let moveChanges = {};
		for (let i = 0; i < 4; i++) {
			let a = prev.moves[i] || "_"+i;
			let b = curr.moves[i] || "_"+i;
			if (a === b) continue;
			moveChanges[a] = b;
		}
		lblFix: // Eliminate bad duplicates
		while (true) {
			let keys = Object.keys(moveChanges);
			for (let i = 0; i < keys.length; i++) {
				let a = keys[i];
				let b = moveChanges[a];
				if (!moveChanges[b]) continue;
				if (moveChanges[b] === a) {
					 // Simple switch, delete both
					delete moveChanges[a];
					delete moveChanges[b];
					continue lblFix; //Restart this mess
				} else {
					moveChanges[a] = moveChanges[b];
					delete moveChanges[b];
					continue lblFix; //Restart this mess
				}
			}
			break; //If we get to here, everything should be fixed.
		}
		if (Object.keys(moveChanges).length) {
			report.movelearn = moveChanges;
		}
	},
];

//////////////////////////////////////////// Collators /////////////////////////////////////////////

collators = [
	// Caught new pokemon
	function newPokemon(tags) {
		/*
**Caught a [male Lv. 24 Torterra](#info "Grass/Ground | Item: None | Ability: Sticky Hold | Nature: Lax, Hates to lose
Caught In: Pokeball | Moves: ThunderPunch, Entrainment, Sacred Sword, Synthesis
Has PokeRus")!** No nickname. (Sent to Box #1)
		*/
		if (tags && !tags.catches) return;
		let fullText = [];
		if (this.report.newPokemon) {
			this.report.newPokemon.forEach((mon)=>{
				//check if it is one of the MIA pokemon...
				if (this.memory.miaPokemon && this.memory.miaPokemon[mon.hash]) {
					console.log(`FOUND POKEMON: ${mon.name} (${mon.species})!`)
					delete this.memory.miaPokemon[mon.hash];
					return; // Skip!
				}
				
				let exInfo = this.generateExtendedInfo(mon);
				fullText.push(`**Caught a [${(mon.shiny?"shiny ":"")}${this.lowerCase(mon.gender)} Lv. ${mon.level} ${mon.species}](#info "${exInfo}")!**`+
					` ${(!mon.nicknamed)?"No nickname.":"Nickname: `"+mon.name+"`"}${(mon.storedIn)?" (Sent to Box #"+mon.storedIn+")":""}`);
				this.caughtMon.push(mon);
			});
		}
		if (this.report.hatched) {
			this.report.hatched.forEach((mon)=>{
				let exInfo = this.generateExtendedInfo(mon);
				fullText.push(`**The Egg hatched into a [${(mon.shiny?"shiny ":"")}${this.lowerCase(mon.gender)} Lv. ${mon.level} ${mon.species}](#info "${exInfo}")!**`+
					` ${(mon.species===mon.name)?"No nickname.":"Nickname: `"+mon.name+"`"}`);
			});
		}
		if (fullText.length) {
			return fullText.join(' ');
		}
	},
	function lostPokemon(tags) {
		if (tags) return;
		if (this.report.lostPokemon) {
			this.memory.miaPokemon = (this.memory.miaPokemon||{});
			this.report.lostPokemon.forEach(x=>{
				this.memory.miaPokemon[x.hash] = x;
				console.log(`LOST POKEMON: ${x.name} (${x.species})!`);
			});
		}
		if (this.memory.miaPokemon && this.report.mapChange) {
			let missing = Object.keys(this.memory.miaPokemon);
			if (!missing.length) return;
			let names = [];
			missing.forEach(x=>{
				names.push(this.getName(this.memory.miaPokemon[x], true));
			});
			delete this.memory.miaPokemon;
			if (names.length > 1) names[names.length-1] = "and "+names[names.length-1];
			return `**We may have released ${names.join(', ')}!!** (The API no longer reports ${names.length>1?"these":"this"} pokemon has present. Updater please confirm.)`;
		}
	},
	
	function partyUpdate(tags) {
		if (tags && !tags.level) return;
		let fullText = [];
		this.report.monChanges.forEach((progress)=>{
			let mon = progress.mon;
			let name = this.getName(mon)+' ';
			if (progress.evolved) name = `${mon.name} (${progress.evolved.from}) `;
			let text = [];
			if (progress.levelup) text.push(`has grown to Level ${progress.levelup}`);
			if (progress.evolved) text.push(`evolved into a ${progress.evolved.to}`);
			if (progress.movelearn) {
				let ml = progress.movelearn;
				Object.keys(ml).forEach((m) => {
					if (m.charAt(0) === "_") {
						text.push(`learned ${ml[m]}`);
					} else if (ml[m].charAt(0) === "_") {
						text.push(`forgot ${m}`);
					} else {
						text.push(`learned ${ml[m]} over ${m}`);
					}
				});
			}
			if (!text.length) return;
			if (text.length > 1) text[text.length-1] = "and "+text[text.length-1];
			fullText.push(name + text.join(', ') + "!");
		});
		
		if (!fullText.length) return;
		return `**${fullText.join(' ')}**`;
	},
	function hpWatch(tags) {
		if (tags) return;
		let fullText = [];
		this.report.monChanges.forEach((x)=>{
			if (x.fainted) fullText.push(this.getName(x.mon));
		});
		if (!fullText.length) return;
		if (fullText.length > 1) fullText[fullText.length-1] = "and "+fullText[fullText.length-1];
		return `**${fullText.join(', ')} ${fullText.length>1?"have":"has"} fainted!**`;
	},
	
	
	// Items
	function heldItemWatch(tags) {
		if (tags && !tags.items) return;
		let fullText = [];
		this.report.monChanges.forEach(x=>{
			if (!x.helditem) return; //skip
			if (x.helditem.took && x.helditem.given) {
				fullText.push(`We take ${this.correctCase(x.helditem.took)} from ${this.getName(x.mon)} and give ${x.mon.gender==='Female'?"her":"him"} a ${this.correctCase(x.helditem.given)} to hold.`);
			} else if (x.took) {
				fullText.push(`We take ${this.correctCase(x.helditem.took)} from ${this.getName(x.mon)}.`);
			} else if (x.given) {
				fullText.push(`We give a ${this.correctCase(x.helditem.given)} to ${this.getName(x.mon)} to hold.`);
			}
			if (this.report.deltaItems) { // Adjust item deltas as they're accounted for here
				let delta = this.report.deltaItems;
				if (x.took && delta[x.took]) delta[x.took]--;
				if (x.given && delta[x.given]) delta[x.given]++;
			}
		});
		if (!fullText.length) return;
		return `**${fullText.join(" ")}**`;
	},
	function itemVending(tags) {
		if (tags && !(tags.items || tags.shopping)) return;
		this.progressiveTickDown("vending");
		if (!this.report.deltaItems) return;
		if (!this.currInfo.location.within('vending', this.currInfo.position, 10)) return;
		let fullText = [];
		let delta = this.report.deltaItems;
		
		_vend('Fresh Water');
		_vend('Soda Pop');
		_vend('Lemonade');
		
		if (!fullText.length) return;
		if (fullText.length > 1) fullText[fullText.length-1] = "and "+fullText[fullText.length-1];
		return this.progressive("vending",
			`**We buy ${fullText.join(", ")} from a nearby vending machine.**`
			`We vend more items: **${fullText.join(", ")}**`,
			`Still buying items from the vending machine: **${fullText.join(", ")}**`,
			`Still vending: **${fullText.join(", ")}**`,
			`♪ Vending, vending, vending... ♪ **${fullText.join(", ")}**`,
			`♪ ...keep on keep on vending... ♫ **${fullText.join(", ")}**`,
			`♪ ...vending, vending, vending... ♫ *AWAY!!*... **${fullText.join(", ")}**`,
			`Vending: **${fullText.join(", ")}**`
		);
		
		function _vend(item) {
			if (!delta[item] || delta[item] <= 0) return;
			fullText.push(`${delta[item]} ${this.correctCase(item)}`)
			delete delta[item];
		}
	},
	function escapeRopeCheck(tags) {
		if (tags) return;
		if (!this.report.deltaItems || !this.report.mapChange) return;
		if (this.report.deltaItems['Escape Rope'] < 0 && this.report.mapChange.movementType === 'dig') {
			this.report.deltaItems['Escape Rope']++;
			this.report.mapChange.movementType = 'escape';
			// Report generated afterwards
		}
	},
	function itemPickup(tags) {
		if (tags && !tags.items) return;
		if (!this.report.deltaItems) return;
		let delta = this.report.deltaItems;
		if (Object.keys(delta).length === 0) return;
		if (Object.keys(delta).length === 1) {
			let item = Object.keys(delta)[0];
			let amount = delta[item];
			item = this.correctCase(item);
			if (amount === 0) return;
			if (amount > 0) {
				if (this.currInfo.location.has('shopping')) {
					return `**Bought ${amount} ${item}(s)!**`;
				} else {
					return `**Acquired ${amount} ${item}(s)!**`;
				}
			} else {
				if (this.currInfo.location.has('shopping')) {
					return `**Sold ${-amount} ${item}(s)!**`;
				} else {
					// return `Used/tossed ${-amount} ${item}(s)!`;
				}
				return;
			}
		} else {
			let buy = [], sell = [];
			Object.keys(delta).forEach((item, index)=>{
				let itemName = this.correctCase(item);
				let amount = delta[item];
				if (amount === 0) return; //Continue
				if (amount > 0 )
					buy.push(`${amount} ${itemName}`);
				else
					sell.push(`${-amount} ${itemName}`);
			});
			if (!buy.length && !sell.length) return;
			if (buy.length > 1) buy[buy.length-1] = "and "+buy[buy.length-1];
			if (sell.length > 1) sell[sell.length-1] = "and "+sell[sell.length-1];
			
			if (this.currInfo.location.has('shopping')) {
				if (buy.length) buy = this.rand(`We buy ${buy.join(', ')}.`);
				if (sell.length) sell = this.rand(`We sell ${sell.join(', ')}.`);
			} else {
				if (buy.length) buy = this.rand(`We aquire ${buy.join(', ')}.`);
				if (sell.length) sell = this.rand(`We toss ${sell.join(', ')}.`);
			}
			return `**${[buy, sell].join(' ').trim()}**`;
		}
	},
	
	function shopping(tags) {
		if (!tags) return; // This section only runs when helping out
		let delta = this.report.deltaItems;
		if (delta) {
			// Collate items into the shopping list
			Object.keys(delta).forEach((item)=>{
				this.shopping[item] = (this.shopping[item] || 0) + delta[item];
			});
		}
		
		// Only on map change
		if (this.report.mapChange) {
			try {
				// Only report if the previous area had shopping
				if (!this.prevInfo.location.has('shopping')) return;
				
				let buy = [], sell = [];
				Object.keys(this.shopping).forEach((item)=>{
					let itemName = this.correctCase(item);
					let amount = this.shopping[item];
					if (amount === 0) return; //Continue
					if (amount > 0 )
						buy.push(`${amount} ${itemName}`);
					else
						sell.push(`${-amount} ${itemName}`);
				});
				if (!buy.length && !sell.length) return;
				if (buy.length > 1) buy[buy.length-1] = "and "+buy[buy.length-1];
				if (sell.length > 1) sell[sell.length-1] = "and "+sell[sell.length-1];
				if (buy.length) buy = `We bought ${buy.join(', ')}.`;
				if (sell.length) sell = `We sold ${sell.join(', ')}.`;
				return `**Results of our shopping spree:** ${[buy, sell].join('').trim()}`;
			} finally {
				// Finally, clear the shopping list
				this.shopping = {};
			}
		}
	},
	
	// E4 and Gym watches
	function blackoutHeal(tags) {
		if (tags) return;
		let texts = [];
		if (this.report.blackout) {
			this.progressiveTickDown('playbyplay');
			texts.push('**BLACKED OUT!**');
			if (this.memory.inE4Run) {
				this.memory.inE4Run = false;
				texts.push(`rip E4 Attempt #${this.memory.e4Attempt}.`);
			}
		}
		if (this.report.healed) {
			texts.push(`**We heal**`);
			switch(this.report.healed) {
				case 'atCenter': texts.push(`at a Poké Center.`); break;
				case 'doctor': texts.push(`thanks to a helpful doctor!`); break;
				case 'nurse': texts.push(`thanks to a helpful nurse!`); break;
				case 'house': texts.push(`at a heal house!`); break;
			}
		}
		return texts.join(' ');
	},
	function gymWatch(tags) {
		if (tags) return;
		let texts = [];
		if (this.report.gymFight && !this.memory.inGymFight) {
			if (!this.memory.gymAttempts) this.memory.gymAttempts = {};
			let leader = this.report.gymFight;
			let attempt = this.memory.gymAttempts[leader] = (this.memory.gymAttempts[leader]||0)+1;
			let warn = this.progressive('playbyplay', ` (I can't do a play-by-play, sorry...)`, '');
			
			texts.push(`**Vs ${leader}!** Attempt #${attempt}!${warn}`);
			this.alertUpdaters(`We're facing off against ${leader}! I can't play-by-play! Halp!`);
			this.memory.inGymFight = leader;
			this.memory.inGymFight_loc = this.currInfo.map_id;
		}
		if (this.memory.inGymFight && this.report.gymFight !== this.memory.inGymFight) {
			let leader = this.memory.inGymFight;
			let gymid = this.memory.inGymFight_loc; 
			this.memory.inGymFight = false;
			delete this.memory.inGymFight_loc;
			if (this.currInfo.map_id === gymid) { // We didn't change maps, we must have won!
				texts.push(`**Defeated ${leader}!**`);
			}
		}
		if (this.report.badgeGet) {
			texts.push(`**Got the ${this.report.badgeGet} Badge!**`);
		}
		return texts.join(' ');
	},
	function e4Watch(tags) {
		if (tags) return;
		if (!this.report.e4) return;
		let texts = [];
		let info = this.report.e4;
		if (info === 'runStarted' && !this.memory.inE4Run) {
			this.memory.inE4Run = true;
			this.memory.e4Attempt = (this.memory.e4Attempt || 0) + 1;
			texts.push(this.rand(
				`**We're locked into the E4 for Attempt #${this.memory.e4Attempt}!**`,
				`**We're in for E4 Attempt #${this.memory.e4Attempt}!**`,
				`**Welcome back to the E4! Attempt #${this.memory.e4Attempt}!**`,
				`**Hello, Elite Four! Attempt #${this.memory.e4Attempt}!**`,
				`**The door slams shut behind us! E4 Attempt #${this.memory.e4Attempt}!**`
			));
			
			this.alertUpdaters(`We're locked into the E4! This is Attempt #${this.memory.e4Attempt}! If anyone wants to take over, now would be the time!`);
			let warn = this.progressive('playbyplay', ` (Unfortunately, I am incapable of doing a play-by-play of this action. The stream API does not supply me with battle data.)`, '');
			if (warn) texts.push(warn);
		}
		if (this.memory.inE4Run) {
			if (this.report.e4Fight && !this.memory.inE4Fight) {
				let leader = this.report.e4Fight;
				texts.push(`**Vs ${leader}!**`);
				this.memory.inE4Fight = leader;
			}
			if (this.memory.inE4Fight && this.report.e4Fight !== this.memory.inE4Fight) {
				let leader = this.memory.inE4Fight;
				this.memory.inE4Fight = false;
				if (!this.report.mapChange) { // We didn't change maps, we must have won!
					texts.push(`**Defeated ${leader}!**`);
				}
			}
			if (info === 'championReach') {
				this.memory.champAttempt = (this.memory.champAttempt || 0) + 1;
				texts.push(`**WE'RE HEADING TO THE CHAMPION!!** Champion attempt #${this.memory.champAttempt} incoming!!`);
			}
			if (info === 'hallOfFame') {
				texts.push(`**We enter the HALL OF FAME!** ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`);
				delete this.memory.champAttempt;
				delete this.memory.e4Attempt;
				delete this.memory.inE4Run;
			}
		}
		return texts.join(' ');
	},
	
	// Location changes
	function mapChange(tags) { // Last
		if (tags) return;
		if (!this.report.mapChange) return;
		let report = this.report.mapChange;
		if (report.announcement) {
			return report.announcement;
		}
		
		let currLoc = this.currInfo.location.getArea();
		if (currLoc) {
			if (report.newArea) {
				return __report.call(this, currLoc);
			}
		} else {
			currLoc = this.currInfo.location;
			
			if (!currLoc.is('noteworthy')) return;
			return __report.call(this, currLoc);
		}
		return;
		
		function __report(currLoc){
			let area = currLoc.getName();
			let back = report.recent?'back ':'';
			let onto = currLoc.has('onto') || currLoc.is('inTown')?'into':'onto';
			let the = currLoc.has('the');
			if (the === false) the = '';
			else if (the === true) the = 'the ';
			else the += ' ';
			
			switch (report.movementType) {
				case 'enter': {
					let o = [
						`We head ${back}into ${the}${area}.`,
						`We head ${back}inside ${the}${area}.`,
						`We go ${back}into ${the}${area}.`,
						`We duck ${back}inside ${the}${area}.`,
						`We're ${back}in ${the}${area} now.`,
					];
					return this.randA(o);
				}
				case 'exit': {
					let o = [
						`We head ${back}outside ${onto} ${the}${area}.`,
						`We exit ${back}${onto} ${the}${area}.`,
						`We leave, ${back}out ${onto} ${the}${area}.`,
						`We journey ${back}out ${onto} ${the}${area}.`,
					];
					if (report.last) o.push(`Nevermind, back outside again.`);
					return this.randA(o);
				}
				case 'arrive': {
					let o = [
						`We arrive in ${the}${area}!`,
						`Welcome to ${the}${area}!`,
					];
					return this.randA(o);
				}
				case 'fly': {
					let o = [
						`We fly to ${the}${area}!`,
						`We hop on our flying Pokemon and arrive ${onto.slice(0,2)} ${the}${area}!`,
					];
					return this.randA(o);
				}
				case 'escape': {
					let o = [
						`**We use an Escape Rope!** Back ${onto.slice(0,2)} ${the}${area}!`,
						`**We escape rope back to the surface!** ${area}.`,
					];
					return this.randA(o);
				}
				case 'dig': {
					let o = [
						`**We dig out!** Back ${onto.slice(0,2)} ${the}${area}!`,
						`**We dig out of here!** ${area}.`,
						`**We dig our way back to ${the}${area}!**`,
					];
					return this.randA(o);
				}
				case 'entralink-in': {
					let o = [
						`And we dive back into the Entralink...!`,
						`And back we go, to the Entralink...!`,
						`And back into the Entralink we go... weeee!!`,
						`And we tap our watch and suddenly we are next to the Entralink tree...`,
						`And, suddenly, Entralink...`,
						`We check on the status of our Entralink tree...`,
					];
					return this.randA(o);
				}
				case 'entralink-out': {
					let o = [
						`We escape the Entralink again... ${area}`,
						`We pop back out of the virtual world... Welcome to ${the}${area}`,
						`We leave our ~~WOW~~ Entralink character behind and return to ${the}${area}`,
						`We escape the grasp of the Entralink again... ${area}`,
					];
					return this.randA(o);
				}
				default: {
					let o = [
						`Now ${onto.slice(0,2)} ${the}${area}.`,
						`${onto.charAt(0).toUpperCase()}${onto.charAt(1)} ${the}${area}.`, // In the Area.
						`${area}.`,
						`Welcome to ${the}${area}.`,
					];
					return this.randA(o);
				}
			}
		}
	},
];

module.exports = Reporter;
