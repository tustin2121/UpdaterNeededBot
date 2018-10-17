// newspress/ledger/Battle.js
// Various ledger items related to pokemon battles

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

/////////////////// Advanced Items ///////////////////


module.exports = {
	BattleContext, BattleStarted, BattleEnded, 
	Blackout, BlackoutContext, FullHealed,
	BadgeGet,
};