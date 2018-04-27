// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	PokemonIsMissing: null,
	
	PokemonLost: {
		// mon = the missing pokemon
		default: null, //Do not report initially
		confirmed: [
			`<b>WE RELEASED {{@mon}}!</b>`,
			`<b>{{@mon}} HAS BEEN RELEASED! BYE {{uppercase|@mon.name}}!</b>`,
		],
		timeout: [
			`<b>We may have released {{@mon}}!</b> (The API no longer reports them!)`,
		],
	},
	PokemonGained: {
		// mon = the missing pokemon
		default: ({ mon })=>{
			let ext = mon.getExtendedInfo().replace(/"/g, `''`);
			let txt = `${mon._gender.toLowerCase()} Lv. ${mon.level} ${mon.species}`;
			
			if (mon.shiny) txt = `shiny ${txt}`;
			if (mon.sparkly) txt = `sparkly ${txt}`;
			if (mon.form) txt = `${txt} ${mon.form}`;
			txt = `<b>Caught a <info ext="${ext}">${txt}</info>!</b>`;
			
			if (mon.nicknamed) txt += ` Nickname: \`${mon.name}\``;
			else txt += ` No nickname.`;
			
			if (mon.storedIn && mon.storedIn.startsWith('box:')) {
				let box = mon.storedIn.slice(4);
				box = box.slice(0, box.indexOf('-'));
				txt += ` (Sent to Box #${box}.)`;
			}
			return txt;
		},
	},
	
	PokemonDeposited: {
		default: null, //should never happen
		pc: [
			`<b>We deposit {{@mon}} in box {{@boxnum}}!</b>`,
			`<b>Deposited {{@mon}} in box {{@boxnum}}!</b>`,
		],
		daycare: [
			`<b>We leave {{@mon}} with the daycare center.</b>`,
			`<b>We dump {{@mon}} into the daycare.</b>`,
			`<b>We drop {{@mon}} off at the daycare.</b>`,
			`<b>We leave {{@mon}} at the daycare.</b>`,
		],
	},
	PokemonRetrieved: {
		default: null, //should never happen
		pc: [
			`<b>We withdraw {{@mon}}!</b>`,
			`<b>We retrieve {{@mon}} from the PC!</b>`,
		],
		daycare: [
			`<b>We pick up {{@mon}} from the daycare.</b>`,
			`<b>We grab {{@mon}} from the daycare.</b>`,
			`<b>We take {{@mon}} back from the daycare.</b>`,
			`<b>We pay the daycare lady and take {{@mon}} back from the daycare.</b>`,
		],
	},
	
	PokemonTraded: {
		default: (item, { fillText })=>{
			const { mon, pastMon } = item;
			
			let ext = mon.getExtendedInfo().replace(/"/g, `''`);
			let txt = `${mon._gender.toLowerCase()} Lv. ${mon.level} ${mon.species}`;
			
			if (mon.shiny) txt = `shiny ${txt}`;
			if (mon.sparkly) txt = `sparkly ${txt}`;
			txt = `<b>We trade our ${pastMon} for a <info ext="${ext}">${txt}</info>!</b>`;
			
			if (mon.nicknamed) txt += ` Nickname: \`${mon.name}\``;
			else txt += ` No nickname.`;
			
			if (!mon.isTraded) {
				txt += fillText(` Thanks for taking care of {{him|@mon}}!`, item);
			} else {
				txt += fillText(` Taking care of {{@pastMon.name}}!`, item);
			}
			return txt;
		},
	},
};
