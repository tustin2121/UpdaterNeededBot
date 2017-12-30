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
		default: (args)=>{
			let mon = args.mon;
			let ext = mon.getExtendedInfo().replace(/"/g, `''`);
			let a = `<b>Caught a <info ext="${ext}">${mon.gender} Lv. ${mon.level} ${mon.species}</info>!</b> Nickname: \`${mon.name}\``;
			if (mon.box) a += ` (Sent to Box #${mon.box}.)`;
			return a;
		},
	},
	
};
