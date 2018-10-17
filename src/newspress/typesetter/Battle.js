// newspress/typesetter/Battle.js
// The phrasebook for Battle-related LedgerItems

module.exports = {
	BattleContext: {
		__meta__: { sort:100 }, //Before any fainting or level ups
		default: null,
		important: null,
		trainer: [
			`We {{rand|fight|battle|face off against}} a {{rand|cheeky|rogue|roving|wandering}} {{trainer class|$@trainer}}, named {{$}}{{if|@enemyMonList|, and {{their}} {{@enemyMonList}}}}.`,
			`We get spotted by a{{rand| wandering|n eager}} {{trainer class|$@trainer}} named {{$}}, and begin a battle{{if|@enemyMonList| against {{their}} {{@enemyMonList}}}}.`,
			`{{if|@isSingleBattle}}While {{rand|fighting|facing off against|battling}} one {{trainer class|$@trainer}} {{$}}, and {{their}} {{mon|@enemy}},`,
			`{{trainer class|$@trainer}} {{$}} picks a fight with us{{if|@enemyMonList|, using {{their}} {{@enemyMonList}}}}.`,
		],
		wild: [
			`We {{rand|come across|run into|step on|stumble upon|encounter|bump into|run across}} a wild {{mon|@enemy}}.`,
			`{{rand|Facing off against|Battling|Grappling|Affronted by|Wrestling}} a wild {{mon|@enemy}}.`,
			`A wild {{mon|@enemy}} {{rand|picks a fight with|engages|thinks it can take|crashes into|smacks into|collides with|jumps|ambushes|attacks|assults}} us.`,
		],
		horde: [
			`A horde of Pokémon {{rand|attacks|jumps|assails|assults|ambushes|surrounds}} us!`,
			`We get {{rand|stopped|ambushed|attacked|jumped|assailed|assulted|besieged|surrounded}} by a large group of Pokémon!`,
			`{{rand|Facing off against|Dealing with|Fending off|Battling|Deflecting the attacks of}} a horde of Pokémon!`,
		],
	},
	
	BattleStarted: {
		__meta__: { sort:60 }, //Before EnemySentOut
		default: (item)=>{
			let m = `<b>Vs ${item.battle.displayName}!</b>`;
			if (item.attempt > 1) m += ` Attempt #${item.attempt}!`;
			return m;
		},
		report: `{{@report.text}}`,
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
		joey: [
			`We battle a passionate youngster named Joey!`,
		],
		unimportant: [
			`We {{rand|fight|battle|face off against}} a {{rand|cheeky|rogue|roving|wandering}} {{trainer class|$@trainer}} named {{$}}. {{They}} throw{{*s}} out his {{mon|@enemy}} to face us.`,
			`We get spotted by a{{rand| wandering|n eager}} {{trainer class|$@trainer}} named {{$}}, and begin a battle against {{their}} {{mon|@enemy}}.`,
		],
	},
	
	BattleEnded: {
		__meta__: { sort:0 }, //After EnemyFainted
		ending: null,
		default: [
			`<b>We defeat {{@battle.displayName}}!</b>`,
			`<b>Defeated {{@battle.displayName}}!</b>`,
		],
		report: `{{@report.wintext}}`,
		joey: [
			`We defeat Youngster Joey! I'm sure if we could register your phone number, young man, we would.`,
		],
		unimportant: [
			`We {{rand|easily|soundly|roundly}} defeat {{@battle.displayName}} and {{their|@trainer}} {{mon|@lastPokemon}}.`,
			`{{@battle.displayName}} {{rand|pouts|sighs|huffs irritably}} as we take out {{their|@trainer}} {{mon|@lastPokemon}} and win the battle.`,
		],
	},
	EnemyFainted: {
		__meta__: { sort:50 }, //Before EnemySentOut
		default: [
			`{{if|$@myactive|$|We}} {{rand|pummel{{*s}}|knock{{*s}} out|smack{{*s}} down|faint{{*s}}|beat{{*s}} down}} the enemy {{mon|@enemy}}!`,
			`The enemy {{mon|@enemy}} {{rand|goes down|faints|goes down for the count|falls down}}!`,
		],
		unimportant: null, //don't report this for unimportant battles
	},
	EnemySentOut: {
		__meta__: { sort:20 }, //After EnemyFainted
		default: [
			`{{Mon|@enemy}} {{rand|appears|appears on the field|enters the fray|is sent out}}!`,
			`{{if|@isSingleBattle}}{{They|$@trainer}} send{{*s}} out {{mon|@enemy}}!`,
			`{{if|@isSingleBattle}}{{$@trainer}} {{rand|send{{*s}} out|throws{{*s}} forth|call{{*s}} on}} {{their}} {{mon|@enemy}}{{rand| against us| to face us|}}!`,
			`{{if|@isSingleBattle}}{{$@trainer}} send{{*s}} {{rand|{{their}}|a}} {{mon|@enemy}} into battle{{rand| against us| to face us|}}!`,
			`{{if|@isSingleBattle}}{{@myactive}} vs {{mon|@enemy}}!`,
		],
		unimportant: null, //don't report this for unimportant battles
	},
	
	Blackout: {
		__meta__: { sort:-100 }, //After other updates on a battle
		default: [
			`<b>BLACKED OUT!</b>`,
			`<b>We BLACK OUT!</b>`,
			`<b>BLACK OUT...</b>`,
		],
	},
	BlackoutContext: null,
	FullHealed: {
		default: [
			`<b>We heal!</b>`,
		],
		blackout: null, //should be covered by Blackout above
		partner: [
			`<b>We're healed</b> by our partner!`,
			`Our partner <b>heals our party!</b>!`,
		],
		pokecenter: [
			`<b>We heal</b> at the Poké Center!`,
		],
		house: [ // Override with location announcement?
			`<b>We heal</b> at a heal house!`,
			`We sleep on a random person's floor! <b>Healed!</b>`,
		],
		doctor: [
			`A {{rand|nice|kind|helpful|}} doctor <b>heals our team!</b> {{rand|Thanks, doc!|}}`,
		],
		nurse: [
			`A {{rand|nice|kind|helpful|}} nurse <b>heals our {{rand|team|party}}!</b> {{rand|Thanks!|}}`,
			`A {{rand|sweet|helpful}} nurse <b>heals our {{rand|team|party}}!</b> Ta, love!`,
		],
		scientist: [
			`A {{rand|nice|kind|helpful|random|}} scientist <b>heals our {{rand|team|party}}!</b> {{rand|Thanks, doc!|Thanks, prof!|}}`,
		],
	},
	
	BadgeGet: {
		default: [
			`<b>Received the {{@badge}} Badge!</b>`,
			`<b>Got the {{@badge}} Badge!</b>`,
		],
	},
};