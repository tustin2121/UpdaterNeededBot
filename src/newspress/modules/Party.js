// newspress/modules/Party.js
// The Party reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	TemporaryPartyContext, EvolutionContext,
	MonLeveledUp, MonEvolved, MonHatched, MonPokerusInfected, MonPokerusCured,
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP,
	MonLearnedMove, MonLearnedMoveOverOldMove, MonForgotMove, MonPPUp,
	MonGiveItem, MonTakeItem, MonSwapItem,
	MonShinyChanged, MonSparklyChanged, MonAbilityChanged, MonNicknameChanged, MonStatusChanged,
	Blackout, FullHealed,
	ApiDisturbance,
} = require('../ledger');

const LOGGER = getLogger('PartyModule');

const RULES = [];

/**   ** Party Module **
 * Responsible for discovering differences in the party, including level changes,
 * move learns, name changes, hatches, evolutions, etc.
 * Also Responsible for tracking when blackouts occur, as well as when a pokemon
 * faints or is healed.
 */
class PartyModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 2);
		this.memory.tempPartyBefore = (this.memory.tempPartyBefore||null);
		this.memory.tempPartyMeta = (this.memory.tempPartyMeta||null);
		
		/** If this is set to true, the next update cycle will report all pending party changes. */
		this.forceTempPartyOff = false;
		Bot.on('cmd_forceTempPartyOff', ()=> this.forceTempPartyOff = true);
	}
	
	//TODO: Test this module against a Battle Tent or Battle Frontier tent
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
		let sameMons = [];
		// Find our mon pairs from previous party to next party.
		for (let p of prev_api.party) {
			for (let c of curr_api.party) {
				if (c.hash === p.hash) {
					sameMons.push({ prev:p, curr:c });
				}
			}
		}
		// LOGGER.trace(`sameMons = ${sameMons.length}`);
		// TODO Party makeup ApiDisturbance
		if (this.memory.tempPartyBefore) {
			let matchedMons = [];
			for (let p of this.memory.tempPartyBefore) {
				for (let c of curr_api.party) {
					if (c.hash !== p.hash) continue;
					if (c.level !== p.level) continue;
					if (c.item.id !== p.item.id) continue;
					matchedMons.push({ prev:p, curr:c });
				}
			}
			this.debug('Temp party: matchedMons=>',matchedMons.length,' of ',this.memory.tempPartyBefore.length);
			if (matchedMons.length === this.memory.tempPartyBefore.length || this.forceTempPartyOff) {
				// We have our old party back now.
				this.memory.tempPartyBefore = null;
				sameMons = matchedMons; //replace sameMons so we don't get level up and heal messages
				let resolveTxt = 'The party has been restored to its original state.';
				if (this.forceTempPartyOff) {
					LOGGER.warn('Temporary party status is being forced off.');
					resolveTxt = 'This party is now considered the new permenient party.';
				}
				this.forceTempPartyOff = false;
				if (this.memory.tempPartyMeta) {
					Bot.alertUpdaters(`~~Alert: The party has drastically changed.~~ ${resolveTxt}`, { reuseId:this.memory.tempPartyMeta });
					this.memory.tempPartyMeta = null;
				}
			}
		}
		else {
			let tempIndicators = 0;
			if (prev_api.party.length > 0 && curr_api.party.length === 0) tempIndicators += 3; //suddenly no mons means temp party
			if (prev_api.party.length > 3 && curr_api.party.length === 3) tempIndicators++;
			if (prev_api.party.length > 1 && curr_api.party.length === 1) tempIndicators++;
			if (prev_api.party.length > 3 && curr_api.party.length === 1) tempIndicators++;
			if (sameMons.length === 0 && curr_api.party.length === 3) tempIndicators += 3;
			for (let { prev, curr } of sameMons) {
				if (prev.level !== 50 && curr.level === 50) tempIndicators++;
				if (prev.level !== 100 && curr.level === 100) tempIndicators++;
			}
			if (curr_api.location.is('tempParty')) tempIndicators += 3;
			
			this.debug('tempIndicators: ',tempIndicators, ' => ',tempIndicators > 3);
			if (tempIndicators > 3) {
				this.memory.tempPartyBefore = prev_api.party;
				if (Bot.runFlags('alert_temp')) {
					Bot.alertUpdaters(`Alert: The party has drastically changed. I am assuming this is a temporary team and will withold party updates until the usual party is restored.`)
						.then(msg=> this.memory.tempPartyMeta=msg.id);
				}
			}
		}
		
		if (this.memory.tempPartyBefore) {
			ledger.addItem(new TemporaryPartyContext());
			return; //do not continue to process the party
		}
		if (this.forceTempPartyOff) LOGGER.warn('Temporary party status forced off unnecessarily.');
		this.forceTempPartyOff = false;
		
		////////////////////////////////////////////////////////////////////////////////////////////
		
		if (curr_api.evolution_is_happening) {
			ledger.addItem(new EvolutionContext());
		}
		
		let partyHP = 0, partyMaxHP = 0, partyDeltaHP = 0;
		let partyPP = 0, partyMaxPP = 0, partyDeltaPP = 0;
		
		// Discover items in the party
		for (let { prev, curr } of sameMons) {
			// LOGGER.trace(`Discovering in ${curr}`);
			// Level up
			LOGGER.trace(`level: prev.level < curr.level`, prev.level, curr.level, prev.level < curr.level);
			if (prev.level !== curr.level) {
				ledger.addItem(new MonLeveledUp(curr, prev.level));
			}
			
			// Evolution, Hatching
			if (prev.species !== curr.species) {
				if (prev.species === 'Egg') {
					ledger.addItem(new MonHatched(curr));
				} else {
					ledger.addItem(new MonEvolved(curr, prev.species))
				}
			}
			
			// Pokerus
			if (!prev.pokerus && curr.pokerus) {
				ledger.addItem(new MonPokerusInfected(curr));
			} else if (prev.pokerus && !curr.pokerus) {
				ledger.addItem(new MonPokerusCured(curr));
			}
			
			// HP
			if (!this.config.supressHPUpdates) {
				if (prev.hp > 0 && curr.hp === 0) {
					ledger.addItem(new MonFainted(curr));
				} else if (prev.hp === 0 && curr.hp > 0) {
					ledger.addItem(new MonRevived(curr));
				}
				if (curr.hp > prev.hp) {
					ledger.addItem(new MonHealedHP(curr, prev.hp));
				} else if (curr.hp < prev.hp) {
					ledger.addItem(new MonLostHP(curr, prev.hp));
				}
				if (curr.status !== prev.status) {
					ledger.addItem(new MonStatusChanged(curr, prev.status));
				}
			}
			//*
			partyMaxHP += curr._hp[1];
			partyHP += curr._hp[0];
			partyDeltaHP += curr._hp[0] - prev._hp[0];
			/*/
			partyMaxHP += 100;
			partyHP += curr.hp;
			partyDeltaHP += curr.hp - prev.hp;
			//*/
			
			// Moves (Learns and PP)
			if (!this.config.supressMoveUpdates) {
				let movePairs = [];
				for (let i = 0; i < 4; i++) {
					let p = prev.moveInfo[i] || { id:0 };
					let c = curr.moveInfo[i] || { id:0 };
					movePairs.push({ p, c });
				}
				// Eliminate duplicates
				let it = 100;
				lblFix:
				while(it > 0) {
					it--;
					let numChanges = 0;
					for (let a = 0; a < movePairs.length; a++) {
						for (let b = 0; b < movePairs.length; b++) {
							if (a === b) continue;
							if (movePairs[a].p.id == 0) continue;
							if (movePairs[b].p.id == 0) continue;
							if (movePairs[a].p.id === movePairs[b].c.id &&
								movePairs[a].c.id === movePairs[b].p.id)
							{
								let temp = movePairs[b].c;
								movePairs[b].c = movePairs[a].c;
								movePairs[a].c = temp;
								continue lblFix;
							}
						}
					}
					break;
				}
				if (it === 0) {
					LOGGER.error(`Emergency break out from lblFix!`);
					ledger.addItem(new ApiDisturbance({
						code: ApiDisturbance.LOGIC_ERROR,
						reason: `Move pairs for '${curr}' could not be de-duplicated!`,
						score: 8,
					}));
				}
				
				for (let pair of movePairs) {
					if (!pair.p.id && pair.c.id) {
						ledger.addItem(new MonLearnedMove(curr, pair.c));
					} else if (pair.p.id && !pair.c.id) {
						ledger.addItem(new MonForgotMove(curr, pair.p));
					} else if (pair.p.id !== pair.c.id) {
						ledger.addItem(new MonLearnedMoveOverOldMove(curr, pair.c, pair.p));
					} else if (pair.c.id !== 0 && pair.p.id !== 0) {
						if (pair.c.pp < pair.p.pp) {
							ledger.addItem(new MonLostPP(curr, pair.c, pair.p.pp));
						} else if (pair.c.pp > pair.p.pp) {
							ledger.addItem(new MonHealedPP(curr, pair.c, pair.p.pp));
						}
						if (pair.c.max_pp < pair.p.max_pp) {
							ledger.addItem(new MonPPUp(curr, pair.c, pair.p.pp));
						}
						partyMaxPP += pair.c.max_pp;
						partyPP += pair.c.pp;
						partyDeltaPP += pair.c.pp - pair.p.pp;
					}
				}
			}
			
			// Now things that don't usually randomly change
			if (Bot.runOpts('shiny') && prev.shiny !== curr.shiny) {
				ledger.addItem(new MonShinyChanged(curr));
				ledger.addItem(new ApiDisturbance({
					code: ApiDisturbance.LOGIC_ERROR,
					reason: `'${curr}' has suddenly changed shiny status!`,
				}));
			}
			if (Bot.runOpts('sparkly') && prev.sparkly !== curr.sparkly) {
				ledger.addItem(new MonSparklyChanged(curr, prev.sparkly));
				ledger.addItem(new ApiDisturbance({
					code: ApiDisturbance.LOGIC_ERROR,
					reason: `'${curr}' has suddenly changed sparkly status!`,
				}));
			}
			if (Bot.runOpts('abilities') && prev.ability !== curr.ability) {
				ledger.addItem(new MonAbilityChanged(curr, prev.ability));
			}
			// Name changes are handled by the Pokemon Module
			// Held item changes are handled by the Pokemon Module
		}
		
		this.debug(`HP: hp=${partyHP} max=${partyMaxHP} delta=${partyDeltaHP}`);
		this.debug(`PP: pp=${partyPP} max=${partyMaxPP} delta=${partyDeltaPP}`);
		if (partyDeltaHP < 0) { // if HP has been lost
			if (partyHP === 0) { // If there's no HP in the party, we're definitely blacked out
				ledger.addItem(new Blackout());
			}
		} else if (partyDeltaHP > 0) { // if HP has been gained
			this.debug(`isBlackout=> pp[${(partyPP >= partyMaxPP)}] & hp[${(partyDeltaHP > partyMaxHP * 0.86)}] & loc[${!prev_api.location.equals(curr_api.location)}] & battle[${prev_api.battle.in_battle && !curr_api.battle.in_battle}] >= 3`);
			
			let blackoutIndicators = 0;
			if (partyPP >= partyMaxPP) blackoutIndicators++;
			if (partyDeltaHP > partyMaxHP * 0.86) blackoutIndicators++;
			if (!prev_api.location.equals(curr_api.location)) blackoutIndicators++;
			if (prev_api.battle.in_battle && !curr_api.battle.in_battle) blackoutIndicators++;
			
			if (partyHP === partyMaxHP) {
				ledger.addItem(new FullHealed(null));
				if (blackoutIndicators >= 3) {
					ledger.addItem(new Blackout());
				}
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
	}
}

