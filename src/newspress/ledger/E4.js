// newspress/ledger/Battle.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');
const { MapNode } = require('../../mapinfo');

/////////////////// Basic Items ///////////////////

/**
 * A context item indicating that we're currently in an E4 run.
 */
class E4RunContext extends LedgerItem {
	constructor(attempt) {
		super(0);
		this.attempt = attempt;
	}
}

/**
 * An item indicating that we've begun a new E4 run.
 */
class E4BeginRun extends LedgerItem {
	constructor(attempt, flavor) {
		super(2, {flavor, sort:-10});
		this.attempt = attempt;
	}
}

/**
 * An item indicating that we've reached the champion.
 */
class E4ReachChampion extends LedgerItem {
	constructor(attempt) {
		super(2);
		this.attempt = attempt; //champion attempt
	}
}

/**
 * An item indicating that we've blacked out or otherwise have been removed from the
 */
class E4EndRun extends LedgerItem {
	constructor(attempt, champAttempt) {
		super(2, {sort:10});
		this.attempt = attempt;
		this.champAttempt = champAttempt;
	}
}

/**
 * An item indicating that we've entered the Hall of Fame.
 */
class E4HallOfFame extends LedgerItem {
	constructor(attempt) {
		super(2);
		this.attempt = attempt;
	}
}


/////////////////// Advanced Items ///////////////////


module.exports = {
	E4RunContext,
	E4BeginRun, E4ReachChampion, E4EndRun, E4HallOfFame,
};