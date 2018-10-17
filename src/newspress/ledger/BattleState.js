// newspress/ledger/BattleState.js
// Various ledger items related to Battle Play-by-Plays

const LOGGER = getLogger('BattleLedgerItems');

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');

/////////////////// Superclass ///////////////////

/** Common class for all ledger party-related ledger items. */
class BattleStateItem extends LedgerItem {
	constructor(battle, obj) {
		if (!(battle instanceof SortedBattle))
			throw new TypeError('Battle context must be a SortedBattle object!');
		
		super(battle.isImportant?2:0.9, obj);
		this.battle = battle;
	}
	get isSingleBattle() { return this.battle.trainer && this.battle.trainer.length === 1; }
	get isMultiBattle() { return this.battle.trainer && this.battle.trainer.length > 1; }
	get trainer(){
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
}
/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllyBecameInactive extends BattleStateItem {
	constructor(battle, ally) {
		super(battle);
		this.ally = ally;
	}
}

/** Tells us when they swap pokemon in a battle. ("Trainer sends out Staravia!") */
class BattleState_EnemyBecameActive extends BattleStateItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
}
/** Tells us when they swap pokemon in a battle. ("Trainer sends out Staravia!") */
class BattleState_EnemyBecameInative extends BattleStateItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
}

/** Converts MonLostPP into a play-by-play message. ("Mon uses Quick Attack!") */
class BattleState_AllyUsedMove extends BattleStateItem {
	constructor(battle, ally, move) {
		super(battle);
		this.ally = ally;
		this.move = move;
	}
}

/** When we have move pp info for the enemy, we can play-by-play enemy moves too. ("Mon uses Quick Attack!") */
class BattleState_EnemyUsedMove extends BattleStateItem {
	constructor(battle, ally, move) {
		super(battle);
		this.ally = ally;
		this.move = move;
	}
}

/** When we heal during a battle. */
class BattleState_AllyHealed extends BattleStateItem {
	constructor(battle, ally, delta) {
		super(battle);
		this.ally = ally;
		this.delta = delta;
	}
}

/** Converts MonLostHP into a play-by-play message. ("Mon takes a sizable chunk of damage!") */
class BattleState_AllyDamaged extends BattleStateItem {
	constructor(battle, flavor, { ally, delta }) {
		super(battle, { flavor });
		this.ally = ally;
		this.delta = delta;
	}
	
	/**
	 * Creates an item based on the current mon state and the previous mon state. Determines the flavor
	 * of the item from this information.
	 */
	static createItem(battle, currAlly, prevAlly) {
		if (!currAlly || !prevAlly) return null; //invalid state, do nothing
		if (currAlly._hp[1] !== prevAlly._hp[1]) return null; //invalid state, do nothing
		if (currAlly._hp[0] === prevAlly._hp[0]) return null; //nothing changed
		
		let [ currHP, maxHP ] = currAlly._hp;
		let [ prevHP, ] = prevAlly._hp;
		let delta = currHP - prevHP;
		if (currAlly.hp === 0 && prevAlly.hp > 0) { //The pokemon fainted from this damage
			if (currAlly.dexid === 292) new BattleState_AllyDamaged(battle, 'shedinja', { ally:currAlly, delta });
			if (delta === -1) new BattleState_AllyDamaged(battle, 'fatalTap', { ally:currAlly, delta });
			if (delta === maxHP) new BattleState_AllyDamaged(battle, 'fatalOHKO', { ally:currAlly, delta });
			return new BattleState_AllyDamaged(battle, 'fatal', { ally:currAlly, delta });
		}
		if (delta === 0) return null; //nothing to report
		if (delta > 0) return null; //we don't report this
		if (delta === -1) return new BattleState_AllyDamaged(battle, 'chipDmg', { ally:currAlly, delta });
		if (prevAlly.hp > 50 && currAlly.hp <= 50) {
			return new BattleState_AllyDamaged(battle, 'intoYellow', { ally:currAlly, delta });
		}
		if (prevAlly.hp > 25 && currAlly.hp <= 25) {
			return new BattleState_AllyDamaged(battle, 'intoRed', { ally:currAlly, delta });
		}
		let pDelta = Math.abs(delta) / maxHP;
		if (pDelta < 0.25) {
			return new BattleState_AllyDamaged(battle, 'lightDmg', { ally:currAlly, delta });
		} else if (pDelta < 0.50) {
			return new BattleState_AllyDamaged(battle, 'medDmg', { ally:currAlly, delta });
		} else {
			return new BattleState_AllyDamaged(battle, 'heavyDmg', { ally:currAlly, delta });
		}
	}
}

