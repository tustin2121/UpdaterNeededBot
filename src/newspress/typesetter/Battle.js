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
		ended: [
			`<b>We defeat {{@battle.displayName}}!</b>`,
			`<b>Defeated {{@battle.displayName}}!</b>`,
		],
	},
	EnemyFainted: null, //TODO
	
	BadgeGet: {
		default: [
			`**Received the {{@badge}} Badge!**`,
			`**Got the {{@badge}} Badge!**`,
		],
	},
};