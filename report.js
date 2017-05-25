// report.js
// report.js
// report.js
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
	
	// progressive text responses
	progressive(memKey, ...opts) {
		memKey = `%progressive.${memKey}`;
		this.memory[memKey] = (this.memory[memKey] || 0) + 1;
		let t = opts[Math.ceil(this.memory[memKey])];
		if (!t) t = opts[opts.length-1];
		return t;
	}
	
	progressiveTickDown(memKey) {
		memKey = `%progressive.${memKey}`;
		this.memory[memKey] = Math.max((this.memory[memKey] || 0) - 0.25, 0);
	}
	
	rand(...opts) {
		return opts[Math.floor(Math.random()*opts.length)];
	}
}
module.exports = Reporter;

let collators = [
	// Caught new pokemon
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
	
	// Party update
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
	
	// Items
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
	function itemVending() {
		this.progressiveTickDown("vending");
		if (!this.reports['itemdelta']) return;
		if (!this.currInfo.location.within('vending', this.currInfo.position, 10)) return;
		let fullText = [];
		let delta = this.reports['itemdelta'][0];
		
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
			fullText.push(`${delta[item]} ${correctCase(item)}`)
			delete delta[item];
		}
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
				if (this.currInfo.location.has('shopping')) {
					return `**Bought ${amount} ${item}(s)!**`;
				} else {
					return `**Acquired ${amount} ${item}(s)!**`;
				}
				return;
			} else {
				if (this.currInfo.location.has('shopping')) {
					return `**Sold ${-amount} ${item}(s)!**`;
				} else {
					// return `Used/tossed ${amount} ${item}(s)!`;
				}
				return;
			}
		} else {
			let buy = [], sell = [];
			Object.keys(delta).forEach((item, index)=>{
				let itemName = correctCase(item);
				let amount = delta[item];
				if (amount === 0) return; //Continue
				if (amount > 0 )
					buy.push(`${amount} ${itemName}`);
				else
					sell.push(`${amount} ${itemName}`);
			});
			if (!buy.length && !sell.length) return;
			if (buy.length > 1) buy[buy.length-1] = "and "+buy[buy.length-1];
			if (sell.length > 1) sell[sell.length-1] = "and "+sell[sell.length-1];
			
			if (this.currInfo.location.has('shopping')) {
				if (buy.length) buy = rand(`We buy ${buy.join(', ')}.`);
				if (sell.length) sell = rand(`We sell ${sell.join(', ')}.`);
			} else {
				if (buy.length) buy = rand(`We aquire ${buy.join(', ')}.`);
				if (sell.length) sell = rand(`We toss ${sell.join(', ')}.`);
			}
			return `**${[buy, sell].join(' ')}**`;
		}
	},
	
	// Blackout / Healing
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
			if (this.memory.inE4Run) {
				if (info.championReach) {
					this.memory.champAttempt = (this.memory.champAttempt || 0) + 1;
					fullText.push(`**WE'VE REACHED THE CHAMPION! CHAMPION BATTLE, ATTEMPT #${this.memory.champAttempt} SHORTLY!**`);
				}
				if (info.hallOfFame) {
					fullText.push(`**We enter the HALL OF FAME!** [Victory Riot!]`);
					delete this.memory.champAttempt;
					delete this.memory.e4Attempt;
					delete this.memory.inE4Run;
					delete this.memory.iAmABotWarning;
				}
			}
		}
		return fullText.join(' ');
	},
	
	// Location changes
	function mapChange() { // Last
		if (!this.memory.lastArea) {
			this.memory.lastArea = this.memory.location.getArea();
		}
		
		if (!this.reports['mapchange']) return;
		let loc = this.currInfo.location.getArea();
		let lastArea = this.memory.lastArea;
		
		this.memory.lastArea = loc;
		
		
		
		if (loc.is('inTown')) {
			return
		}
		
		
		let loc = correctCase(this.reports['mapchange'][0].display);
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