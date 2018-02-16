// newspress/modules/Battle.js
// The Battle reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	ApiDisturbance, BadgeGet, 
	BattleContext, BattleStarted, BattleEnded,
	BlackoutContext,
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
			} else {
				
				
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

RULES.push(new Rule(`Don't report a full heal after a blackout`)
	.when(ledger=>ledger.has('BlackoutContext'))
	.when(ledger=>ledger.has('FullHealed').ofImportance())
	.then(ledger=>{
		ledger.demote(1, 2);
	})
);

RULES.push(new Rule(`Don't report a won battle after a blackout`)
	.when(ledger=>ledger.has('BlackoutContext'))
	.when(ledger=>ledger.has('BattleEnded').ofImportance())
	.then(ledger=>{
		ledger.demote(1, 2);
	})
);

RULES.push(new Rule(`Don't report battles ending due to blackout`)
	.when(ledger=>ledger.has('BattleEnded').ofFlavor('ended').ofImportance())
	.when(ledger=>ledger.has('Blackout'))
	.then(ledger=>{
		ledger.demote(0, 2);
	})
);

RULES.push(new Rule(`Don't double report a blackout`)
	.when(ledger=>ledger.has('BlackoutContext').which(x=>x.ttl < BlackoutContext.STARTING_TTL))
	.when(ledger=>ledger.has('Blackout').ofImportance())
	.then(ledger=>{
		ledger.demote(1, 2);
	})
);

RULES.push(new Rule(`Blackouts spawn a BlackoutContext`)
	.when(ledger=>ledger.has('Blackout'))
	.when(ledger=>ledger.hasnt('BlackoutContext'))
	.then(ledger=>{
		ledger.add(new BlackoutContext());
	})
);

RULES.push(new Rule(`Echo BlackoutContext into the next ledger`)
	.when(ledger=>ledger.has('BlackoutContext').which(x=>x.ttl > 0).ofNoFlavor())
	.then(ledger=>{
		let b = ledger.get(0);
		b.forEach(x=>x.flavor = 'processed');
		let ctx = new BlackoutContext(ledger.get(0)[0]);
		if (ctx.ttl !== BlackoutContext.STARTING_TTL && ledger.ledger.findAllItemsWithName('BattleContext').length) {
			// Don't decrement if we've got a Battle Context still
			ctx.ttl++;
		}
		ledger.ledger.postponeItem(ctx);
	})
);

module.exports = BattleModule;
