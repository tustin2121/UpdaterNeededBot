// newspress/modules/Battle.js
// The Battle reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	ApiDisturbance, BadgeGet,
	BattleContext, BattleStarted, BattleEnded, 
	EnemyFainted, EnemySentOut,
	BlackoutContext,
	
	BattleState_InitialActive,
	BattleState_AllyBecameActive, BattleState_AllyBecameInactive, BattleState_AllySwappedActive,
	BattleState_EnemyBecameActive, BattleState_EnemyBecameInative, BattleState_EnemySwappedActive,
	BattleState_AllyUsedMove, BattleState_EnemyUsedMove,
	BattleState_AllyStageBoost, BattleState_AllyStageUnboost,
	BattleState_EnemyStageBoost, BattleState_EnemyStageUnboost,
	BattleState_AllyDamaged, BattleState_AllyHealed, BattleState_EnemyDamaged, BattleState_EnemyHealed,
} = require('../ledger');

const BATTLE_STATE_ITEMS = [
	BattleState_InitialActive,
	BattleState_AllyBecameActive, BattleState_AllyBecameInactive, BattleState_AllySwappedActive,
	BattleState_EnemyBecameActive, BattleState_EnemyBecameInative, BattleState_EnemySwappedActive,
	BattleState_AllyUsedMove, BattleState_EnemyUsedMove,
	BattleState_AllyStageBoost, BattleState_AllyStageUnboost,
	BattleState_EnemyStageBoost, BattleState_EnemyStageUnboost,
	BattleState_AllyDamaged, BattleState_AllyHealed, BattleState_EnemyDamaged, BattleState_EnemyHealed,
].map(x=>x.__itemName__);

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
		this.memory.lastBattleReported = this.memory.lastBattleReported || null;
		
		Bot.on('cmd_forceBadgesZero', ()=> this.memory.badgeMax = 0);
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		this.setDebug(LOGGER, ledger);
		
		let pb = prev.battle;
		let cb = curr.battle;
		if (cb.in_battle) {
			ledger.addItem(new BattleContext(cb));
		}
		
		this.debug(`pb[${!!pb.in_battle}][${!!pb.party}] | cb[${!!cb.in_battle}][${!!cb.party}]`);
		
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
			this.constructInitialPlay(ledger, prev, curr);
		}
		else if (!cb.in_battle && pb.in_battle) {
			ledger.addItem(new BattleEnded(pb, true));
			this.memory.lastBattleReported = null; //clear battle reporting
		}
		else if (cb.in_battle && cb.party) {
			let healthy = cb.party.filter(p=>p.hp || !p.species);
			this.debug(`displayName=`,cb.displayName,` isImportant=`,cb.isImportant);
			this.debug(`party=`,cb.party);
			LOGGER.debug(`moves=`, cb.party.map(x=>x.moveInfo));
			if (healthy.length === 0) {
				ledger.addItem(new BattleEnded(pb, false));
			}
			if (pb.in_battle && pb.party && pb.attemptId === cb.attemptId) {
				this.constructPlayByPlay(ledger, prev, curr)
			} else {
				this.constructInitialPlay(ledger, prev, curr);
			}
		}
		
		// Badges
		if (this.memory.badgeMax > curr.numBadges) {
			ledger.addItem(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: 'Number of badges has decreased!',
				score: 8,
			}));
		}
		if (curr.numBadges > prev.numBadges) {
			for (let badge in curr.badges) {
				if (!curr.badges[badge]) continue;
				if ( prev.badges[badge]) continue;
				ledger.addItem(new BadgeGet(badge));
			}
		}
		if (curr.numBadges - prev.numBadges > 1) {
			ledger.addItem(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: 'Number of badges has increased dramatically in one update cycle!',
				score: 8,
			}));
		} else {
			this.memory.badgeMax = Math.max(curr.numBadges, this.memory.badgeMax);
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		if (Bot.runFlag('alert_battles')) {
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
				Bot.alertUpdaters(txt, { ping:true });
			}
		}
		if (Bot.runFlag('alert_badges')) {
			let badgeItems = ledger.findAllItemsWithName('BadgeGet');
			if (badgeItems.length) {
				Bot.alertUpdaters(`We just got the ${badgeItems.map(x=>x.badge).join(', ')} badge! This is a reminder to ping StreamEvents about it.`, { bypassTagCheck:true });
			}
		}
	}
	
	constructInitialPlay(ledger, prev_api, curr_api) {
		if (!Bot.runFlag('play_by_play')) return;
		const { battle:cb } = curr_api;
		
		let battleState = {
			battle: cb,
			allies: curr_api.party.filter(x=>x.active),
			enemies: cb.active.slice(),
		};
		
		let allies = [];
		for (let p of prev_api.party) {
			for (let c of curr_api.party) {
				if (c.hash === p.hash) {
					allies.push({ prev:p, curr:c });
				}
			}
		}
		for (let { prev, curr } of allies) {
			if (curr.active) { //we can assume that this pokemon was not "active" before
				ledger.addItem(new BattleState_AllyBecameActive(battleState, curr));
			}
			if (curr._hp[0] > prev._hp[0]) {
				ledger.addItem(new BattleState_AllyHealed(battleState, curr, curr._hp[0] - prev._hp[0]));
			} else {
				let item = BattleState_AllyDamaged.createItem(battleState, curr, prev);
				if (item) ledger.addItem(item);
			}
			if (curr.battleBuffs && prev.battleBuffs) {
				for (let b in curr.battleBuffs) {
					if (!curr.battleBuffs[b] || !prev.battleBuffs[b]) continue; //avoid false reporting where possible
					let p = prev.battleBuffs[b] || 7;
					let c = curr.battleBuffs[b] || 7;
					if (p < c) {
						ledger.addItem(new BattleState_AllyStageBoost(battleState, curr, b, c - p));
					} else if (p > c) {
						ledger.addItem(new BattleState_AllyStageUnboost(battleState, curr, b, c - p));
					}
				}
			}
			// Move use is covered by Rules and MonLostPP
		}
		
		// Now we need to fill in assumed details for the enemy state
		for (let curr of cb.party) {
			if (curr.active) { //we can assume if an enemy is active now, they became active this update cycle
				ledger.addItem(new BattleState_EnemyBecameActive(battleState, curr));
			}
			if (curr._hp[0] < curr._hp[1]) { //we can assume all enemies start with max HP
				let item = BattleState_EnemyDamaged.createItem(battleState, curr, curr.cloneToAssumedPrev());
				if (item) ledger.addItem(item);
			}
			if (curr.battleBuffs) {
				for (let b in curr.battleBuffs) {
					let p = 7;
					let c = curr.battleBuffs[b] || 7;
					if (p < c) {
						ledger.addItem(new BattleState_EnemyStageBoost(battleState, curr, b, c - p));
					} else if (p > c) {
						ledger.addItem(new BattleState_EnemyStageUnboost(battleState, curr, b, c - p));
					}
				}
			}
			if (curr.moves) { //We have move info
				// Moves appear as they are first used, so any new ones at this stage have been used
				curr.moves.forEach(x=>{
					ledger.addItem(new BattleState_EnemyUsedMove(battleState, curr, x));
				});
			}
		}
	}
	
	constructPlayByPlay(ledger, prev_api, curr_api) {
		if (!Bot.runFlag('play_by_play')) return;
		const { battle:pb } = prev_api;
		const { battle:cb } = curr_api;
		
		let battleState = {
			battle: cb,
			allies: curr_api.party.filter(x=>x.active),
			enemies: cb.active.slice(),
		};
		
		let enemies = [];
		let allies = [];
		// Find mon pairs from previous party to next party.
		for (let p of pb.party) {
			for (let c of cb.party) {
				if (c.hash === p.hash) {
					enemies.push({ prev:p, curr:c });
				}
			}
		}
		for (let p of prev_api.party) {
			for (let c of curr_api.party) {
				if (c.hash === p.hash) {
					allies.push({ prev:p, curr:c });
				}
			}
		}
		
		for (let { prev, curr } of allies) {
			if (prev.active !== curr.active) {
				if (curr.active) {
					ledger.addItem(new BattleState_AllyBecameActive(battleState, curr));
				} else {
					ledger.addItem(new BattleState_AllyBecameInactive(battleState, curr));
				}
			}
			if (curr._hp[0] > prev._hp[0]) {
				ledger.addItem(new BattleState_AllyHealed(battleState, curr, curr._hp[0] - prev._hp[0]));
			} else {
				let item = BattleState_AllyDamaged.createItem(battleState, curr, prev);
				if (item) ledger.addItem(item);
			}
			if (curr.battleBuffs && prev.battleBuffs) {
				for (let b in curr.battleBuffs) {
					if (!curr.battleBuffs[b] || !prev.battleBuffs[b]) continue; //avoid false reporting where possible
					let p = prev.battleBuffs[b] || 7;
					let c = curr.battleBuffs[b] || 7;
					if (p < c) {
						ledger.addItem(new BattleState_AllyStageBoost(battleState, curr, b, c - p));
					} else if (p > c) {
						ledger.addItem(new BattleState_AllyStageUnboost(battleState, curr, b, c - p));
					}
				}
			}
			// Move use is covered by Rules and MonLostPP
		}
		for (let { prev, curr } of enemies) {
			if (prev.active !== curr.active) {
				LOGGER.warn('prev.active', prev.species, '!== curr.active =>', curr.species);
				if (curr.active) {
					ledger.addItem(new BattleState_EnemyBecameActive(battleState, curr));
				} else if (curr.hp > 0) {
					ledger.addItem(new BattleState_EnemyBecameInative(battleState, curr));
				}
			}
			if (curr._hp[0] > prev._hp[0]) {
				let flavor = (curr._hp[0] === curr._hp[1])? 'full':null;
				ledger.addItem(new BattleState_EnemyHealed(battleState, curr, curr._hp[0] - prev._hp[0], flavor));
			} else {
				let item = BattleState_EnemyDamaged.createItem(battleState, curr, prev);
				if (item) ledger.addItem(item);
			}
			if (curr.battleBuffs && prev.battleBuffs) {
				for (let b in curr.battleBuffs) {
					let p = prev.battleBuffs[b] || 7;
					let c = curr.battleBuffs[b] || 7;
					if (p < c) {
						ledger.addItem(new BattleState_EnemyStageBoost(battleState, curr, b, c - p));
					} else if (p > c) {
						ledger.addItem(new BattleState_EnemyStageUnboost(battleState, curr, b, c - p));
					}
				}
			}
			if (curr.moves && prev.moves) { //We have move info
				// Moves appear as they are first used
				let extm = curr.moves.filter(x=>prev.moves.some(y=>y.id === x.id));
				let newm = curr.moves.filter(x=>!prev.moves.some(y=>y.id === x.id));
				for (let c of extm) {
					let p = prev.moves.filter(x=>x.id === c.id)[0];
					if (p.pp > c.pp) {
						ledger.addItem(new BattleState_EnemyUsedMove(battleState, curr, c));
					}
				}
				newm.forEach(c=>{
					ledger.addItem(new BattleState_EnemyUsedMove(battleState, curr, c));
				});
			}
		}
		
		
		
		// We must assume that an enemy party never switches positions, because we have no way to match the pokemon otherwise
		for (let i = 0; i < cb.party; i++) {
			let penemy = pb.party[i];
			let cenemy = cb.party[i];
			
			// if (penemy.hp > 0 && cenemy.hp === 0) {
			// 	ledger.addItem(new EnemyFainted(cb, cenemy, prev.party[0]));
			// }
			// if (!penemy.active && cenemy.active) {
			// 	ledger.addItem(new EnemySentOut(cb, cenemy, curr.party[0]));
			// }
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
		.when(ledger=>ledger.has('BattleEnded').notOfFlavor('ending').unmarked())
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
	.when(ledger=>ledger.has('BattleEnded').notOfFlavor('ending').ofImportance())
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

// Exposing the BattleContext item

RULES.push(new Rule(`When something interesting happens in an unimportant battle, report the battle`)
	.when(ledger=>ledger.has('BattleContext').ofNoImportance())
	.when(ledger=>ledger.has('MonFainted', 'MonRevived', 'MonLeveledUp', 'MonPokerusInfected'))
	.when(ledger=>{//If we haven't reported this before
		try {
			let id = ledger.get(0)[0].battle.attemptId;
			return ledger.memory.lastBattleReported !== id;
		} catch (e) {
			LOGGER.error('Error getting the attempt ID!', e);
			return false;
		}
	})
	.then(ledger=>{
		ledger.promote(0);
		let id = ledger.get(0)[0].battle.attemptId;
		ledger.memory.lastBattleReported = id;
	})
);

RULES.push(new Rule(`If the battle is already being reported on by BattleStarted, don't double report it.`)
	.when(ledger=>ledger.has('BattleContext').ofImportance())
	.when(ledger=>ledger.has('BattleStarted').ofImportance())
	.then(ledger=>{
		ledger.demote(0);
	})
);

{
	RULES.push(new Rule(`Battle State: Convert MonLostPP to AllyUsedMove.`)
		.when(ledger=>Bot.runFlag('play_by_play'))
		.when(ledger=>ledger.has('BattleContext'))
		.when(ledger=>ledger.has('MonLostPP').unmarked())
		.then(ledger=>{
			let ctx = ledger.get(0)[0];
			ledger.mark(1).get(1).forEach(x=>{
				ledger.add(new BattleState_AllyUsedMove({ battle:ctx.battle }, x.mon, x.move));
			});
		})
	);
	RULES.push(new Rule(`Battle State: Fainting implies that we switched out, no need to be explicit.`)
		.when(ledger=>ledger.has('MonFainted'))
		.when(ledger=>ledger.has('BattleState_AllyBecameInactive').unmarked())//.ofImportance())
		.then(ledger=>{
			ledger.demote(1).mark(1);
		})
	);
	RULES.push(new Rule(`Battle State: Combine ally and enemy active.`)
		.when(ledger=>ledger.has('BattleStarted'))
		.when(ledger=>ledger.has('BattleState_AllyBecameActive'))
		.when(ledger=>ledger.has('BattleState_EnemyBecameActive'))
		.then(ledger=>{
			let a = ledger.remove(1).get(1)[0];
			let b = ledger.remove(2).get(2)[0];
			ledger.add(new BattleState_InitialActive(a, a.ally, b.enemy));
		})
	);
	RULES.push(new Rule(`Battle State: Combine inactive and active into swap (ally)`)
		.when(ledger=>ledger.has('BattleState_AllyBecameActive'))
		.when(ledger=>ledger.has('BattleState_AllyBecameInactive').ofImportance())
		.then(ledger=>{
			let a = ledger.remove(0).get(0)[0];
			let b = ledger.remove(1).get(1)[0];
			ledger.add(new BattleState_AllySwappedActive(a, b.ally, a.ally));
		})
	);
	RULES.push(new Rule(`Battle State: Combine inactive and active into swap (enemy)`)
		.when(ledger=>ledger.has('BattleState_EnemyBecameActive'))
		.when(ledger=>ledger.has('BattleState_EnemyBecameInactive').ofImportance())
		.then(ledger=>{
			let a = ledger.remove(0).get(0)[0];
			let b = ledger.remove(1).get(1)[0];
			ledger.add(new BattleState_EnemySwappedActive(a, b.enemy, a.enemy));
		})
	);
	RULES.push(new Rule(`Battle State: Enemy using a move and healing implies the move healed the mon, not the trainer.`)
		.when(ledger=>ledger.has('BattleState_EnemyUsedMove'))
		.when(ledger=>ledger.has('BattleState_EnemyHealed').unmarked())//.ofImportance())
		.then(ledger=>{
			ledger.mark(1).get(1).forEach(x=>{
				if (x.flavor === 'full') x.flavor = 'full_move';
				else if (!x.flavor) x.flavor = 'move';
			});
		})
	);
	RULES.push(new Rule(`Battle State: Ally expected to heal during level up.`)
		.when(ledger=>ledger.has('MonLeveledUp'))
		.when(ledger=>ledger.has('BattleState_AllyHealed').unmarked())//.ofImportance())
		.then(ledger=>{
			ledger.demote(1).mark(1);
		})
	);
	RULES.push(new Rule(`Battle State: Postpone switching out reporting, because it should have been merged with a switch in somewhere else.`)
		.when(ledger=>ledger.has('BattleState_AllyBecameInactive').ofImportance())
		.then(ledger=>{
			ledger.postpone(0);
		})
	);
}

module.exports = BattleModule;

//DEBUG
/*
Bot.on('bot-ready', ()=>{
	const { Ledger, BattleStateItem }  = require('../ledger');
	const { TypeSetter } = require('../typesetter');
	
	Bot.press.pool[0].on('run-complete', (u, l, data)=>{
		const TESTLOG = getLogger('BattleStateTest');
		
		if (!l || l.list.filter(x=>x instanceof BattleStateItem).length === 0) return; //do nothing
		
		let ledger = new Ledger(l);
		ledger.list.forEach(x=>{ 
			if (x instanceof BattleStateItem) x.importance += 1; 
			if (x instanceof BattleStarted) x.importance += 1; 
			if (x instanceof BattleEnded) x.importance += 1; 
		});
		let ts = new TypeSetter({ curr_api:data.curr_api, debugLog:ledger.log, press:this });
		let update = ts.typesetLedger(ledger);
		ledger.list.forEach(x=>{
			if (x instanceof BattleStateItem) x.importance -= 1; 
			if (x instanceof BattleStarted) x.importance -= 1; 
			if (x instanceof BattleEnded) x.importance -= 1; 
		});
		
		if (update && update.length)
			TESTLOG.info(`Battle State Test:\n${update}`);
	});
});
*/