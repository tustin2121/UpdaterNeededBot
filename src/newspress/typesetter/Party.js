// newspress/typesetter/Party.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	
	MonChangedCondensed: {
		default: {
			multi: `<b>{{@target}} {{a comma-separated merge list of|resolve item phrase}}!</b>`,
			//  ()=>{
			// 	let items = this._itemList.slice(1);
			// 	items = items.map(item=>this._resolve(`{{get phrasebook item}}`, item)).filter(x=>x);
			// 	if (items.length > 1) {
			// 		items[items.length-1] = 'and '+items[items.length-1];
			// 	}
			// 	if (items.length == 2) return `<b>{{@target}} ${items.join(' ')}!</b>`;
			// 	return `<b>{{@target}} ${items.join(', ')}!</b>`;
			// },
		}
	},
	
	MonLeveledUp: {
		__meta__: { merge:'MonChangedCondensed' },
		// target = the pokemon involved
		// level = the level grown to
		default: {
			single: [
				`<b>{{@target}} has grown to level {{@level}}!</b>`,
				`<b>{{@target}} is now level {{@level}}!</b>`,
				`<b>{{@target}} has leveled up to {{@level}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`leveled up to {{@level}}`,
				`grew to level {{@level}}`,
			],
		},
		multiple: {
			single: [
				`<b>{{@target}} has grown {{one noun|level|@deltaLevel}} to level {{@level}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`has grown {{one noun|level|@deltaLevel}} to level {{@level}}`,
			],
		},
		regress: {
			single: [
				`<b>{{@target}} has lost {{one noun|level|@deltaLost}}, and is now level {{@level}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`is now level {{@level}} (losing {{one noun|level|@deltaLost}})`,
			],
		},
		level100: {
			__meta__: { merge:'', }, //should override above and never be considered for MonChangedCondensed.
			single: [
				`<i><b>{{@target}} HAS {{rand|HIT|REACHED|GROWN TO}} LEVEL 100!!!</b></i> ヽ༼ຈل͜ຈ༽ﾉ LEVEL 100 RIOT ヽ༼ຈل͜ຈ༽ﾉ`,
			],
			item: [ //used for MonChangedCondensed, really shouldn't be used....
				`HAS {{rand|HIT|REACHED|GROWN TO}} LEVEL 100!!! (ヽ༼ຈل͜ຈ༽ﾉ LEVEL 100 RIOT ヽ༼ຈل͜ຈ༽ﾉ)`,
			],
		},
	},
	MonEvolved: {
		__meta__: { merge:'MonChangedCondensed' },
		// target = the pokemon involved
		// level = the level grown to
		default: {
			single: [
				`<b>{{@target.name}} ({{@prev}}) has evolved into a {{extended info|@target|{{@curr}}}}!</b>`,
				`<b>{{@target.name}} ({{@prev}}) evolves into a {{extended info|@target|{{@curr}}}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`evolved into {{extended info|@target|{{@curr}}}}`,
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
			`<b>{{@target}} has been infected with Pokerus!</b>`,
			`<b>{{@target}} has caught Pokerus!</b>`,
		],
	},
	MonPokerusCured: {
		default: [
			`<b>{{@target}} has been cured of Pokerus.</b>`,
		],
	},
	MonFainted: {
		default: {
			single: [
				`<b>{{@target}} {{rand|fainted|has fainted|faints|goes down|is down}}!</b>`,
			],
			multi: [
				`<b>{{a comma-separated list of|@target}} {{rand|have fainted|have all fainted|fainted}}!</b>`,
			],
		},
		poisonWalking: {
			single: [
				`<b>{{@target}} has fainted due to poison!</b>`,
				`<b>{{@target}} faints from the poison!</b>`,
			],
			multi: [
				`<b>{{a comma-separated list of|@target}} have all fainted from poison damage!</b>`,
			],
		},
		kapow: {
			single: [
				`<b>{{@target}} exploded!</b>`,
				`<b>{{@target}} has exploded!</b>`,
			],
			multi: [
				`<b>{{a comma-separated list of|@target}} have exploded!</b>`,
				`<b>{{a comma-separated list of|@target}} all exploded!</b>`,
				`<b>{{a comma-separated list of|@target}} exploded!</b>`,
			],
		},
	},
	MonRevived: {
		__meta__: { merge:'MonChangedCondensed' },
		default: {
			single: [
				`<b>{{@target}} has been revived!</b>`,
			],
			item: [
				`has been revived`,
			],
		},
	},
	MonHealedHP: null,
	MonHealedPP: null,
	MonLostHP: null,
	MonLostPP: null,
	MonPPUp: null,
	
	MonLearnedMove: {
		__meta__: { merge:'MonChangedCondensed' },
		//move = the learned move
		default: {
			single: [
				`<b>{{@target}} learned {{@move}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`learned {{@move}}`,
			],
		},
	},
	MonLearnedMoveOverOldMove: {
		__meta__: { merge:'MonChangedCondensed' },
		//move = the learned move
		//oldMove = the forgotton move
		default: {
			single: [
				`<b>{{@target}} learned {{@move}} over {{@oldMove}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`learned {{@move}} over {{@oldMove}}`,
			],
		},
	},
	MonForgotMove: {
		__meta__: { merge:'MonChangedCondensed' },
		//move = the forgotton move
		default: {
			single: [
				`<b>{{@target}} forgot {{@move}}!</b>`,
			],
			item: [ //used for MonChangedCondensed
				`forgot {{@move}}`,
			],
		},
	},
	
	MonGiveItem: {
		// target = the pokemon involved
		// item = the item in question
		default: [
			`We give {{@target}} {{an item|@item}} to hold.`,
		],
		pickupAbility: [
			`{{@target}} seems to have picked up a stray {{@item}}.`,
			`{{@target}} now seems to be holding {{an item|@item}}.`,
			`{{@target}} has found {{an item|@item}} lying around and is now holding it.`,
		],
	},
	MonTakeItem: {
		// target = the pokemon involved
		// item = the item in question
		default: [
			`We take {{@target}}'s {{@item}}.`,
			`We take {{@target}}'s {{@item}} and stow it in our bag.`,
		],
	},
	MonSwapItem: {
		// target = the pokemon involved
		// taken = the item taken from the target
		// given = the item given to the target
		default: [
			`We take {{$@target}}'s {{@taken}} and give {{him}} {{an item|@given}} to hold.`,
			`We take {{$@target}}'s {{@taken}} and give {{him}} {{an item|@given}} to hold instead.`,
			`We swap {{$@target}}'s {{@taken}} for {{an item|@given}}.`,
		],
	},
	Swap2MonItems: {
		// target1 = the first pokemon involved
		// target2 = the second pokemon involved
		// item1 = the item now held by target1
		// item2 = the item now held by target2
		default: [
			`We take {{@target1}}'s {{@item2}} and swap it with {{@target2}}'s {{@item1}}.`,
			`We look at {{@target1}}'s {{@item2}} and {{@target2}}'s {{@item1}} decide to swap the items.`,
			`After some shuffling, {{@target1}} now holds {{@item2}} and {{@target2}} {{@item1}}.`,
		],
		null1: [ // if target 1 is now holding nothing.
			`We take {{@target1}}'s {{@item2}} and give it to {{@target2}} instead.`,
			`We look at {{@target1}}'s {{@item2}} decide it looks better with {{@target2}}.`,
		],
		null2: [ // if target 2 is now holding nothing.
			`We take {{@target2}}'s {{@item1}} and give it to {{@target1}} instead.`,
			`We look at {{@target2}}'s {{@item1}} decide it looks better with {{@target1}}.`,
		],
	},
	
	MonStatusChanged: {
		default: null,
		poisonWalking: [
			`{{$@target}} has survived {{his}} poisoning!`,
			`{{$@target}} survives being poisoned with 1HP!`,
		],
	},
	MonShinyChanged: {
		default: null,
		became: [
			`{{@target}} has inexplicably become shiny...`,
		],
		nolonger: [
			`{{@target}} has inexplicably become no longer shiny...`,
		],
	},
	MonSparklyChanged: {
		default: null,
		became: [
			`{{@target}} has inexplicably become N's former pokemon...`,
		],
		nolonger: [
			`{{@target}} has inexplicably become no longer N's former pokemon...`,
		],
	},
	MonAbilityChanged: null,
	// MonAbilityChanged: {
	// 	default: null,
	// 	became: [
	// 		`{{@target}} has inexplicably become N's former pokemon...`,
	// 	],
	// 	nolonger: [
	// 		`{{@target}} has inexplicably become no longer N's former pokemon...`,
	// 	],
	// },
	
	MonNicknameChanged: {
		default: [
			`<b>We change the nickname of \`{{@prev}}\` ({{@mon.species}}) to \`{{@curr}}\`.</b>`,
		],
	}
};