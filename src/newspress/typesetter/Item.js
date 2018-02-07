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
				`<b>Acquired {{#|,|and}}!</b>`,
			],
			item: `{{item|an}} {{item}}`,
		},
		shopping: [
			`<b>Bought {{item|an}} {{item}}!</b>`,
		],
		rotoloto: [
			`Roto Loto nets us <b>{{item|an}} {{item}}</b>.`,
			`Rotom decides to hand us <b>{{item|an}} {{item}}</b>.`,
			`Rotom interrupts us to give us <b>{{item|an}} {{item}}</b>.`,
		],
	},
	LostItem: {
		// item = the item in question
		default: [
			`<b>Threw away {{item|an}} {{item}}.</b>`,
		],
		shopping: [
			`<b>Sold {{item|an}} {{item}}!</b>`,
		],
	},
	GiveMonItem: {
		// target = the pokemon involved
		// item = the item in question
		default: [
			`We give {{target}} {{item|an}} {{item}} to hold.`,
		],
	},
	TakeMonItem: {
		// target = the pokemon involved
		// item = the item in question
		default: [
			`We take {{target}}'s {{item}}.`,
			`We take {{target}}'s {{item}} and stow it in our bag.`,
		],
	},
	SwapMonItem: {
		// target = the pokemon involved
		// taken = the item taken from the target
		// given = the item given to the target
		default: [
			`We take {{target}}'s {{taken}} and give {{target|him}} {{given|an}} {{given}} to hold.`,
			`We take {{target}}'s {{taken}} and give {{target|him}} {{given|an}} {{given}} to hold instead.`,
			`We swap {{target}}'s {{taken}} for {{given|an}} {{given}}.`,
		],
	},
	Swap2MonItems: {
		// target1 = the first pokemon involved
		// target2 = the second pokemon involved
		// item1 = the item now held by target1
		// item2 = the item now held by target2
		default: [
			`We take {{target1}}'s {{item2}} and swap it with {{target2}}'s {{item1}}.`,
			`We look at {{target1}}'s {{item2}} and {{target2}}'s {{item1}} decide to swap the items.`,
			`After some shuffling, {{target1}} now holds {{item1}} and {{target2}} {{item1}}.`,
		],
		null1: [ // if target 1 is now holding nothing.
			`We take {{target1}}'s {{item2}} and give it to {{target2}} instead.`,
			`We look at {{target1}}'s {{item2}} decide it looks better with {{target2}}.`,
		],
		null2: [ // if target 2 is now holding nothing.
			`We take {{target2}}'s {{item1}} and give it to {{target1}} instead.`,
			`We look at {{target2}}'s {{item1}} decide it looks better with {{target1}}.`,
		],
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
};