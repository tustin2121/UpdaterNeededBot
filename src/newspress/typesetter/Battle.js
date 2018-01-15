// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	BattleContext: null,
	
	BattleStarted: {
		default: (item)=>{
			let m = `**Vs ${item.battle.displayName}!**`;
			if (item.attempt > 1) m += ` Attempt #${item.attempt}!`;
			return m;
		},
		wild: (item)=>{
			let m = `**Vs Wild ${item.battle.displayName}!**`;
			if (item.attempt > 1) m += ` Attempt #${item.attempt}!`;
			return m;
		}
	},
	
};