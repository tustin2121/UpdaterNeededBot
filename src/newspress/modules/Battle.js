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
		super(config, memory, 2);
		this.memory.attempts = this.memory.attempts || {};
		this.memory.badgeMax = this.memory.badgeMax || 0;
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		this.setDebug(LOGGER, ledger);
		
		let pb = prev.battle;
		let cb = curr.battle;
		if (cb.in_battle) {
			ledger.addItem(new BattleContext(cb));
		}
		
		// Battle handling
		if (cb.in_battle && !pb.in_battle) {
			let attempt = 0;
			this.debug(`battle: [${cb.attemptId}] imp=${cb.isImportant} attempts=${this.memory.attempts[cb.attemptId]}`);
			
			if (cb.isImportant) {
				attempt = (this.memory.attempts[cb.attemptId] || 0);
				attempt++;
				this.memory.attempts[cb.attemptId] = attempt;
			}
			ledger.addItem(new BattleStarted(cb, attempt));
		}
		else if (!cb.in_battle && pb.in_battle) {
			ledger.addItem(new BattleEnded(pb, true));
		}
		else if (cb.in_battle && cb.party) {
			let healthy = cb.party.filter(p=>p.hp);
			this.debug(`displayName=`,cb.displayName,` isImportant=`,cb.isImportant);
			this.debug(`party=`,cb.party);
			LOGGER.debug(`moves=`, cb.party.map(x=>x.moveInfo));
			if (healthy.length === 0) {
				ledger.addItem(new BattleEnded(pb, false));
			}
		}
		
		// Badges
		if (this.memory.badgeMax > curr.numBadges) {
			ledger.addItem(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: 'Number of badges has decreased!'
			}));
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
		RULES.forEach(rule=> rule.apply(ledger, this.memory) );
	}
	
	finalPass(ledger) {
		if (Bot.runFlag('alert_battles', true)) {
			let battleItems = ledger.findAllItemsWithName('BattleStarted').filter(x=>x.battle.isImportant && !x.battle.isE4);
			if (battleItems.length) {
				let game = ' on stream';
				if (Bot.runConfig.numGames > 1) {
					game = Bot.gameInfo(this.gameIndex).name;
					game = ` in ${game}`;
				}
				let txt = battleItems.map(x=>{
					if (x.isLegendary) {
						return `We've encounter legendary pokemon ${x.battle.displayName}${game}!`;
					}
					else if (x.isRival) {
						return `We're battle our rival ${x.battle.displayName}${game} right now! This is attempt #${x.attempt}`;
					}
					else {
						return `We're facing off against ${x.battle.displayName}${game} right now! This is attempt #${x.attempt}`;
					}
				}).join('\n');
				Bot.alertUpdaters(txt, true);
			}
		}
		if (Bot.runFlag('alert_badges', true)) {
			let badgeItems = ledger.findAllItemsWithName('BadgeGet');
			if (badgeItems.length) {
				Bot.alertUpdaters(`We just got the ${badgeItems.map(x=>x.badge).join(', ')} badge! This is a reminder to ping StreamEvents about it.`, false);
			}
		}
	}
}

if (!!Bot.gameInfo().regionMap) {
	RULES.push(new Rule(`Check for reports for battle starting.`)
		.when(ledger=>ledger.has('BattleStarted').unmarked())
		.when(ledger=>{
			const region = Bot.gameInfo().regionMap;
			const currTime = Date.now();
			let map = ledger.ledger.findAllItemsWithName('MapContext')[0];
			if (map && map.area) map = map.area;
			else if (map && map.loc) map = map.loc;
			if (!map || !map.is) return false;
			
			let ret = false;
			for (let x of ledger.get(0)) {
				let report = region.findBattleReport(map, x.battle);
				if (report) {
					ledger.memory.currBattleReport = report.id;
					x.report = report;
					if (typeof report.text === 'string') {
						x.flavor = 'report';
						x.importance++;
					}
					ret = true;
				}
			}
			return ret;
		})
		.then(ledger=>ledger.mark(0))
	);
	RULES.push(new Rule(`Check for reports for battle ending.`)
		.when(ledger=>ledger.has('BattleEnded').ofFlavor('ended').unmarked())
		.when(ledger=>{
			const region = Bot.gameInfo().regionMap;
			const currTime = Date.now();
			let map = ledger.ledger.findAllItemsWithName('MapContext')[0];
			if (map && map.area) map = map.area;
			else if (map && map.loc) map = map.loc;
			if (!map || !map.is) return false;
			
			let ret = false;
			for (let x of ledger.get(0)) {
				let report = region.findReportById(ledger.memory.currBattleReport);
				if (!report) report = region.findBattleReport(map, x.battle);
				if (report) {
					x.report = report;
					if (typeof report.wintext === 'string') {
						x.flavor = 'report';
						x.importance++;
					}
					ret = true;
					ledger.memory.currBattleReport = null;
				}
			}
			return ret;
		})
		.then(ledger=>ledger.mark(0))
	);
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
	.when(ledger=>ledger.has('BlackoutContext').unmarked())
	.then(ledger=>{
		if (ledger.ledger.findAllItemsWithName('BattleContext').length) {
			ledger.get(0).forEach(x=>x.keepAlive());
		}
		ledger.mark(0).postpone(0); //see the BlackoutContext item about the special postponing it does
	})
);

module.exports = BattleModule;