RULES.push(new Rule(`When leveling up, don't report full heals`)
	.when(ledger=>ledger.has('MonLeveledUp'))
	.when(ledger=>ledger.has('FullHealed').ofImportance())
	.then(ledger=>{
		ledger.demote(1);
	})
);

RULES.push(new Rule(`When fully healing, don't report individual revivals`)
	.when(ledger=>ledger.has('FullHealed'))
	.when(ledger=>ledger.has('MonRevived', 'MonStatusChanged').ofImportance())
	.then(ledger=>{
		ledger.demote(1);
	})
);

RULES.push(new Rule(`When fully healing, make reference to where we're healing.`)
	.when(ledger=>ledger.has('FullHealed').ofNoFlavor())
	.when(ledger=>ledger.hasMap(x=>x.has('healing')))
	.then(ledger=>{
		let healtype = ledger.get(1)[0].has('healing');
		ledger.get(0).forEach(x=>x.flavor = healtype);
	})
);

// NOTE: This rule fails if we have a fully-healed team and a member of that team levels up at the
// end of the battle. This means the team will delta gain some HP from the level up, and if that
// mon is already at full health, it'd be considered a "Full Heal", which will trigger this rule.
//
// RULES.push(new Rule(`Full heals the moment the battle ends indicate a blackout.`)
// 	//TODO Except when walking around with a partner in gen 4
// 	//.when(ledger=>ledger.has('LocationContext').isNot('fullHealZone')
// 	.when(ledger=>ledger.has('FullHealed'))
// 	.when(ledger=>ledger.has('BattleEnded'))
// 	.when(ledger=>ledger.hasnt('Blackout'))
// 	.then(ledger=>{
// 		ledger.add(new Blackout());
// 	})
// );

