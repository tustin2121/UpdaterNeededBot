// newspress/modules/Gym.js
// The Gym reporting module

const { ReportingModule, Rule } = require('./_base');
const { ApiDisturbance, BadgeGet, } = require('../ledger');

const RULES = [];

/**   ** Gym Module **
 * Keeps track of important battles, including gyms, team bosses, and legendaries.
 * Other attempt counts are stored in this module's memory. This includes reporting
 * Badge changes.
 */
class GymModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		// Badges
		if (this.memory.badgeMax > curr.numBadges) {
			ledger.addItem(new ApiDisturbance('Number of badges has decreased!'));
		}
		if (curr.numBadges > prev.numBadges) {
			for (let badge in curr.badges) {
				if (!curr.badges[badge]) continue;
				if ( prev.badges[badge]) continue;
				ledger.addItem(new BadgeGet(badge));
			}
		}
		this.memory.badgeMax = Math.max(curr.numBadges, this.memory.badgeMax);
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

module.exports = GymModule;
