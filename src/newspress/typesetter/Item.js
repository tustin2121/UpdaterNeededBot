// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	GainItem: {
		// item = the item in question
		default: {
			single: [
				`<b>Acquired {{item|an}} {{item}}!</b>`,
			],
			multi: [
				`<b>Acquired {{#|, |and}}!</b>`,
			],
			item: `{{item|an}} {{item}}`,
		},
		shopping: {
			single: [
				`<b>Bought {{item|an}} {{item}}!</b>`,
			],
			multi: [
				`<b>Bought {{#|, |and}}!</b>`,
			],
			item: `{{item|an}} {{item}}`,
		},
		rotoloto: [
			`Roto Loto nets us <b>{{item|an}} {{item}}</b>.`,
			`Rotom decides to hand us <b>{{item|an}} {{item}}</b>.`,
			`Rotom interrupts us to give us <b>{{item|an}} {{item}}</b>.`,
		],
	},
	LostItem: {
		// item = the item in question
		default: {
			single: [
				`<b>Threw away {{item|an}} {{item}}!</b>`,
			],
			multi: [
				`<b>Threw away {{#|, |and}}!</b>`,
			],
			item: `{{item|an}} {{item}}`,
		},
		shopping: {
			single: [
				`<b>Sold {{item|an}} {{item}}!</b>`,
			],
			multi: [
				`<b>Sold {{#|, |and}}!</b>`,
			],
			item: `{{item|an}} {{item}}`,
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