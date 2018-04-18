// newspress/ledger/ApiMonitoring.js
// Various ledger items related to monitoring the API and modifying the functions of modules

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/**
 * A context item which marks if an API Disturbance was detected during this
 * update cycle.
 */
class ApiDisturbance extends LedgerItem {
	constructor({ reason, code, data }={}) {
		super(0);
		this.reason = reason;
		this.code = code || ApiDisturbance.UNSPECIFIED;
		this.data = data;
	}
}
// These values corresponde to functions in the ApiMonitoringModule
Object.defineProperties(ApiDisturbance, {
	/** Generic or unspecified type of disturbance. */
	UNSPECIFIED: { value:Symbol() },
	/** There is a problem with the current party's consistency. */
	PARTY_FAULT: { value:Symbol() },
	/** The API is logically inconsistent from the previous API. */
	LOGIC_ERROR: { value:Symbol() },
	/** The data in the API is invalid. */
	INVALID_DATA: { value:Symbol() },
	/** The API could not be retrieved or parsed this update cycle. */
	HTTP_ERROR: { value:Symbol() },
});


/**
 * A context item which marks that the party is currently under lockdown (no updates
 * about it should be sent), due to being in an inconsistent or temporary state.
 */
class PartyLockdownContext extends LedgerItem {
	constructor(type) {
		super(0, { flavor:type });
		// types include: 'temp'=temporary party, 'loc'=location demands lockdown
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	ApiDisturbance,
	PartyLockdownContext,
};
