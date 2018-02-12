// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	PokemonIsMissing: null,
	
	PokemonLost: {
		// mon = the missing pokemon
		default: null, //Do not report initially
		confirmed: [
			`<b>WE RELEASED {{mon}}!</b>`,
			`<b>{{mon}} HAS BEEN RELEASED! BYE {{mon|uppercase}}!</b>`,
		],
		timeout: [
			`<b>We may have released {{mon}}!</b> (The API no longer reports them!)`,
		],
	},
	
	PokemonGained: {
		// mon = the missing pokemon
		default: ({ mon })=>{
			let ext = mon.getExtendedInfo().replace(/"/g, `''`);
			let txt = `${mon._gender.toLowerCase()} Lv. ${mon.level} ${mon.species}`;
			
			if (mon.shiny) txt = `shiny ${txt}`;
			if (mon.sparkly) txt = `sparkly ${txt}`;
			txt = `<b>Caught a <info ext="${ext}">${txt}</info>!</b>`;
			
			if (mon.nicknamed) txt += ` Nickname: \`${mon.name}\``;
			else txt += ` No nickname.`;
			
			if (mon.box) txt += ` (Sent to Box #${mon.box}.)`;
			return txt;
		},
	},
	
};
