// newspress/typesetter/BattleState.js
// The phrasebook for Play-By-Play-related LedgerItems

// Sorting: 200-block is reserved for BattleState
//		190-180 is reserved for before-turn
//		180-150 is reserved for "our turn" in battle
//		150-110 is reserved for "their turn" in battle

const MoveDescriptions = {};

module.exports = {
	BattleState_InitialActive: {
		__meta__: { sort: 195 },
		default: [
			`{{@ally}} vs {{@enemy}}.`,
			`We send in {{@ally}} to face {{their|@trainer}} {{@enemy}}.`,
		],
	},
	
	BattleState_AllyBecameActive: {
		__meta__: { sort: 185 },
		default: [
			`We send in {{@ally}}.`,
			`We send in {{@ally}} next.`,
			`We send {{@ally}} into the fray.`,
		],
	}, 
	BattleState_AllyBecameInactive: {
		__meta__: { sort: 190 },
		default: 'AllyBecameInactive',
	}, 
	BattleState_AllySwappedActive: {
		__meta__: { sort: 185 },
		default: [
			`We {{rand|swap|switch}} to {{@curr}}.`,
			`We {{rand|swap|switch}} {{mon|@prev}} out for {{@curr}}.`,
		],
	}, 
	
	BattleState_EnemyBecameActive: {
		__meta__: { sort: 180 },
		default: [
			`{{$@trainer}} send{{*s}} {{rand|in|out}} {{@enemy}}.`,
			`{{$@trainer}} send{{*s}} {{rand|in|out}} {{their}} {{@enemy}}{{rand| next|}}.`,
			`{{They|$@trainer}} send{{*s}} {{rand|in|out}} {{@enemy}}.`,
			`{{They|$@trainer}} send{{*s}} {{rand|in|out}} {{their}} {{@enemy}}{{rand| next|}}.`,
		],
	}, 
	BattleState_EnemyBecameInative: {
		__meta__: { sort: 184 },
		default: 'EnemyBecameInative',
	}, 
	BattleState_EnemySwappedActive: {
		__meta__: { sort: 180 },
		default: [
			`{{$@trainer}} swap{{*s}} to {{@curr}}.`,
			`{{$@trainer}} swap{{*s}} {{@prev}} out for {{their}} {{@curr}}.`,
			`{{$@trainer}} swap{{*s}} to {{their}} {{@curr}} next.`,
		],
	}, 
	
	BattleState_AllyUsedMove: {
		__meta__: { sort: 170 },
		default: function({ move }){
			let desc = MoveDescriptions[`move${move.id}`];
			if (!desc) desc = MoveDescriptions[`type_${move.type.toLowerCase()}`];
			if (!desc) desc = MoveDescriptions[`default`];
			return desc;
		},
	}, 
	BattleState_EnemyUsedMove: {
		__meta__: { sort: 140 },
		default: 'EnemyUsedMove',
	}, 
	
	BattleState_AllyDamaged: {
		__meta__: { sort: 130 },
		default: 'That hurt!',
		shedinja: [
			`That breaks through Wonder Guard!`,
		],
		fatalTap: 'AllyDamaged|fatalTap',
		fatalOHKO: 'AllyDamaged|fatalOHKO',
		fatal: [
			`And there goes the rest of our health...`,
		],
		chipDmg: [
			`Meanwhile, the enemy barely scratches {{mon|@mon}}.`,
		],
		intoYellow: [
			`The enemy's attack sends us into the yellow!`,
		],
		intoRed: [
			`But their attack sends us into the red!`,
		],
		clutch: [
			`Their attack does massive damage to us, but we clutch at 1HP!`,
		],
		lightDmg: [
			`Their attack does light damage to us.`,
		],
		halfDmg: [
			`Their attack robs us of half our health!`,
		],
		medDmg: [
			`Their attack really smarts!`,
		],
		heavyDmg: [
			`Their attack hits us for <em>massive</em> damage!`,
		],
	}, 
	BattleState_AllyHealed: {
		__meta__: { sort: 165 },
		default: 'AllyHealed',
	}, 
	BattleState_EnemyDamaged: {
		__meta__: { sort: 160 },
		default: 'That must have hurt!',
		shedinja: [
			`That breaks through Wonder Guard and down the ghost shell goes!`,
		],
		fatalTap: [
			`We could have poked it and it would have fainted. Down it goes!`,
		],
		fatalOHKO: [
			`That takes 'em out in one.`,
		],
		fatal: [
			`The enemy {{mon|$@enemy}} goes down!`,
			`That takes out {{their|@trainer}} {{mon|$@enemy}}!`,
		],
		chipDmg: [
			`That does only chip damage.`,
		],
		intoYellow: [
			`That sends the enemy into the yellow!`,
		],
		intoRed: [
			`{{@enemy}} is in the red!`,
		],
		clutch: [
			`That does major damage, but they clutch at 1HP!`,
		],
		lightDmg: [
			`A light {{rand|knock|hit}}.`,
			`That didn't do too much.`,
		],
		halfDmg: [
			`That takes out half their HP!`,
		],
		medDmg: [
			`That does good damage to the enemy {{mon|@enemy}}!`,
		],
		heavyDmg: [
			`Crushing blow! It takes out most of their remaining health!`,
		],
	}, 
	BattleState_EnemyHealed: {
		__meta__: { sort: 181 },
		default: 'EnemyHealed',
		minor: {
			__meta__: { sort: 120 },
			single: 'EnemyHealed|minor',
		}
	}, 
	
};


////////////////////////////////////////////////////////////////////////////////////////////////////

MoveDescriptions['default'] = [
	`{{@mon}} uses {{@move}}!`,
];

