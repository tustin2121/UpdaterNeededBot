// newspress/ledger/Battle.js
// Various ledger items related to pokemon themselves

const LOGGER = getLogger('BattleLedgerItems');

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');

/////////////////// Superclass ///////////////////

/** Common class for all ledger party-related ledger items. */
class BattleItem extends LedgerItem {
	constructor(battle, obj) {
		if (!(battle instanceof SortedBattle))
			throw new TypeError('Battle context must be a SortedBattle object!');
		
		let flavor = null;
		if (!battle.isImportant) flavor = 'unimportant';
		flavor = battle.checkSpecialTrainers() || flavor;
		
		super(battle.isImportant?2:0.9, Object.assign({ flavor }, obj));
		this.battle = battle;
		this.enemy = this.battle.active && this.battle.active[0];
	}
	get isSingleBattle() { return this.battle.trainer && this.battle.trainer.length === 1; }
	get isMultiBattle() { return this.battle.trainer && this.battle.trainer.length > 1; }
	get lastPokemon(){ return this.battle.party[this.battle.party.length-1]; }
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

/**
 * A context item which tells other modules that a battle is currenlty
 * in progess.
 */
class BattleContext extends LedgerItem {
	constructor(battle) {
		if (!(battle instanceof SortedBattle))
			throw new TypeError('Battle context must be a SortedBattle object!');
		
		super(0);
		this.battle = battle;
		if (battle.trainer) {
			this.flavor = (battle.isImportant)?'important':'trainer';
		} else {
			this.flavor = (battle.party && battle.party.length > 1)?'horde':'wild';
		}
	}
	get isSingleBattle() { return this.battle.trainer && this.battle.trainer.length === 1; }
	get isMultiBattle() { return this.battle.trainer && this.battle.trainer.length > 1; }
	get lastPokemon() { return this.battle.party[this.battle.party.length-1]; }
	get enemy() {
		return this.battle.active && this.battle.active[0];
	}
	get enemyMonList() {
		if (!this.battle.active) {
			LOGGER.error(`this.battle.active == false!`);
			LOGGER.error(this.battle.active);
			return false;
		}
		let active = this.battle.active.map(x=>x.species);
		if (active.length > 1) {
			active[active.length-1] = 'and ' + active[active.length-1];
		}
		if (active.length === 2) return active.join(' ');
		return active.join(', ');
	}
	get trainer(){
		try {
			if (this.battle.trainer.length == 2) {
				return { 
					className: 'pair of trainers',
					name: this.battle.displayName, 
					gender: 'p',
				};
			}
			if (this.battle.trainer.length == 3) {
				return { 
					className: 'trio of trainers',
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

/**
 * An item indicating that a battle has started.
 */
class BattleStarted extends BattleItem {
	constructor(battle, attempt=0) {
		super(battle);
		this.attempt = attempt;
		this.report = null;
	}
}

/**
 * This item indicates that a battle is in its ending stages (as the 'ending'), 
 * and once more when the battle officially ends.
 */
class BattleEnded extends BattleItem {
	constructor(battle, ended=false) {
		super(battle, { flavor:(!ended)?'ending':null });
		this.report = null;
	}
}

/** Indicates we blacked out. */
class Blackout extends LedgerItem {
	constructor(type) {
		super(2, {flavor:type});
	}
}

/** Indicates we blacked out in the previous . */
class BlackoutContext extends LedgerItem {
	constructor() {
		super(0);
		this.ttl = BlackoutContext.STARTING_TTL; //TimeToLive = postpone for x update cycles after
		this.revived = false;
	}
	canPostpone() {
		if (this.ttl === 0) return false; //don't postpone
		if (!this._next) {
			this._next = new BlackoutContext();
			this._next.ttl = this.ttl - 1;
			this._next.revived = this.revived;
		}
		return this._next; //postpone this item instead
	}
	/** Tells this item to keep itself alive another round. */
	keepAlive() {
		if (this._next) this._next.ttl = Math.min(this._next.ttl+1, BlackoutContext.STARTING_TTL-1);
		this.ttl = Math.max(this.ttl, 2);
	}
	saveToMemory(m) {
		m.ttl = this.ttl;
		m.revived = this.revived;
	}
	static loadFromMemory(m) {
		let i = new BlackoutContext();
		i.ttl = m.ttl;
		i.revived = m.revived;
		return i;
	}
}
BlackoutContext.STARTING_TTL = 4;

/** Indicates we have been fully healed. */
class FullHealed extends LedgerItem {
	constructor(type) {
		super(2, {flavor:type});
	}
}

/**
 */
class BadgeGet extends LedgerItem {
	constructor(badgeName) {
		super(2);
		this.badge = badgeName;
	}
}

/////////////////// Play-by-Play Items ///////////////////

/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllyBecameActive extends BattleItem {
	constructor(battle, ally) {
		super(battle);
		this.ally = ally;
	}
}
/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllyBecameInactive extends BattleItem {
	constructor(battle, ally) {
		super(battle);
		this.ally = ally;
	}
}

/** Tells us when they swap pokemon in a battle. ("Trainer sends out Staravia!") */
class BattleState_EnemyBecameActive extends BattleItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
}
/** Tells us when they swap pokemon in a battle. ("Trainer sends out Staravia!") */
class BattleState_EnemyBecameInative extends BattleItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
}

/** Converts MonLostPP into a play-by-play message. ("Mon uses Quick Attack!") */
class BattleState_AllyUsedMove extends BattleItem {
	constructor(battle, ally, move) {
		super(battle);
		this.ally = ally;
		this.move = move;
	}
}

/** When we have move pp info for the enemy, we can play-by-play enemy moves too. ("Mon uses Quick Attack!") */
class BattleState_EnemyUsedMove extends BattleItem {
	constructor(battle, ally, move) {
		super(battle);
		this.ally = ally;
		this.move = move;
	}
}

/** When we heal during a battle. */
class BattleState_AllyHealed extends BattleItem {
	constructor(battle, ally, delta) {
		super(battle);
		this.ally = ally;
		this.delta = delta;
	}
}

/** Converts MonLostHP into a play-by-play message. ("Mon takes a sizable chunk of damage!") */
class BattleState_AllyDamaged extends BattleItem {
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
class BattleState_EnemyHealed extends BattleItem {
	constructor(battle, enemy, delta) {
		super(battle);
		this.enemy = enemy;
		this.delta = delta;
	}
}

/** Converts MonLostHP into a play-by-play message. ("Mon takes a sizable chunk of damage!") */
class BattleState_EnemyDamaged extends BattleItem {
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

/** Tells us when an enemy has fainted */
class BattleState_EnemyFainted extends BattleItem {
	constructor(battle, enemy) {
		super(battle);
		this.enemy = enemy;
	}
}


/////////////////// Advanced Items ///////////////////

/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_AllySwappedActive extends BattleItem {
	constructor(battle, prev, curr) {
		super(battle);
		this.prev = prev;
		this.curr = curr;
	}
}
/** Tells us when we swap pokemon in a battle. ("We send out Staravia!") */
class BattleState_EnemySwappedActive extends BattleItem {
	constructor(battle, prev, curr) {
		super(battle);
		this.prev = prev;
		this.curr = curr;
	}
}


module.exports = {
	BattleContext, BattleStarted, BattleEnded, 
	Blackout, BlackoutContext, FullHealed,
	BadgeGet,
	
	BattleState_AllyBecameActive, BattleState_AllyBecameInactive, BattleState_AllySwappedActive,
	BattleState_EnemyBecameActive, BattleState_EnemyBecameInative, BattleState_EnemySwappedActive,
	BattleState_AllyUsedMove, BattleState_EnemyUsedMove,
	BattleState_AllyDamaged, BattleState_AllyHealed, BattleState_EnemyDamaged, BattleState_EnemyHealed,
	BattleState_EnemyFainted,
	
};