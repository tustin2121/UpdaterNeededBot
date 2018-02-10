// newspress/typesetter/Health.js
// The phrasebook for Health-related LedgerItems

module.exports = {
	Blackout: {
		default: [
			`<b>BLACKED OUT!</b>`,
			`<b>We BLACK OUT!</b>`,
			`<b>BLACK OUT...</b>`,
		],
	},
	FullHealed: {
		default: [
			`<b>We heal!</b>`,
		],
		blackout: [
			`<b>We BLACKED OUT</b> and wake up at the Pokemon Center.`,
		],
		pokecenter: [
			`<b>The nurse heals us!</b>`,
			`<b>We heal</b> at the Poké Center!`,
		],
		house: [ // Override with location announcement?
			`<b>We heal</b> at a heal house!`,
			`We sleep on a random person's floor! <b>Healed!</b>`,
		],
		doctor: [
			`A <rand>nice|kind|helpful|</rand> doctor <b>heals our team!</b>`,
			`A <rand>nice|kind|helpful|</rand> doctor <b>heals our team!</b> Thanks doc!`,
		],
		nurse: [
			`A <rand>nice|kind|helpful|</rand> nurse <b>heals our team!</b>`,
			`A <rand>nice|kind|helpful|</rand> nurse <b>heals our team!</b> Thanks!`,
			`A <rand>sweet|helpful</rand> nurse <b>heals our team!</b> Ta, love!`,
		],
	},
};