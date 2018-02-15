// newspress/modules/Battle.js
// The Battle reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	ApiDisturbance, BadgeGet,
	BattleContext, BattleStarted, BattleEnded,
} = require('../ledger');

const LOGGER = getLogger('BattleModule');

const RULES = [];

/**   ** Battle Module **
 * Keeps track of battles. Keeps track of attepmt counts for important battles,
 * including gyms, team bosses, and legendaries. This also includes reporting
 * Badge changes.
 */
class BattleModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 1);
		this.memory.attempts = this.memory.attempts || {};
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		let pb = prev.battle;
		let cb = curr.battle;
		if (cb.in_battle) {
			ledger.addItem(new BattleContext(cb));
		}
		
		if (cb.in_battle && !pb.in_battle) {
			let attempt = 0;
			LOGGER.debug(`battle: [${cb.attemptId}] imp=${cb.isImportant} attempts=${this.memory.attempts[cb.attemptId]}`);
			
			if (cb.isImportant) {
				attempt = (this.memory.attempts[cb.attemptId] || 0);
				attempt++;
				this.memory.attempts[cb.attemptId] = attempt;
			}
			ledger.addItem(new BattleStarted(cb, attempt));
		}
		else if (!cb.in_battle && pb.in_battle) {
			ledger.addItem(new BattleEnded(pb, true));
			return;
		}
		
		if (cb.in_battle) {
			let healthy = cb.party.filter(p=>p.hp);
			LOGGER.debug(`party=`,cb.party,`healthy=`,healthy);
			if (healthy.length === 0) {
				ledger.addItem(new BattleEnded(pb, false));
			}
		}
		
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

RULES.push(new Rule(`Don't report battles end due to blackout`)
	.when(ledger=>ledger.has('BattleEnded').ofFlavor('ended').ofImportance())
	.when(ledger=>ledger.has('Blackout'))
	.then(ledger=>{
		ledger.demote(0, 2);
	})
);

module.exports = BattleModule;
