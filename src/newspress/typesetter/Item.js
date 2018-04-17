// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	GainItem: {
		// item = the item in question
		default: {
			single: [
				`<b>Acquired {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>Acquired {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
		shopping: {
			single: [
				`<b>Bought {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>Bought {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
		rotoloto: [
			`Roto Loto nets us <b>{{some items|@item|@amount}}</b>.`,
			`Rotom decides to hand us <b>{{some items|@item|@amount}}</b>.`,
			`Rotom interrupts us to give us <b>{{some items|@item|@amount}}</b>.`,
		],
	},
	LostItem: {
		// item = the item in question
		default: {
			single: [
				`<b>Threw away {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>Threw away {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
		shopping: {
			single: [
				`<b>Sold {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>Sold {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
	},
	
	StoredItemInPC: {
		default: {
			single: [
				`<b>Stored {{an item|@item|@amount}} in the PC!</b>`,
			],
			multi: [
				`<b>Stored {{a comma-separated list of|an item|@item|@amount}} in the PC!</b>`,
			],
		},
	},
	RetrievedItemFromPC: {
		default: {
			single: [
				`<b>Retrieved {{an item|@item|@amount}} from the PC!</b>`,
			],
			multi: [
				`<b>Retrieved {{a comma-separated list of|an item|@item|@amount}} from the PC!</b>`,
			],
		},
	},
	
	UsedBallInBattle: {
		default: [
			`We toss {{some items|@item|@amount}} at a wild {{enemy.species}}.`,
		],
		trainer: [
			`We toss {{some items|@item|@amount}} at the trainer's pokemon, but {{they|@trainer}} block{{*s|@trainer}} the ball. Don't be a thief!`,
			`We throw {{some items|@item|@amount}} at the opponents's pokemon, to no avail.`,
			`We attempt to {{rand|steal|take|snag}} {{$@trainer}}'s {{Mon|@enemy}}. {{They}} {{rand|yell{{*s}} at us|scold{{*s}} us|tell{{*s}} us off|tell{{*s}} us where we can shove our {{@item}}}}.`,
			`We attempt to be a thief. The game tells us off.`,
		],
	},
	UsedBerryInBattle: {
		// item = the item involved
		// target = the pokemon involved
		default: [
			`{{$@target}} munches on {{his}} {{@item}}.`,
			`{{$@target}} eats {{his}} {{@item}}.`,
			`{{$@target}} eats {{his}} {{@item}} in the heat of battle.`,
		],
	},
	UsedItemOnMon: {
		//
		default: [
			`<b>We use {{an item|@item}} on {{@target}}!</b>`,
		],
		hpheal: [
			`<b>We heal {{@target}} with {{an item|@item}}!</b>`,
		],
		ppheal: [
			`We restore the PP of {{@target}}'s {{move}} with <b>{{an item|@item}}!</b>`,
			`We restore {{@target}}'s {{move}} PP with <b>{{an item|@item}}!</b>`,
		],
		pphealAll: [
			`We restore the PP of {{@target}}'s moves with <b>{{an item|@item}}!</b>`,
			`We restore {{@target}}'s move PP with <b>{{an item|@item}}!</b>`,
		],
		evostone: [
			`<b>We use {{an item|@item}} on {{@target}}!</b>`,
		],
		tm: [
			`We boot up {{an item|@item}}.`,
		],
	},
	UsedTMItem: {
		default: [
			``, //TODO
		],
	},
};