RULES.push(new Rule(`Pokemon fainting due to poison outside of battle should be given a cause.`)
	.when(ledger=>ledger.has('MonFainted').ofNoFlavor())
	.when(ledger=>ledger.has('MonStatusChanged').withSame('mon.hash').with('prev', 'psn'))
	.when(ledger=>ledger.hasnt('BattleContext'))
	.then(ledger=>{
		ledger.get(0).forEach(x=>x.flavor = 'poisonWalking');
	})
);
RULES.push(new Rule(`Pokemon suriving due to poison outside of battle should be given a cause.`)
	.when(ledger=>ledger.has('MonStatusChanged').with('prev', 'psn'))
	.when(ledger=>ledger.has('MonLostHP').withSame('mon.hash').with('curr', 1))
	.when(ledger=>ledger.hasnt('BattleContext'))
	.then(ledger=>{
		ledger.get(0).forEach(x=>x.flavor = 'poisonWalking');
	})
);

{
	const KapowMoves = [153, 120, 515, 361, 461, 262]; //TODO move into default.js like the item ids
	RULES.push(new Rule(`Fainting when using a KAPOW move means the 'mon KAPOW'd`)
		.when(ledger=>ledger.has('MonFainted').ofNoFlavor())
		.when(ledger=>ledger.has('MonLostPP').withSame('mon.hash').with('move.id', KapowMoves))
		.then(ledger=>{
			ledger.get(0).forEach(x=>x.flavor = 'kapow');
		})
	);
}

