// newspress/ledger/Others.js
// Various ledger items that don't number enough to have their own file

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

///////////////////
// Options

/** Indicates that options in the game have changed */
class OptionsChanged extends LedgerItem {
	constructor(changes) {
		super(0.8);
		this.changes = changes;
	}
}

///////////////////
// Real Time

/** Indicates that the time of day in the game has changed. */
class TimeChanged extends LedgerItem {
	constructor(changes) {
		super(0.8);
		this.changes = changes;
	}
}


/////////////////// Advanced Items ///////////////////


module.exports = {
	OptionsChanged,
	TimeChanged,
};