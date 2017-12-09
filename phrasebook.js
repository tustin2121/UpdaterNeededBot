// The Phrase Book used by the Typesetter to translate ledger items into English language

module.exports = {
	APIDestrubance: null,
	InDemoMode: {
		default: [ `[D]` ],
	},
	
	
	PokemonIsMissing: null,
	PokemonLost: {
		// mon = the missing pokemon
		default: null, //Do not report initially
		confirmed: [
			`<b>WE RELEASED {{mon}}!</b>`,
			`<b>{{mon}} HAS BEEN RELEASED! BYE {{mon}}!</b>`,
		],
		timeout: [
			`<b>We may have released {{mon}}!</b> (The API no longer reports them!)`,
		],
	},
	PokemonGained: {
		// mon = the missing pokemon
		default: (args)=>{
			let mon = args.mon;
			let a = `<b>Caught a <info>${mon.gender} Lv. ${mon.level} ${mon.species}</info>!</b> Nickname: \`${mon.name}\``;
			if (mon.box) a += ` (Sent to Box #${mon.box}.)`;
			return a;
		},
	},
	
	
	GainItem: {
		// item = the item in question
		default: [
			`<b>Acquired {{item|an}} {{item}}!</b>`,
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
	
	E4BeginRun: {
		// attempt = the e4 attempt number
		first: null, //The region should supply the first attempt's E4 announcement from the room announcement.
		default: [
			`<b>We're locked into the E4 for Attempt #{{attempt}}!</b>`,
			`<b>We're in for E4 Attempt #{{attempt}}!</b>`,
			`<b>Welcome back to the E4! Attempt #{{attempt}}!</b>`,
			`<b>The door slams shut behind us! E4 Attempt #{{attempt}}!</b>`,
			`<b>We stroll boldly into the E4 chambers and are locked inside! Attempt #{{attempt}}!</b>`,
		],
	},
	E4ReachChampion: {
		// attempt = the champion attempt number
		default: [
			`<b>WE'RE HEADING TO THE CHAMPION!!</b> Champion attempt #{{attempt}} incoming!!`,
		],
	},
	E4Blackout: {
		// attempt = the e4 attempt number
		default: [
			`rip E4 Attempt #{{attempt}}`,
		],
	},
	
};