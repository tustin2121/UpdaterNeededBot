// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	BattleContext: null,
	
	BattleStarted: {
		default: (item)=>{
			let m = `<b>Vs ${item.battle.displayName}!</b>`;
			if (item.attempt > 1) m += ` Attempt #${item.attempt}!`;
			return m;
		},
		report: `{{@report.text}}`,
		rematch: [
			`<b>Vs {{@battle.displayName}} again!</b>`,
			`<b>Vs {{@battle.displayName}} in a rematch!</b>`,
			`<b>Facing off against {{@battle.displayName}} in a rematch!</b>`,
		],
		wild: (item)=>{
			let m = `<b>Vs Wild ${item.battle.displayName}!</b>`;
			if (item.attempt > 1) m += ` Attempt #${item.attempt}!`;
			return m;
		},
	},
	
	BattleEnded: {
		//TODO
		default: null,
		report: `{{@report.wintext}}`,
		ended: [
			`<b>We defeat {{@battle.displayName}}!</b>`,
			`<b>Defeated {{@battle.displayName}}!</b>`,
		],
	},
	EnemyFainted: null, //TODO
	
	Blackout: {
		__meta__: { sort:20 },
		default: [
			`<b>BLACKED OUT!</b>`,
			`<b>We BLACK OUT!</b>`,
			`<b>BLACK OUT...</b>`,
		],
	},
	BlackoutContext: null,
	FullHealed: {
		default: [
			`<b>We heal!</b>`,
		],
		blackout: null, //should be covered by Blackout above
		pokecenter: [
			`<b>The nurse heals us!</b>`,
			`<b>We heal</b> at the Poké Center!`,
		],
		house: [ // Override with location announcement?
			`<b>We heal</b> at a heal house!`,
			`We sleep on a random person's floor! <b>Healed!</b>`,
		],
		doctor: [
			`A {{rand|nice|kind|helpful|}} doctor <b>heals our team!</b>`,
			`A {{rand|nice|kind|helpful|}} doctor <b>heals our team!</b> Thanks doc!`,
		],
		nurse: [
			`A {{rand|nice|kind|helpful|}} nurse <b>heals our team!</b>`,
			`A {{rand|nice|kind|helpful|}} nurse <b>heals our team!</b> Thanks!`,
			`A {{rand|sweet|helpful}} nurse <b>heals our team!</b> Ta, love!`,
		],
	},
	
	BadgeGet: {
		default: [
			`<b>Received the {{@badge}} Badge!</b>`,
			`<b>Got the {{@badge}} Badge!</b>`,
		],
	},
};