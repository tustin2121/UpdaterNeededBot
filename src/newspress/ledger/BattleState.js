// newspress/ledger/BattleState.js
// Various ledger items related to Battle Play-by-Plays

const LOGGER = getLogger('BattleLedgerItems');

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');

function determineDamageFlavor(curr, prev, out={}) {
	if (!curr || !prev) return null; //invalid state, do nothing
	if (curr._hp[1] !== prev._hp[1]) return null; //invalid state, do nothing
	if (curr._hp[0] === prev._hp[0]) return null; //nothing changed
	
	let [ currHP, maxHP ] = curr._hp;
	let [ prevHP, ] = prev._hp;
	let delta = currHP - prevHP;
	out.delta = delta;
	
	if (curr.hp === 0 && prev.hp > 0) { //The pokemon fainted from this damage
		if (curr.dexid === 292) 'shedinja';
		if (delta === -1) 'fatalTap';
		if (delta === -maxHP) 'fatalOHKO';
		return 'fatal';
	}
	if (delta === 0) return null; //nothing to report
	if (delta > 0) return null; //we don't report this
	if (delta === -1) return 'chipDmg';
	if (prev.hp > 90 && prevHP > 1 && currHP === 1) {
		//TODO Sturdy check
		return 'clutch';
	}
	if (prev.hp > 25 && curr.hp <= 25) {
		return 'intoRed';
	}
	if (prev.hp > 50 && curr.hp <= 50) {
		return 'intoYellow';
	}
	let pDelta = Math.abs(delta) / maxHP;
	if (pDelta < 0.25) {
		return 'lightDmg'; //TODO combine these damage amounts with "intoRed/Yellow/etc"
	} else if (pDelta < 0.51) {
		return 'halfDmg';
	} else if (pDelta < 0.49) {
		return 'medDmg';
	} else {
		return 'heavyDmg';
	}
}

/////////////////// Superclass ///////////////////

/** Common class for all ledger party-related ledger items. */
class BattleStateItem extends LedgerItem {
	constructor(battle, obj) {
		if (!(battle instanceof SortedBattle))
			throw new TypeError('Battle context must be a SortedBattle object!');
		
		super(battle.isImportant?1.1:0.5, obj);
		this.importance = 0.1; //HACK TODO REMOVE
		this.battle = battle;
	}
	get isSingleBattle() { return this.battle.trainer && this.battle.trainer.length === 1; }
	get isMultiBattle() { return this.battle.trainer && this.battle.trainer.length > 1; }
	get trainer(){
		if (!this.battle.trainer) return {
			className: 'trainer', name: 'The wild', gender: 'f',
		};
		try {
			if (this.battle.trainer.length == 2) {
				return { 
					className: 'pair of them',
					name: this.battle.displayName, 
					gender: 'p',
				};
			}
			if (this.battle.trainer.length == 3) {
				return { 
					className: 'three of them',
					name: this.battle.displayName, 
					gender: 'p',
				};
			}
			return this.battle.trainer[0];
		} catch (e) {
			LOGGER.error('Error getting trainer info:', e);
			return {
				className: 'trainer', name: '', gender: 'p',
			};
		}
	}
}

/////////////////// Basic Items ///////////////////

/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllyBecameActive extends BattleStateItem {
	constructor(battle, ally) {
		super(battle);
		this.ally = ally;
	}
	get mon() { return this.ally; }
}
/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllyBecameInactive extends BattleStateItem {
	constructor(battle, ally) {
		super(battle);
		this.ally = ally;
	}
	get mon() { return this.ally; }
}

/** Tells us when they swap pokemon in a battle. ("Trainer sends out Staravia!") */
class BattleState_EnemyBecameActive extends BattleStateItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
	get mon() { return this.enemy; }
}
/** Tells us when they swap pokemon in a battle. ("Trainer sends out Staravia!") */
class BattleState_EnemyBecameInative extends BattleStateItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
	get mon() { return this.enemy; }
}

