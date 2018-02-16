// newspress/modules/Party.js
// The Party reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	MonLeveledUp, MonEvolved, MonHatched, MonPokerusInfected, MonPokerusCured,
	MonFainted, MonRevived, MonHealedHP, MonLostHP, MonHealedPP, MonLostPP,
	MonLearnedMove, MonLearnedMoveOverOldMove, MonForgotMove, MonPPUp,
	MonGiveItem, MonTakeItem, MonSwapItem,
	MonShinyChanged, MonSparklyChanged, MonAbilityChanged, MonNicknameChanged,
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
		super(config, memory, 1);
		
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
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
		
		let partyHP = 0, partyMaxHP = 0, partyDeltaHP = 0;
		let partyPP = 0, partyMaxPP = 0, partyDeltaPP = 0;
		
		// Discover items in the party
		for (let { prev, curr } of sameMons) {
			// LOGGER.trace(`Discovering in ${curr}`);
			// Level up
			LOGGER.trace(`level: prev.level < curr.level`, prev.level, curr.level, prev.level < curr.level);
			if (prev.level !== curr.level) {
				ledger.addItem(new MonLeveledUp(curr, curr.level));
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
			{
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
							if (movePairs[a].p.id == 0) continue;
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
				if (it === 0) LOGGER.error(`Emergency break out from lblFix!`);
				
				for (let pair of movePairs) {
					if (!pair.p.id && pair.c.id) {
						ledger.addItem(new MonLearnedMove(curr, pair.c.name));
					} else if (pair.p.id && !pair.c.id) {
						ledger.addItem(new MonForgotMove(curr, pair.p.name));
					} else if (pair.p.id !== pair.c.id) {
						ledger.addItem(new MonLearnedMoveOverOldMove(curr, pair.c.name, pair.p.name));
					} else if (pair.c.id !== 0 && pair.p.id !== 0) {
						if (pair.c.pp < pair.p.pp) {
							ledger.addItem(new MonLostPP(curr, pair.c.name, pair.c.pp, pair.p.pp));
						} else if (pair.c.pp > pair.p.pp) {
							ledger.addItem(new MonHealedPP(curr, pair.c.name, pair.c.pp, pair.p.pp));
						}
						if (pair.c.max_pp < pair.p.max_pp) {
							ledger.addItem(new MonPPUp(curr, pair.c.name, pair.c.pp, pair.p.pp));
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
			}
			if (Bot.runOpts('sparkly') && prev.sparkly !== curr.sparkly) {
				ledger.addItem(new MonSparklyChanged(curr, prev.sparkly));
			}
			if (Bot.runOpts('abilities') && prev.ability !== curr.ability) {
				ledger.addItem(new MonAbilityChanged(curr, prev.ability));
			}
			// Name changes are handled by the Pokemon Module
			// Held item changes are handled by the Pokemon Module
		}
		
		LOGGER.debug(`HP: hp=${partyHP} max=${partyMaxHP} delta=${partyDeltaHP}`);
		LOGGER.debug(`PP: pp=${partyPP} max=${partyMaxPP} delta=${partyDeltaPP}`);
		if (partyDeltaHP < 0) { // if HP has been lost
			if (partyHP === 0) { // If there's no HP in the party, we're definitely blacked out
				ledger.addItem(new Blackout());
			}
		} else if (partyDeltaHP > 0) { // if HP has been gained
			LOGGER.debug(`isBlackout=> ${(partyPP >= partyMaxPP)} & ${(partyDeltaHP > partyMaxHP * 0.95)} & ${!prev_api.location.equals(curr_api.location)}`);
			let isBlackout = (partyPP >= partyMaxPP);
			isBlackout &= (partyDeltaHP > partyMaxHP * 0.95);
			isBlackout &= !prev_api.location.equals(curr_api.location);
			
			if (partyHP === partyMaxHP) {
				ledger.addItem(new FullHealed(null));
				if (isBlackout) {
					ledger.addItem(new Blackout());
				}
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
}

RULES.push(new Rule(`When fully healing, don't report individual revivals`)
	.when(ledger=>ledger.has('FullHealed'))
	.when(ledger=>ledger.has('MonRevived').ofImportance())
	.then(ledger=>{
		ledger.demote(1);
	})
);

RULES.push(new Rule(`Full heals the moment the battle ends indicate a blackout.`)
	//TODO Except when walking around with a partner in gen 4
	//.when(ledger=>ledger.has('LocationContext').isNot('fullHealZone')
	.when(ledger=>ledger.has('FullHealed'))
	.when(ledger=>ledger.has('BattleEnded'))
	.when(ledger=>ledger.hasnt('Blackout'))
	.then(ledger=>{
		ledger.add(new Blackout());
	})
);

const KapowMoves = ['Explosion', 'Self-Destruct', 'Selfdestruct'];//, 'Final Gambit', 'Healing Wish', 'Lunar Dance', 'Momento'];
RULES.push(new Rule(`Fainting when using a KAPOW move means the 'mon KAPOW'd`)
	.when(ledger=>ledger.has('MonFainted').ofNoFlavor())
	.when(ledger=>ledger.has('MonLostPP').withSame('mon').with('move', KapowMoves))
	.then(ledger=>{
		let items = ledger.demote(0);
		items.forEach(x=>x.flavor='kapow');
	})
);

RULES.push(new Rule('Abilities are expected to change during evolution')
	.when((ledger)=>ledger.has('MonEvolved'))
	.when((ledger)=>ledger.has('MonAbilityChanged').withSame('mon'))
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

if (Bot.runOpts('namingMatch')) {
	RULES.push(new Rule('Mons being nicknamed have invalid characters in their names')
		.when(ledger=>ledger.has('MonNicknameChanged').whichMatches('curr', Bot.runOpts('namingMatch')))
		.then(ledger=>{
			ledger.postpone(0);
		})
	);
}



module.exports = PartyModule;