RULES.push(new Rule('Abilities are expected to change during evolution')
	.when((ledger)=>ledger.has('MonEvolved'))
	.when((ledger)=>ledger.has('MonAbilityChanged').withSame('mon.hash'))
	.then((ledger)=>{
		ledger.remove(1); //Remove MonAbilityChanged
	})
);

RULES.push(new Rule('Abilities might change during battle')
	.when((ledger)=>ledger.has('BattleContext'))
	.when((ledger)=>ledger.has('MonAbilityChanged'))
	.then((ledger)=>{
		ledger.postpone(1);
	})
);

RULES.push(new Rule('Abilities changing when not expected are API Disturbances')
	.when((ledger)=>ledger.has('MonAbilityChanged').unmarked())
	.then((ledger)=>{
		ledger.mark(0).get(0).forEach(x=>{
			ledger.addItem(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `'${curr}' has unexpectantly changed ability!`,
			}));
		});
	})
);

RULES.push(new Rule('Postpone learning moves over Mimic until the end of battle')
	.when((ledger)=>ledger.has('BattleContext'))
	.when((ledger)=>ledger.has('MonLearnedMoveOverOldMove').with('prev', 'Mimic'))
	.then((ledger)=>{
		ledger.postpone(1);
	})
);

RULES.push(new Rule('Negative or more than 8 level gain usually means an API Disturbance')
	.when((ledger)=>ledger.has('MonLeveledUp').which(x=>x.deltaLevel < 0 || x.deltaLevel > 8).unmarked())
	.then((ledger)=>{
		// Postpone levelup report once, as the level might debounce
		ledger.mark(0).getAndPostpone(0).forEach(x=>{
			if (x.deltaLevel < 0) {
				ledger.add(new ApiDisturbance({
					reson: `The delta level of ${x.mon} is negative!`,
					code: ApiDisturbance.LOGIC_ERROR,
					score: x.deltaLevel, //constructor will abs() this value
				}));
			} else {
				ledger.add(new ApiDisturbance({
					reson: `The delta level of ${x.mon} is greater than 8!`,
					code: ApiDisturbance.LOGIC_ERROR,
					score: x.deltaLevel - 8,
				}));
			}
		});
	})
);

if (Bot.runOpts('namingMatch')) {
	RULES.push(new Rule('Mons being re-nicknamed have invalid characters in their names')
		.when(ledger=>ledger.has('MonNicknameChanged').whichMatches('curr', Bot.runOpts('namingMatch')))
		.then(ledger=>{
			ledger.postpone(0);
		})
	);
}

RULES.push(new Rule('Postpone effects of Mimic')
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLearnedMoveOverOldMove').with('prev', 'Mimic'))
	.then(ledger=>{
		ledger.postpone(1); // postpone move learn, for the duration of battle
	})
);

RULES.push(new Rule('Postpone effects of Transform or Imposter')
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonLearnedMoveOverOldMove', 'MonLearnedMove').moreThan(1))
	.when(ledger=>ledger.hasnt('MonLeveledUp'))
	.then(ledger=>{
		ledger.postpone(1); // postpone move learns, hopefully for the duration of battle
	})
);


module.exports = PartyModule;
