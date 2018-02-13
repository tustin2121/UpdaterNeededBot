// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	GainItem: {
		// item = the item in question
		default: {
			single: [
				`<b>Acquired {{amount}} {{item}}!</b>`,
			],
			multi: [
				`<b>Acquired {{#|, |and}}!</b>`,
			],
			item: `{{amount}} {{item}}`,
		},
		shopping: {
			single: [
				`<b>Bought {{amount}} {{item}}!</b>`,
			],
			multi: [
				`<b>Bought {{#|, |and}}!</b>`,
			],
			item: `{{amount}} {{item}}`,
		},
		rotoloto: [
			`Roto Loto nets us <b>{{amount}} {{item}}</b>.`,
			`Rotom decides to hand us <b>{{amount}} {{item}}</b>.`,
			`Rotom interrupts us to give us <b>{{amount}} {{item}}</b>.`,
		],
	},
	LostItem: {
		// item = the item in question
		default: {
			single: [
				`<b>Threw away {{amount}} {{item}}!</b>`,
			],
			multi: [
				`<b>Threw away {{#|, |and}}!</b>`,
			],
			item: `{{amount}} {{item}}`,
		},
		shopping: {
			single: [
				`<b>Sold {{amount}} {{item}}!</b>`,
			],
			multi: [
				`<b>Sold {{#|, |and}}!</b>`,
			],
			item: `{{amount}} {{item}}`,
		},
	},
	
	StoredItemInPC: {
		default: {
			single: [
				`<b>Stored {{amount}} {{item}} in the PC!</b>`,
			],
			multi: [
				`<b>Stored {{#|, |and}} in the PC!</b>`,
			],
			item: `{{amount}} {{item}}`,
		},
	},
	RetrievedItemFromPC: {
		default: {
			single: [
				`<b>Retrieved {{amount}} {{item}} from the PC!</b>`,
			],
			multi: [
				`<b>Retrieved {{#|, |and}} from the PC!</b>`,,
			],
			item: `{{amount}} {{item}}`,
		},
	},
	
	UsedBallInBattle: {
		default: [
			`We toss {{item|an}} {{item}} at a wild {{enemy.species}}.`,
		],
		trainer: [
			`We toss {{item|an}} {{item}} at the trainer's pokemon, but {{enemy.trainer.class|she}} blocks the ball. Don't be a thief!`,
			`We throw {{item|an}} {{item}} at the opponents's pokemon, to no avail.`,
			`We attempt to <rand>steal|take|snag</rand> {{enemy.trainer.name}}'s <rand>pokemon|{{enemy.species}}</rand>. {{enemy.trainer.class|He}} <rand>yells at us|scolds us|tells us off|tells us where we can <rand>stick|shove</rand> our {{item}}</rand>.`,
			`We attempt to be a thief. The game tells us off.`,
		],
	},
	UsedBerryInBattle: {
		// item = the item involved
		// target = the pokemon involved
		default: [
			`{{target}} munches on {{target|his}} {{item}}.`,
			`{{target}} eats {{target|his}} {{item}}.`,
			`{{target}} eats {{target|his}} {{item}} in the heat of battle.`,
		],
	},
};