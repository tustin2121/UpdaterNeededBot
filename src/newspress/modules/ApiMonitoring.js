// newspress/modules/ApiMonitoring.js
// The API Monitoring module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** Api Monitoring Module **
 * Monitors the API for certain descrepencies in reporting.
 */
class ApiMonitoringModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = ApiMonitoringModule;
