// newspress/ledger/Options.js
// Various ledger items related to options

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/** Indicates that options in the game have changed */
class OptionsChanged extends LedgerItem {
	constructor(changes) {
		super(0.8);
		this.changes = changes;
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	OptionsChanged
};