/** Converts MonLostPP into a play-by-play message. ("Mon uses Quick Attack!") */
class BattleState_AllyUsedMove extends BattleStateItem {
	constructor(battle, ally, move) {
		super(battle);
		this.ally = ally;
		this.move = move;
	}
	get mon() { return this.ally; }
}

/** When we have move pp info for the enemy, we can play-by-play enemy moves too. ("Mon uses Quick Attack!") */
class BattleState_EnemyUsedMove extends BattleStateItem {
	constructor(battle, enemy, move) {
		super(battle);
		this.enemy = enemy;
		this.move = move;
	}
	get mon() { return this.enemy; }
}

/** When we heal during a battle. */
class BattleState_AllyHealed extends BattleStateItem {
	constructor(battle, ally, delta) {
		super(battle);
		this.ally = ally;
		this.delta = delta;
	}
	get mon() { return this.ally; }
}

/** Converts MonLostHP into a play-by-play message. ("Mon takes a sizable chunk of damage!") */
class BattleState_AllyDamaged extends BattleStateItem {
	constructor(battle, flavor, { ally, delta }) {
		super(battle, { flavor });
		this.ally = ally;
		this.delta = delta;
		this.causedBy = null;
	}
	get mon() { return this.ally; }
	
	/**
	 * Creates an item based on the current mon state and the previous mon state. Determines the flavor
	 * of the item from this information.
	 */
	static createItem(battle, currAlly, prevAlly) {
		let out = {};
		let flavor = determineDamageFlavor(currAlly, prevAlly, out);
		if (!flavor) return null;
		return new BattleState_AllyDamaged(battle, flavor, { ally:currAlly, delta:out.delta });
	}
}

/** When we heal during a battle. */
class BattleState_EnemyHealed extends BattleStateItem {
	constructor(battle, enemy, delta) {
		super(battle);
		this.enemy = enemy;
		this.delta = delta;
	}
	get mon() { return this.enemy; }
}

/** Tells us when an enemy mon has been damaged or fainted. */
class BattleState_EnemyDamaged extends BattleStateItem {
	constructor(battle, flavor, { enemy, delta }) {
		super(battle, { flavor });
		this.enemy = enemy;
		this.delta = delta;
		this.causedBy = null;
	}
	get mon() { return this.enemy; }
	
	/**
	 * Creates an item based on the current mon state and the previous mon state. Determines the flavor
	 * of the item from this information.
	 */
	static createItem(battle, currEnemy, prevEnemy) {
		let out = {};
		let flavor = determineDamageFlavor(currEnemy, prevEnemy, out);
		if (!flavor) return null;
		return new BattleState_EnemyDamaged(battle, flavor, { enemy:currEnemy, delta:out.delta });
	}
}

/////////////////// Advanced Items ///////////////////

/** Reports the initial match up of a battle. */
class BattleState_InitialActive extends BattleStateItem {
	constructor(battle, ally, enemy) {
		super(battle);
		this.ally = ally;
		this.enemy = enemy;
	}
	get mon() { return this.ally; }
}

/** Reports in a more concise way when we swap pokemon. */
class BattleState_AllySwappedActive extends BattleStateItem {
	constructor(battle, prev, curr) {
		super(battle);
		this.prev = prev;
		this.curr = curr;
	}
	get mon() { return this.curr; }
}

/** Reports in a more concise way when they swap pokemon. */
class BattleState_EnemySwappedActive extends BattleStateItem {
	constructor(battle, prev, curr) {
		super(battle);
		this.prev = prev;
		this.curr = curr;
	}
	get mon() { return this.curr; }
}

module.exports = {
	BattleStateItem,
	BattleState_InitialActive, 
	BattleState_AllyBecameActive, BattleState_AllyBecameInactive, BattleState_AllySwappedActive,
	BattleState_EnemyBecameActive, BattleState_EnemyBecameInative, BattleState_EnemySwappedActive,
	BattleState_AllyUsedMove, BattleState_EnemyUsedMove,
	BattleState_AllyDamaged, BattleState_AllyHealed, BattleState_EnemyDamaged, BattleState_EnemyHealed,
};