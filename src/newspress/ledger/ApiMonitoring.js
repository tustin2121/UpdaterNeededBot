// newspress/ledger/Battle.js
// Various ledger items related to pokemon themselves

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/**
 * A context item which marks if an API Disturbance was detected during this
 * update cycle.
 */
class ApiDisturbance extends LedgerItem {
	constructor(reason) {
		super(0);
		this.reason = reason;
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	ApiDisturbance,
};
