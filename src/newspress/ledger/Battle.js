// newspress/ledger/Battle.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');
const { MapNode } = require('../../mapinfo');

/////////////////// Basic Items ///////////////////

/**
 * A context item which tells other modules the current basic location info.
 * This item stores SortedLocation objects, when MapNodes are not available.
 */
class BattleContext extends LedgerItem {
	constructor(battle) {
		if (!(battle instanceof SortedBattle))
			throw new TypeError('Battle context must be a SortedBattle object!');
		
		super(0);
		this.battle = battle;
	}
}

class BattleStarted extends LedgerItem {
	constructor(battle) {
		super(battle.isImportant?2:0.9);
		this.battle = battle;
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
	}
}

class EnemyFainted extends LedgerItem {
	constructor(battle, enemy) {
		super(battle.isImportant?2:0.9);
		this.battle = battle;
		this.enemy = enemy;
	}
}




/////////////////// Advanced Items ///////////////////


module.exports = {
	BattleContext,
	BattleStarted, BattleEnded,
};