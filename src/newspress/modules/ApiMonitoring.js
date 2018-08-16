// newspress/modules/ApiMonitoring.js
// The API Monitoring module

const { ReportingModule, Rule } = require('./_base');
const { ApiDisturbance, } = require('../ledger');

const LOGGER = getLogger('ApiDisturbance');

const RULES = [];

/**   ** Api Monitoring Module **
 * Monitors the API for certain descrepencies in reporting.
 */
class ApiMonitoringModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.lastApiThresholdBreach = (this.memory.lastApiThresholdBreach||0);
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		if (!this.checkHttpCode(curr)) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Unable to retrieve API update:'+curr.httpCode,
				code: ApiDisturbance.HTTP_ERROR,
				score: 0, //this alone should never trigger the "high number" alert, as it has its own alert
			}));
		}
		
		if (prev.trainerId[0] !== curr.trainerId[0] || prev.trainerId[1] !== curr.trainerId[1]) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Our trainer ID has changed between update cycles!',
				code: ApiDisturbance.LOGIC_ERROR,
				score: 6,
			}));
		}
		if (curr.trainerId[0] !== Bot.gameInfo(this.gameIndex).trainer.id 
			|| prev.trainerId[1] !== Bot.gameInfo(this.gameIndex).trainer.secret) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Our trainer ID does not match the expected trainer ID!',
				code: ApiDisturbance.INVALID_DATA,
			}));
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		let items = ledger.findAllItemsWithName('ApiDisturbance');
		if (items.length) {
			Bot.emit('api-disturbance', {
				timestamp: Date.now(),
				items: items.map(x=>x.toInfoString()),
			});
			LOGGER.debug(items);
			let score = items.reduce((a,x)=>a+x.score, 0);
			if (score >= 10) {
				if (this.memory.lastApiThresholdBreach > Date.now() + (1000*60*30)) {
					// Don't re-report within the last 30 minutes, or ongoing
					Bot.alertUpdaters(`Alert: High number of API disturbances detected. Something may be going wrong with the game or the overlay may have restarted.`);
				}
				this.memory.lastApiThresholdBreach = Date.now();
			}
			
			for (let item in items) {
				// let code = item.code || ApiDisturbance.UNSPECIFIED;
				// let fn = this[code];
				// if (fn) fn.call(this, item);
			}
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
				let ping = '';
				if (curr.httpCode === 418) ping = ` <@148100682535272448>`;
				Bot.alertUpdaters(`Alert: Unable to retrieve or parse API (Code: ${curr.httpCode}, Failed retrievals: ${fApi.attempts})${ping}\n\nI am unable to update until this is resolved. Someone else please keep an eye on the stream until then.`, {
					bypassTagCheck:true, 
					reuseId:fApi.msgId 
				}).then(msg=>{
					if (msg) fApi.msgId = msg.id;
				});
			}
			return false;
		} 
		else if (fApi) {
			this.memory.failedApi = null;
			if (fApi.msgId) {
				let ping = '';
				if (fApi.lastCode === 418) ping = ` <@148100682535272448>`;
				Bot.alertUpdaters(`~~Alert: Unable to retrieve or parse API (Code: ${fApi.lastCode}, Failed retrievals: ${fApi.attempts})${ping}~~\n\nError state has cleared. Resuming normal operation.`, {
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
