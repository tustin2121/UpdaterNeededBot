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
		
		this.assumeTrainerId = false;
		Bot.on('cmd_forceAssumeTrainerId', ()=> this.assumeTrainerId = true);
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		if (!this.checkHttpCode(curr)) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Unable to retrieve API update:'+curr.httpCode,
				code: ApiDisturbance.HTTP_ERROR,
				score: 0, //this alone should never trigger the "high number" alert, as it has its own alert
			}));
		}
		
		const USE_SECRET = Bot.runOpt('secretId', this.gameIndex);
		
		if (prev.trainerId[0] !== curr.trainerId[0] || (USE_SECRET && prev.trainerId[1] !== curr.trainerId[1])) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Our trainer ID has changed between update cycles!',
				code: ApiDisturbance.LOGIC_ERROR,
				score: 6,
			}));
		}
		if (curr.trainerId[0] !== Bot.gameInfo(this.gameIndex).trainer.id 
			|| (USE_SECRET && curr.trainerId[1] !== Bot.gameInfo(this.gameIndex).trainer.secret)) {
			ledger.addItem(new ApiDisturbance({ 
				reason: 'Our trainer ID does not match the expected trainer ID!',
				code: ApiDisturbance.INVALID_DATA,
			}));
		}
		
		if (this.assumeTrainerId) {
			const trainer = Bot.gameInfo(this.gameIndex).trainer;
			trainer.id = curr.trainerId[0];
			trainer.secret = curr.trainerId[1];
			Bot.alertUpdaters(`Trainer ID for game ${this.gameIndex} (${trainer.id} / ${trainer.secret}) assumed. Remember to update the run status, Tustin.`);
			this.assumeTrainerId = false;
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
				fApi = this.memory.failedApi = { attempts:0, msgId:null, lastCode:0, query:null };
			}
			Bot.emit('updateError', `Error ${curr.httpCode}`);
			fApi.attempts++;
			fApi.lastCode = curr.httpCode;
			if (fApi.attempts > 6) { //BURNING RED HACK
				let ping = '';
				if (curr.httpCode === 418) ping = ` <@148100682535272448>`;
				Bot.alertUpdaters(`Alert: Unable to retrieve or parse API (Code: ${curr.httpCode}, Failed retrievals: ${fApi.attempts})${ping}\n\nI am unable to update until this is resolved. Someone else please keep an eye on the stream until then.`, {
					bypassTagCheck:true, 
					reuseId:fApi.msgId 
				}).then(msg=>{
					if (msg) fApi.msgId = msg.id;
				});
			}
			// End of run check:
			if (!fApi.query) { //Make a query to check if I should end the run
				if (fApi.attempts > 80 && curr.httpCode !== 418) {
					fApi.query = Bot.queryUpdaters(
						`Query: I have been unable to connect to the Stream API for a while now. Is the run over now?\n`+
						`* {{confirm}} if the run is now over. I will stop attempting to update.\n*{{deny}} if I should keep waiting for the API to return new information.`,
						{ timeout:false, bypassTagCheck:true }
					);
				}
			} else if (fApi.query !== true) { //Check an existing query
				let res = Bot.checkQuery(fApi.query);
				if (res === true) { //confirmed, end run
					Bot.alertUpdaters(`I am now stopping my update checking. I'll just sit here and twiddle my thumbs waiting for Tustin now. <:SeemsGood:230354304337313793>`, { bypassTagCheck:true });
					Bot.stopUpdates();
				} else if (res === false || res === 'invalid' || res === null) { //wait for run to continue
					fApi.query = true;
				}
				//else waiting for query to resolve.
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
