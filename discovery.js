// discovery.js
// The default info change discoveries and reporters

let me = module.exports = {
	discover : function(prev, curr, report) {
		me.discoveries.forEach(fn=>{
			fn.call(this, prev, curr, report);
		});
	},
	
	// A list of functions which discover differences between the previous info and the current info
	// Passed entries are (previous normalized data, current normalized data, reporter function)
	discoveries: [
		function mapChange(prev, curr, report) {
			if (curr.location.mapid !== prev.location.mapid) {
				report('mapchange', curr.location);
			}
			if (curr.location.display !== prev.location.display) {
				report('mapchange-name', curr.location);
			}
		},
		function aquirePokemon(prev, curr, report) {
			let deltamons = differenceBetween(curr.allmon, prev.allmon, x=>x.hash);
			if (deltamons.length) {
				deltamons.forEach(x => {
					report('newmon', x);
				});
			}
		},
		function releasePokemon(prev, curr, report) {
			let deltamons = differenceBetween(curr.allmon, prev.allmon, x=>x.hash);
			if (deltamons.length) {
				deltamons.forEach(x => {
					report('releasemon', x);
				});
			}
		},
		function itemDeltas(prev, curr, report) {
			let deltaitems = {};
			Object.keys(curr.allitems).forEach(x => deltaitems[x] = curr.allitems[x]);
			Object.keys(prev.allitems).forEach(x => deltaitems[x] = (deltaitems[x] || 0) - prev.allitems[x]);
			Object.keys(deltaitems).forEach(x =>{ if (deltaitems[x] == 0) delete deltaitems[x]; });
			if (Object.keys(deltaitems).length) {
				report('itemdelta', deltaitems);
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
			
			sameMons.forEach((pair)=>{
				me.discoveries_party.forEach((f)=>{
					f.call(this, pair, report);
				});
			});
		},
		function blackoutWatch(prev, curr, report) {
			let sameMons = [];
			// Find our mon pars from previous party to next party.
			for (let a = 0; a < prev.party.length; a++) {
				for (let b = 0; b < curr.party.length; b++) {
					if (curr.party[b].hash === prev.party[a].hash) {
						sameMons.push({ prev:prev.party[a], curr:curr.party[b]});
					}
				}
			}
			if (sameMons.length !== curr.party.length) return; // Don't bother this update if the party changed
			
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
				if (curr.location.isE4Lobby || curr.location.isE4RunStart) {
					report('blackout', { e4turnover: true });
				} else if (prev.location.mapid !== curr.location.mapid) {
					// This is definitely a blackout
					report('blackout');
				} else if (curr.location.isCenter) {
					report('healed', { atCenter: true });
				} else {
					report('healed');
				}
			}
		},
		function e4watch(prev, curr, report) {
			if (prev.location.isE4Lobby) {
				if (curr.location.isE4RunStart) {
					report ('e4', { runStarted: true });
				}
			} else if (!prev.location.isE4Lobby && !prev.location.isE4RunStart) {
				if (curr.location.isE4RunStart) {
					report ('e4', { runStarted: true });
				}
			}
		},
	],
	// A list of functions which discover differences specifically about the party itself
	discoveries_party: [
		function levelUp({prev, curr}, report) {
			if (prev.level < curr.level) {
				report('levelup', { mon:curr, level:curr.level });
			}
		},
		function evolution({prev, curr}, report) {
			if (prev.species !== curr.species) {
				if (prev.species === 'Egg') {
					report('hatched', curr);
				} else {
					report('evolved', { mon:curr, from:prev.species, to:curr.species });
				}
			}
		},
		function pokerus({prev, curr}, report) {
			if ((!prev.pokerus && curr.pokerus) || (prev.pokerus && !curr.pokerus)) {
				report('pokerus', {mon:curr, has:curr.pokerus });
			}
		},
		function hpwatch({prev, curr}, report) {
			if (prev.hp > 0 && curr.hp === 0) {
				report('fainted', {mon:curr});
			}
		},
		function itemwatch({prev, curr}, report) {
			if (prev.item !== curr.item) {
				report('helditem', { mon:curr, took:prev.item, given:curr.item });
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
				report('movelearn', { mon:curr, moveChanges: moveChanges });
			}
		},
	],
};

function differenceBetween(arr1, arr2, hashFn) {
	if (!Array.isArray(arr1) || !Array.isArray(arr2)) throw new TypeError('Pass arrays!');
	let hash2 = {};
	arr2.forEach(x=> hash2[hashFn(x)] = true);
	return arr1.filter(a=> !hash2[hashFn(a)] );
}
