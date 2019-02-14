// newspress/typesetter/BurningRed.js
// The phrasebook for BurningRed-related LedgerItems

const move = `{{rand|pass|step|move|walk|slide|travel}}`;

module.exports = {
	Gen1Context: {
		__meta__: { sort:9000, contextOnly:true, }, //In front of everything else
		default: '[Rd]',
	},
	Gen3Context: {
		__meta__: { sort:9000, contextOnly:true, }, //In front of everything else
		default: '[FR]',
	},
	BurningDownContext: null,
	BurningUpContext: null,
	
	BurningReport: {
		__meta__ : { sort:420 }, // Before everything
		red: [
			`We ${move} through the burning barrier into the monochrome past... <b>Back to Red!</b>`,
			`As we ${move} through the portal, we ${move} through the burning barrier... <b>Back to Red!</b>`,
			`Flames {{rand|surround|engulf|permiate|flow over|sweep across}} us as suddenly we have fewer colors... <b>Back to Red!</b>`,
		],
		firered: [
			`We ${move} through the burning barrier into the colorful future... <b>Back to FireRed!</b>`,
			`As we ${move} through the portal, we ${move} through the burning barrier... <b>Back to FireRed!</b>`,
			`Flames {{rand|surround|engulf|permiate|flow over|sweep across}} us as we suddenly have more colors... <b>Back to FireRed!</b>`,
		],
	},
};