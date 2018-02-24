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
			item: `{{amount}} {{item}}{{amount|s}}`,
		},
		shopping: {
			single: [
				`<b>Bought {{amount}} {{item}}!</b>`,
			],
			multi: [
				`<b>Bought {{#|, |and}}!</b>`,
			],
			item: `{{amount}} {{item}}{{amount|s}}`,
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
			item: `{{amount}} {{item}}{{amount|s}}`,
		},
		shopping: {
			single: [
				`<b>Sold {{amount}} {{item}}!</b>`,
			],
			multi: [
				`<b>Sold {{#|, |and}}!</b>`,
			],
			item: `{{amount}} {{item}}{{amount|s}}`,
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
			`We toss {{item|an}} {{item}} at the trainer's pokemon, but {{trainer.class|they}} block{{|s}} the ball. Don't be a thief!`,
			`We throw {{item|an}} {{item}} at the opponents's pokemon, to no avail.`,
			`We attempt to <rand>steal|take|snag</rand> {{trainer.name}}'s <rand>pokemon|{{enemy.species}}</rand>. {{trainer.class|They}} <rand>yells at us|scolds us|tells us off|tells us where we can shove our {{item}}</rand>.`,
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
	UsedItemOnMon: {
		//
		default: [
			`<b>We use {{item|an}} {{item}} on {{target}}!</b>`,
		],
		hpheal: [
			`<b>We heal {{target}} with {{item|an}} {{item}}!</b>`,
		],
		ppheal: [
			`We restore the PP of {{target}}'s {{move}} with <b>{{item|an}} {{item}}!</b>`,
			`We restore {{target}}'s {{move}} PP with <b>{{item|an}} {{item}}!</b>`,
		],
		pphealAll: [
			`We restore the PP of {{target}}'s moves with <b>{{item|an}} {{item}}!</b>`,
			`We restore {{target}}'s move PP with <b>{{item|an}} {{item}}!</b>`,
		],
		evostone: [
			`<b>We use {{item|an}} {{item}} on {{target}}!</b>`,
		],
		tm: [
			`We boot up a {{item}}.`,
		],
	},
	UsedTMItem: {
		default: [
			``, //TODO
		],
	},
};