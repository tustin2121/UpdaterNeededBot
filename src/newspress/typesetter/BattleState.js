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
	BattleState_AllyBecameInactive: null,
	/*{
		__meta__: { sort: 190 },
		default: 'We swap out {{@curr}}.',
	},*/ 
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
			`{{$@trainer}} send{{*s}} {{rand|in|out}} {{@mon}}.`,
			`{{$@trainer}} send{{*s}} {{rand|in|out}} {{their}} {{@mon}}{{rand| next|}}.`,
			`{{They|$@trainer}} send{{*s}} {{rand|in|out}} {{@mon}}.`,
			`{{They|$@trainer}} send{{*s}} {{rand|in|out}} {{their}} {{@mon}}{{rand| next|}}.`,
		],
	}, 
	BattleState_EnemyBecameInative: {
		__meta__: { sort: 184 },
		default: [
			`{{$@trainer}} send{{*s}} {{#@mon}} back to {{their|#}} ball.`,
			`{{$@trainer}} swap{{*s}} out {{their}} {{@mon}}.`,
		],
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
		default: 'The opposing {{@mon}} uses {{@move}}!',
	}, 
	
	BattleState_AllyStageBoost: {
		__meta__: { sort: 160 },
		default: [
			`Our {{@statText}} rises!`,
			`{{Mon|@mon}}'s {{@statText}} goes up!`,
		],
	},
	BattleState_AllyStageUnboost: {
		__meta__: { sort: 130 },
		default: [
			`The enemy {{@mon}} knocks down our {{@statText}}!`,
			`The enemy {{@mon}} lowers our {{@statText}}!`,
			`{{@mon}} lowers our {{@statText}}!`,
		],
	},
	
	BattleState_EnemyStageBoost: {
		__meta__: { sort: 130 },
		default: [
			`The enemy {{@mon}} buffs up their {{@statText}}!`,
			`The enemy {{@mon}} raises their {{@statText}}!`,
			`The enemy {{@mon}} buffs up their {{@statText}}!`,
		],
	},
	BattleState_EnemyStageUnboost: {
		__meta__: { sort: 160 },
		default: [
			`The enemy's {{@statText}} falls!`,
			`The oponent {{@mon}}'s {{@statText}} drops!`,
			`That drops the enemy {{@mon}}'s {{@statText}}!`,
		],
	},
	
	BattleState_AllyDamaged: {
		__meta__: { sort: 130 },
		default: 'That hurt!',
		shedinja: [
			`That breaks through Wonder Guard!`,
		],
		fatalTap: [
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} simply taps us...`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} gives us a tap...`,
		],
		fatalOHKO: [
			`With one hit, {{@activeEnemy}} takes {{mon|@mon}} out!`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} takes one swipe at us!`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} makes one attack!`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} uses just one move, and it's too much for {{Mon|@mon}}!`,
		],
		fatal: [
			`And {{@activeEnemy}} takes one more swipe at us and down we go...`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} launches one more attack...`,
			`They take one more swipe at us and down we go...`,
			`And there goes the rest of our health...`,
		],
		chipDmg: [
			`The enemy barely scratches {{mon|@mon}}.`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} barely scratches {{mon|@mon}}.`,
			`The foe barely scratches {{mon|@mon}}.`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} does chip damage to us.`,
		],
		intoYellow: [
			`The enemy {{@activeEnemy}}'s attack sends us into the yellow!`,
			`{{@activeEnemy}}'s attack drops {{mon|@mon}}'s hp into the yellow!`,
		],
		intoRed: [
			`But their attack sends us into the red!`,
			`But the enemy {{@activeEnemy}}'s attack sends us into the red!`,
		],
		clutch: [
			`Their attack does massive damage to us, but we clutch at 1HP!`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} does massive damage to us, but we clutch at 1HP!`,
		],
		lightDmg: [
			`Their attack does light damage to us.`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} attack does light damage to us.`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} lightly hits us.`,
		],
		halfDmg: [
			`Their attack {{rand|robs us of|takes out}} half our health!`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}}'s attack {{rand|robs us of|takes out}} half our health!`,
		],
		medDmg: [
			`The opponent smacks us hard!`,
			`The opponent hits us hard with their attck!`,
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} hits us hard with their attck!`,
		],
		heavyDmg: [
			`The {{rand|enemy|opposing|}} {{@activeEnemy}} hits us with a devistating hit!`,
			`The opponent hits us with a devistating hit!`,
			`Their attack hits us for <em>massive</em> damage!`,
			`Their {{@activeEnemy}} hits us for <em>massive</em> damage!`,
		],
	}, 
	BattleState_AllyHealed: {
		__meta__: { sort: 165 },
		default: [
			`We heal some HP!`,
		],
	}, 
	BattleState_EnemyDamaged: {
		__meta__: { sort: 160 },
		default: 'That must have hurt!',
		shedinja: [
			`That breaks through Wonder Guard! The enemy {{@mon}} goes down!`,
			`That breaks through Wonder Guard and down the ghost shell goes!`,
		],
		fatalTap: [
			`We could have poked it and it would have fainted. Down it goes!`,
			`We poke the enemy {{@mon}}. Down it goes!`,
		],
		fatalOHKO: [
			`That takes 'em out in one.`,
			`It's a one-hit KO!`,
		],
		fatal: [
			`The enemy {{mon|$@mon}} goes down!`,
			`That takes out {{their|@trainer}} {{mon|$@mon}}!`,
		],
		chipDmg: [
			`That does only chip damage.`,
		],
		intoYellow: [
			`That sends the enemy into the yellow!`,
		],
		intoRed: [
			`The enemy {{@mon}} is in the red!`,
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
			`That does good damage to the enemy {{mon|@mon}}!`,
		],
		heavyDmg: [
			`Crushing blow! It takes out most of their remaining health!`,
		],
	}, 
	BattleState_EnemyHealed: {
		__meta__: { sort: 181 },
		default: [
			`{{$@trainer}} heals {{their}} {{@mon}}.`,
		],
		full: [
			`{{$@trainer}} heals {{their}} {{@mon}} to full health.`,
		],
		move: [
			`That heals the enemy {{@mon}} some.`,
		],
		full_move: [
			`That heals the enemy {{@mon}} to full health.`,
		],
		minor: {
			__meta__: { sort: 120 },
			single: [
				`{{@mon}} heals a bit.`
			],
		}
	}, 
	
};


////////////////////////////////////////////////////////////////////////////////////////////////////

MoveDescriptions['default'] = [
	`{{@mon}} uses {{@move}}!`,
];
