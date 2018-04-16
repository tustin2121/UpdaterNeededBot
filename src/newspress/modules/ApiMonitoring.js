// newspress/modules/ApiMonitoring.js
// The API Monitoring module

const { ReportingModule, Rule } = require('./_base');
const { ApiDisturbance, } = require('../ledger');

const RULES = [];

/**   ** Api Monitoring Module **
 * Monitors the API for certain descrepencies in reporting.
 */
class ApiMonitoringModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		if (!this.checkHttpCode(curr)) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Unable to retrieve API update:'+curr.httpCode,
				code: ApiDisturbance.HTTP_ERROR,
			}));
		}
		
		
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
	
	finalPass(ledger) {
		let items = ledger.findAllItemsWithName('ApiDisturbance');
		for (let item in items) {
			let code = item.code || ApiDisturbance.UNSPECIFIED;
			let fn = this[code];
			if (fn) fn.call(this, item);
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	checkHttpCode(curr) {
		let fApi = this.memory.failedApi;
		if (curr.httpCode !== 200) {
			if (!fApi) {
				fApi = this.memory.failedApi = { attempts:0, msgId:null, lastCode:0 };
			}
			fApi.attempts++;
			fApi.lastCode = curr.httpCode;
			if (fApi.attempts > 3) {
				Bot.alertUpdaters(`Alert: Unable to retrieve API update: ${curr.httpCode} (Failed retrievals: ${fApi.attempts})`, {
					bypassTagCheck:true, 
					reuseId:fApi.msgId 
				}).then(msg=>{
					fApi.msgId = msg.id;
				});
			}
			return false;
		} 
		else if (fApi) {
			this.memory.failedApi = null;
			if (fApi.msgId) {
				Bot.alertUpdaters(`Alert: ~~Unable to retrieve API update: ${fApi.lastCode}~~ API has returned after ${fApi.attempts} failed retrievals. Resuming normal operation.`, {
					bypassTagCheck:true, 
					reuseId:fApi.msgId 
				});
			}
		}
		return true;
	}
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	[ApiDisturbance.UNSPECIFIED](item) {
		
	}
}

module.exports = ApiMonitoringModule;
