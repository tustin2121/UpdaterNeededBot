// report.js
// The thing which collates reports and creates an update to be posted.

class Reporter {
	constructor(memory, currInfo) {
		this.reports = {};
		this.memory = memory;
		this.currInfo = currInfo;
	}
	
	report(type, obj={}) {
		if (!this.reports[type]) {
			this.reports[type] = [];
		}
		this.reports[type].push(obj);
	}
	
	collate() {
		let texts = [];
		collators.forEach((fn)=>{
			let t = fn.call(this);
			if (t) texts.push(t);
		});
		if (!texts.length) return null;
		return texts.join(' ');
	}
}
module.exports = Reporter;

let collators = [
	function newPokemon() {
		let fullText = [];
		if (this.reports['newmon']) {
			this.reports['newmon'].forEach((x)=>{
				fullText.push(`**Caught a ${lowerCase(x.gender)} Lv. ${x.level} ${x.species}!** ${(x.species===x.name)?"No nickname.":"Nickname: `"+x.name+"`"}${(x.storedIn)?" (Sent to Box #"+x.storedIn+")":""}`);
			});
		}
		if (this.reports['hatched']) {
			this.reports['hatched'].forEach((x)=>{
				fullText.push(`**The Egg hatched into a ${lowerCase(x.gender)} Lv. ${x.level} ${x.species}!** ${(x.species===x.name)?"No nickname.":"Nickname: `"+x.name+"`"}`);
			});
		}
		if (fullText.length) {
			return fullText.join(' ');
		}
	},
	function partyLevel() {
		let monProgress = {};
		
		(this.reports['levelup']||[]).forEach((x)=>{
			monProgress[x.mon.hash] = { mon: x.mon, levelup: x.level, };
		});
		(this.reports['evolved']||[]).forEach((x)=>{
			if (!monProgress[x.mon.hash]) monProgress[x.mon.hash] = { mon: x.mon };
			monProgress[x.mon.hash].evolved = { from:x.from, to:x.to };
		});
		(this.reports['movelearn']||[]).forEach((x)=>{
			if (!monProgress[x.mon.hash]) monProgress[x.mon.hash] = { mon: x.mon };
			monProgress[x.mon.hash].moveChanges = x.moveChanges;
		});
		
		if (!Object.keys(monProgress).length) return;
		let fullText = []
		Object.keys(monProgress).forEach((hash)=>{
			let progress = monProgress[hash];
			let mon = progress.mon;
			
			let name = `${mon.name} (${progress.evolved?progress.evolved.from:mon.species}) `;
			let text = [];
			if (progress.levelup) text.push(`has grown to Level ${progress.levelup}`);
			if (progress.evolved) text.push(`evolved into a ${progress.evolved.to}`);
			if (progress.moveChanges) {
				let ml = progress.moveChanges;
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
			if (text.length > 1) text[text.length-1] = "and "+text[text.length-1];
			fullText.push(name + text.join(', ') + "!");
		});
		
		if (!fullText.length) return;
		return `**${fullText.join(' ')}**`;
	},
	function hpWatch() {
		if (!this.reports['fainted']) return;
		let fullText = [];
		this.reports['fainted'].forEach(x=>{
			fullText.push(`${x.mon.name} (${x.mon.species})`);
		});
		if (fullText.length > 1) fullText[fullText.length-1] = "and "+fullText[fullText.length-1];
		return `**${fullText.join(', ')} ${fullText.length>1?"have":"has"} fainted!**`;
	},
	function heldItemWatch() {
		if (!this.reports['helditem']) return;
		let fullText = [];
		this.reports['helditem'].forEach(x=>{
			if (x.took && x.given) {
				fullText.push(`We take ${correctCase(x.took)} from ${x.mon.name} (${x.mon.species}) and give ${x.gender==='Female'?"her":"him"} a ${correctCase(x.given)} to hold.`);
			} else if (x.took) {
				fullText.push(`We take ${correctCase(x.took)} from ${x.mon.name} (${x.mon.species}).`);
			} else if (x.given) {
				fullText.push(`We give a ${correctCase(x.given)} to ${x.mon.name} (${x.mon.species}) to hold.`);
			}
			if (this.reports['itemdelta']) { // Adjust item deltas as they're accounted for here
				let delta = this.reports['itemdelta'][0];
				if (x.took && delta[x.took]) delta[x.took]--;
				if (x.given && delta[x.given]) delta[x.given]++;
			}
		});
		return `**${fullText.join(" ")}**`;
	},
	function itemPickup() {
		if (!this.reports['itemdelta']) return;
		let delta = this.reports['itemdelta'][0];
		if (Object.keys(delta).length === 0) return;
		if (Object.keys(delta).length === 1) {
			let item = Object.keys(delta)[0];
			let amount = delta[item];
			item = correctCase(item);
			if (amount === 0) return;
			if (amount > 0) {
				if (this.currInfo.location.isMart) {
					return `**Bought ${amount} ${item}(s)!**`;
				} else {
					return `**Acquired ${amount} ${item}(s)!**`;
				}
				return;
			} else {
				if (this.currInfo.location.isMart) {
					return `**Sold ${amount} ${item}(s)!**`;
				} else if (/ball$/i.test(item)) {
					// return `We're tossing ${amount} ${item}s!`;
				} else {
					// return `Used/tossed ${amount} ${item}(s)!`;
				}
				return;
			}
		} else {
			let txt = [];
			Object.keys(delta).forEach((item, index)=>{
				let itemName = correctCase(item);
				let amount = delta[item];
				if (amount === 0) return; //Continue
				txt.push(`${amount} ${itemName}`);
			});
			if (!txt.length) return;
			if (txt.length > 1) txt[txt.length-1] = "and "+txt[txt.length-1];
			
			if (this.currInfo.location.isMart) {
				return rand(`**We buy `, `**Buying `) + txt.join(', ') + ".**";
			} else {
				return rand(`**We acquired `) + txt.join(', ') + ".**";
			}
		}
	},
	
	function blackoutHeal() {
		let fullText = [];
		if (this.reports['blackout']) {
			let info = this.reports['blackout'][0];
			fullText.push('**BLACKED OUT!**');
			if (this.memory.inE4Run) {
				this.memory.inE4Run = false;
				fullText.push(`rip E4 Attempt #${this.memory.e4Attempt}.`);
			}
		}
		if (this.reports['healed']) {
			let info = this.reports['healed'][0];
			fullText.push(`**We heal**`);
			if (info.atCenter) {
				fullText.push(`at a Poké Center.`); //Pokémon
			}
		}
		if (this.reports['e4']) {
			let info = this.reports['e4'][0];
			if (info.runStarted && !this.memory.inE4Run) {
				this.memory.inE4Run = true;
				this.memory.e4Attempt = (this.memory.e4Attempt || 0) + 1;
				fullText.push(rand(
					`**We're locked into the E4 for Attempt #${this.memory.e4Attempt}!**`,
					`**We're in for E4 Attempt #${this.memory.e4Attempt}!**`,
					`**Welcome back to the E4! Attempt #${this.memory.e4Attempt}!**`,
					`**Hello, Elite Four! Attempt #${this.memory.e4Attempt}!**`,
					`**The door slams shut behind us! E4 Attempt #${this.memory.e4Attempt}!**`
				));
				
				if (!this.memory.iAmABotWarning) {
					fullText.push(`(Unfortunately, I am incapable of doing a play-by-play of this action. The stream API does not supply me with battle data.)`);
					this.memory.iAmABotWarning = true;
				}
			}
		}
		return fullText.join(' ');
	},
	function mapNameChange() { // Last
		if (!this.reports['mapchange-name']) return;
		let loc = correctCase(this.reports['mapchange-name'][0].display);
		return rand(`In ${loc}.`, `Arrived in ${loc}.`, `We walk into ${loc}.`, `${loc}.`, `Welcome to ${loc}.`);
	},
];

function rand(...opts) {
	return opts[Math.floor(Math.random()*opts.length)];
}

function plural(n, txt1, txtn) {
	if (n === 1) return txt1;
	return txtn;
}

function correctCase(str) {
	return str.split(' ')
			.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
			.join(' ');
}

function lowerCase(str) {
	if (typeof str === 'string') return str.toLowerCase();
	return str;
}