/** When we heal during a battle. */
class BattleState_EnemyHealed extends BattleStateItem {
	constructor(battle, enemy, delta) {
		super(battle);
		this.enemy = enemy;
		this.delta = delta;
	}
}

/** Tells us when an enemy mon has been damaged or fainted. */
class BattleState_EnemyDamaged extends BattleStateItem {
	constructor(battle, flavor, { enemy, delta }) {
		super(battle, { flavor });
		this.enemy = enemy;
		this.delta = delta;
	}
	
	/**
	 * Creates an item based on the current mon state and the previous mon state. Determines the flavor
	 * of the item from this information.
	 */
	static createItem(battle, currEnemy, prevEnemy) {
		if (!currEnemy || !prevEnemy) return null; //invalid state, do nothing
		if (currEnemy._hp[1] !== prevEnemy._hp[1]) return null; //invalid state, do nothing
		if (currEnemy._hp[0] === prevEnemy._hp[0]) return null; //nothing changed
		
		let [ currHP, maxHP ] = currEnemy._hp;
		let [ prevHP, ] = prevEnemy._hp;
		let delta = currHP - prevHP;
		if (currEnemy.hp === 0 && prevEnemy.hp > 0) { //The pokemon fainted from this damage
			if (currEnemy.dexid === 292) new BattleState_EnemyDamaged(battle, 'shedinja', { enemy:currEnemy, delta });
			if (delta === -1) new BattleState_EnemyDamaged(battle, 'fatalTap', { enemy:currEnemy, delta });
			if (delta === maxHP) new BattleState_EnemyDamaged(battle, 'fatalOHKO', { enemy:currEnemy, delta });
			return new BattleState_EnemyDamaged(battle, 'fatal', { enemy:currEnemy, delta });
		}
		if (delta === 0) return null; //nothing to report
		if (delta > 0) return null; //we don't report this
		if (delta === -1) return new BattleState_EnemyDamaged(battle, 'chipDmg', { enemy:currEnemy, delta });
		if (prevEnemy.hp > 50 && currEnemy.hp <= 50) {
			return new BattleState_EnemyDamaged(battle, 'intoYellow', { enemy:currEnemy, delta });
		}
		if (prevEnemy.hp > 25 && currEnemy.hp <= 25) {
			return new BattleState_EnemyDamaged(battle, 'intoRed', { enemy:currEnemy, delta });
		}
		let pDelta = Math.abs(delta) / maxHP;
		if (pDelta < 0.25) {
			return new BattleState_EnemyDamaged(battle, 'lightDmg', { enemy:currEnemy, delta });
		} else if (pDelta < 0.50) {
			return new BattleState_EnemyDamaged(battle, 'medDmg', { enemy:currEnemy, delta });
		} else {
			return new BattleState_EnemyDamaged(battle, 'heavyDmg', { enemy:currEnemy, delta });
		}
	}
}

/////////////////// Advanced Items ///////////////////

/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllySwappedActive extends BattleStateItem {
	constructor(battle, prev, curr) {
		super(battle);
		this.prev = prev;
		this.curr = curr;
	}
}
/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_EnemySwappedActive extends BattleStateItem {
	constructor(battle, prev, curr) {
		super(battle);
		this.prev = prev;
		this.curr = curr;
	}
}

module.exports = {
	BattleState_AllyBecameActive, BattleState_AllyBecameInactive, BattleState_AllySwappedActive,
	BattleState_EnemyBecameActive, BattleState_EnemyBecameInative, BattleState_EnemySwappedActive,
	BattleState_AllyUsedMove, BattleState_EnemyUsedMove,
	BattleState_AllyDamaged, BattleState_AllyHealed, BattleState_EnemyDamaged, BattleState_EnemyHealed,
};