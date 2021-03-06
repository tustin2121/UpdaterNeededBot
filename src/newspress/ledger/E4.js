// newspress/ledger/Battle.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');
const { SortedBattle } = require('../../api/pokedata');

/////////////////// Basic Items ///////////////////

/**
 * A context item indicating that we're currently in an E4 run.
 */
class E4RunContext extends LedgerItem {
	constructor({ e4Attempts=0, champAttempts=0, rematchCount=0, isRematchLevels=false }, loc) {
		super(0);
		this.attempt = e4Attempts;
		this.champ = champAttempts;
		this.rematchCount = rematchCount;
		this.isRematchLevels = isRematchLevels;
		this.locType = loc;
	}
	get champAttempt(){ return this.champ; }
}

/**
 * An item indicating that we've begun a new E4 run.
 */
class E4BeginRun extends LedgerItem {
	constructor({ e4Attempts=0, champAttempts=0, rematchCount=0, isRematchLevels=false }, flavor) {
		super(2, {flavor});
		this.attempt = e4Attempts;
		this.champ = champAttempts;
		this.rematchCount = rematchCount;
		this.isRematchLevels = isRematchLevels;
	}
}

/**
 * An item indicating that we've reached the champion.
 */
class E4ReachChampion extends LedgerItem {
	constructor({ e4Attempts=0, champAttempts=0, rematchCount=0, isRematchLevels=false }) {
		super(2);
		this.attempt = e4Attempts;
		this.champ = champAttempts; //champ attempt
		this.rematchCount = rematchCount;
		this.isRematchLevels = isRematchLevels;
	}
	get champAttempt(){ return this.champ; }
}

/**
 * An item indicating that we've blacked out or otherwise have been removed from the
 */
class E4EndRun extends LedgerItem {
	constructor({ e4Attempts=0, champAttempts=0, rematchCount=0, isRematchLevels=false }) {
		super(2);
		this.attempt = e4Attempts;
		this.champ = champAttempts;
		this.rematchCount = rematchCount;
		this.isRematchLevels = isRematchLevels;
	}
}

/**
 * An item indicating that we've entered the Hall of Fame.
 */
class E4HallOfFame extends LedgerItem {
	constructor({ e4Attempts=0, champAttempts=0, rematchCount=0, isRematchLevels=false }) {
		super(2);
		this.attempt = e4Attempts;
		this.champ = champAttempts;
		this.rematchCount = rematchCount;
		this.isRematchLevels = isRematchLevels;
	}
}


/////////////////// Advanced Items ///////////////////


module.exports = {
	E4RunContext,
	E4BeginRun, E4ReachChampion, E4EndRun, E4HallOfFame,
};