// newspress/typesetter/Party.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	
	MonChangedCondensed: {
		default: null, //TODO
	},
	
	MonLeveledUp: {
		// target = the pokemon involved
		// level = the level grown to
		default: {
			single: [
				`<b>{{target}} has grown to level {{level}}!</b>`,
				`<b>{{target}} is now level {{level}}!</b>`,
				`<b>{{target}} has leveled up to {{level}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`levels up to {{level}}`,
				`grows to level {{level}}`,
			],
		},
		multiple: [
			`<b>{{target}} has grown {{deltaLevel|some}} levels to level {{level}}!</b>`,
		],
		regress: [
			`<b>{{target}} has lost {{deltaLevel|some}} levels, and is now level {{level}}!`,
		],
	},
	MonEvolved: {
		// target = the pokemon involved
		// level = the level grown to
		default: {
			single: [
				`<b>{{target.name}} ({{prev}}) has evolved into a {{curr}}!</b>`,
				`<b>{{target.name}} ({{prev}}) evolves into a {{curr}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`evolves into {{curr}}`,
			],
		},
	},
	
	MonHatched: {
		// target = the pokemon involved
		default: ({ mon })=>{
			let ext = mon.getExtendedInfo().replace(/"/g, `''`);
			let txt = `${mon._gender.toLowerCase()} Lv. ${mon.level} ${mon.species}`;
			
			if (mon.shiny) txt = `shiny ${txt}`;
			if (mon.sparkly) txt = `sparkly ${txt}`;
			txt = `<b>The egg hatched into a <info ext="${ext}">${txt}</info>!</b>`;
			
			if (mon.nicknamed) txt += ` Nickname: \`${mon.name}\``;
			else txt += ` No nickname.`;
			return txt;
		},
	},
	
	MonPokerusInfected: {
		default: [
			`<b>{{target}} has been infected with Pokerus!</b>`,
			`<b>{{target}} has caught Pokerus!</b>`,
		],
	},
	MonPokerusCured: {
		default: [
			`<b>{{target}} has been cured of Pokerus.</b>`,
		],
	},
	MonFainted: {
		default: {
			single: [
				`<b>{{target}} fainted!</b>`,
				`<b>{{target}} has fainted!</b>`,
			],
			multi: [
				`<b>{{#|, |and}} have fainted!</b>`,
				`<b>{{#|, |and}} all fainted!</b>`,
				`<b>{{#|, |and}} fainted!</b>`,
			],
			item: `{{target}}`,
		},
		kapow: {
			single: [
				`<b>{{target}} exploded!</b>`,
				`<b>{{target}} has exploded!</b>`,
			],
			multi: [
				`<b>{{#|, |and}} have exploded!</b>`,
				`<b>{{#|, |and}} all exploded!</b>`,
				`<b>{{#|, |and}} exploded!</b>`,
			],
			item: `{{target}}`,
		}
	},
	MonRevived: {
		default: [
			`<b>{{target}} has been revived!</b>`,
		],
	},
	MonHealedHP: null,
	MonHealedPP: null,
	MonLostHP: null,
	MonLostPP: null,
	MonPPUp: null,
	
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
			`A <rand>nice|kind|helpful|</rand> doctor <b>heals our team!</b>`,
			`A <rand>nice|kind|helpful|</rand> doctor <b>heals our team!</b> Thanks doc!`,
		],
		nurse: [
			`A <rand>nice|kind|helpful|</rand> nurse <b>heals our team!</b>`,
			`A <rand>nice|kind|helpful|</rand> nurse <b>heals our team!</b> Thanks!`,
			`A <rand>sweet|helpful</rand> nurse <b>heals our team!</b> Ta, love!`,
		],
	},
	
	MonLearnedMove: {
		//move = the learned move
		default: {
			single: [
				`<b>{{target}} learned {{move}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`learns {{move}}`,
			],
		},
	},
	MonLearnedMoveOverOldMove: {
		//move = the learned move
		//oldMove = the forgotton move
		default: {
			single: [
				`<b>{{target}} learned {{move}} over {{oldMove}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`learns {{move}} over {{oldMove}}`,
			],
		},
	},
	MonForgotMove: {
		//move = the forgotton move
		default: {
			single: [
				`<b>{{target}} forgot {{move}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`forgot {{oldMove}}`,
			],
		},
	},
	
	MonGiveItem: {
		// target = the pokemon involved
		// item = the item in question
		default: [
			`We give {{target}} {{item|an}} {{item}} to hold.`,
		],
	},
	MonTakeItem: {
		// target = the pokemon involved
		// item = the item in question
		default: [
			`We take {{target}}'s {{item}}.`,
			`We take {{target}}'s {{item}} and stow it in our bag.`,
		],
	},
	MonSwapItem: {
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
	
	MonShinyChanged: {
		default: null,
		became: [
			`{{target}} has inexplicably became shiny...`,
		],
		nolonger: [
			`{{target}} has inexplicably became no longer shiny...`,
		],
	},
	MonSparklyChanged: {
		default: null,
		became: [
			`{{target}} has inexplicably became N's former pokemon...`,
		],
		nolonger: [
			`{{target}} has inexplicably became no longer N's former pokemon...`,
		],
	},
	MonAbilityChanged: null,
	// MonAbilityChanged: {
	// 	default: null,
	// 	became: [
	// 		`{{target}} has inexplicably became N's former pokemon...`,
	// 	],
	// 	nolonger: [
	// 		`{{target}} has inexplicably became no longer N's former pokemon...`,
	// 	],
	// },
	
	MonNicknameChanged: {
		default: [
			`<b>We change the nickname of \`{{prev}}\` ({{mon.species}}) to \`{{curr}}\`.</b>`,
		],
	}
};