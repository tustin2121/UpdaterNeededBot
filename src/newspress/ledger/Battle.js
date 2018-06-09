// newspress/ledger/Battle.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');

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
		this.flavor = battle.trainer? 'trainer':'wild';
	}
}

/**
 * An item indicating that a battle has started.
 */
class BattleStarted extends LedgerItem {
	constructor(battle, attempt=0) {
		super(battle.isImportant?2:0.9);
		this.battle = battle;
		this.attempt = attempt;
		this.report = null;
	}
}

/**
 * This item indicates that a battle is in its ending stages, and once more when
 * the battle officially ends (as the 'ended' flavor).
 */
class BattleEnded extends LedgerItem {
	constructor(battle, ended=false) {
		super(battle.isImportant?2:0.9, { flavor:(ended)?'ended':null });
		this.battle = battle;
		this.report = null;
	}
}

/**
 * Tells us when an enemy has fainted
 */
class EnemyFainted extends LedgerItem {
	constructor(battle, enemy) {
		super(battle.isImportant?2:0.9);
		this.battle = battle;
		this.enemy = enemy;
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
	}
	canPostpone() {
		if (this.ttl === 0) return false; //don't postpone
		if (!this._next) {
			this._next = new BlackoutContext();
			this._next.ttl = this.ttl - 1;
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
	}
	static loadFromMemory(m) {
		let i = new BlackoutContext();
		i.ttl = m.ttl;
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


/////////////////// Advanced Items ///////////////////


module.exports = {
	BattleContext, BattleStarted, BattleEnded, EnemyFainted,
	Blackout, BlackoutContext, FullHealed,
	BadgeGet,
};