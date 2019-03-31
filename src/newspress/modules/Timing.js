// newspress/modules/Timing.js
// The Timing reporting module

const { ReportingModule, Rule } = require('./_base');
const { TimingBoostActive } = require('../ledger');

const RULE_ID = { name:"__TimingModule__" };
const RULES = [];

/**   ** Timing Module **
 * Keeps track of time between updates, and promotes the importance of an
 * otherwise unimportant update if too long has been spent without an update.
 */
class TimingModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		this.memory.ticksSinceLastUpdate = (this.memory.ticksSinceLastUpdate || 0);
		this.config.thresholdTicks = (this.config.thresholdTicks || Infinity);
		this.config.promoteSlope = (this.config.promoteSlope || 0);
		
		Bot.on('update', (text,ts,dest)=>{
			if (dest !== 'tagged') return; //ignore non-tagged updates
			this.memory.ticksSinceLastUpdate = 0;
		});
		Bot.on("cmd_resetTiming", ()=>{
			this.memory.ticksSinceLastUpdate = 0;
		});
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		this.memory.ticksSinceLastUpdate++;
		if (this.memory.ticksSinceLastUpdate < this.config.thresholdTicks) return;
		ledger.addItem(new TimingBoostActive());
	}
	
	secondPass(ledger) {
		// RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		if (this.memory.ticksSinceLastUpdate < this.config.thresholdTicks) return;
		let boost = (this.memory.ticksSinceLastUpdate - this.config.thresholdTicks) * this.config.promoteSlope;
		for (let item of ledger.list) {
			if (item.importance === 0) continue; //skip context-only items
			if (item.isMarked(RULE_ID)) continue; //skip already boosted items
			item.importance += boost;
			item.mark(RULE_ID);
		}
	}
}

module.exports = TimingModule;
