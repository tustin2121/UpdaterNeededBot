// newspress/modules/RealTime.js
// The RealTime reporting module

const { ReportingModule, Rule } = require('./_base');
const { TimeChanged } = require('../ledger');

const RULES = [];

/**   ** RealTime Module **
 * Responsible for reporting changes to the time.
 */
class RealTimeModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
		if (!Bot.runOpts('rtc')) throw new Error('Run does not support Real Time!');
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		if (curr.timeOfDay !== prev.timeOfDay) {
			let flavor;
			// Normal time of day directions
			if (prev.timeOfDay === 'night' && curr.timeOfDay === 'morning') {
				flavor = 'dawn';
			}
			else if (prev.timeOfDay === 'morning' && curr.timeOfDay === 'day') {
				flavor = 'noon';
			}
			else if (prev.timeOfDay === 'day' && curr.timeOfDay === 'night') {
				flavor = 'dusk';
			}
			// Reverse time to day directions...
			if (prev.timeOfDay === 'night' && curr.timeOfDay === 'day') {
				flavor = 'rday';
			}
			else if (prev.timeOfDay === 'day' && curr.timeOfDay === 'morning') {
				flavor = 'rmorning';
			}
			else if (prev.timeOfDay === 'morning' && curr.timeOfDay === 'night') {
				flavor = 'rnight';
			}
			ledger.addItem(new TimeChanged(flavor));
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

RULES.push(new Rule('Postpone time change messages when indoors.')
	.when(ledger=>ledger.has('TimeChanged').unmarked())
	.when(ledger=>ledger.hasMap(map=>map.is('indoors')))
	.then(ledger=>{
		ledger.postpone(0);
	})
);

module.exports = RealTimeModule;
