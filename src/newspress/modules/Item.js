// newspress/modules/Item.js
// The Item reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	GainItem, LostItem, StoredItemInPC, RetrievedItemFromPC, HeldItemGained, HeldItemLost,
	MoneyValueChanged,
	UsedBallInBattle, UsedBerryInBattle, UsedItemOnMon,
	ShoppingContext, ShoppingReport, 
	ApiDisturbance,
} = require('../ledger');

const LOGGER = getLogger('ItemModule');

const RULES = [];

/**   ** Item Module **
 * Responsible for keeping tabs on all items across bag, pc, and held by pokemon.
 * This includes buying, selling, obtaining, using items.
 */
class ItemModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 2); //low priority
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		this.setDebug(LOGGER, ledger);
		let invDelta = getDelta(curr.inv._inv, prev.inv._inv);
		let bagDelta = getDelta(curr.inv.bag, prev.inv.bag);
		let heldDelta = getDelta(curr.inv.held, prev.inv.held);
		let pcDelta = getDelta(curr.inv.pc, prev.inv.pc);
		
		let keySet = [
			...Object.keys(invDelta),
			...Object.keys(bagDelta),
			...Object.keys(heldDelta),
			...Object.keys(pcDelta),
		];
		keySet = new Set(keySet);
		
		let numItemsChanged = 0;
		
		this.debug('keyset', keySet);
		
		for (let id of keySet) {
			let item = curr.inv.getData(id) || prev.inv.getData(id);
			let delta = invDelta[id] || 0;
			
			this.debug(`item delta => ${item}: delta=${delta} held=${heldDelta[id]}, pc=${pcDelta[id]}, bag=${bagDelta[id]}`);
			
			numItemsChanged += Math.abs(delta) + Math.abs(heldDelta[id]) + Math.abs(pcDelta[id]) + Math.abs(bagDelta[id]);
			
			const gained = invDelta[id] > 0;
			const dropped = invDelta[id] < 0;
			
			if (typeof heldDelta[id] === 'number' && heldDelta[id] !== 0) {
				//held item LedgerItems are added by the Pokemon and Party modules
				if (heldDelta[id] > 0) {
					if (gained) {
						ledger.addItem(new HeldItemGained(item, heldDelta[id]));
					} else {
						// expected results: item transferred from bag or pc
					}
				} else { // < 0
					if (dropped) {
						ledger.addItem(new HeldItemLost(item, heldDelta[id]));
					} else {
						// expected results: item transferred to bag or pc
					}
				}
				delta += heldDelta[id];
			}
			
			if (typeof pcDelta[id] === 'number' && pcDelta[id] !== 0) {
				if (pcDelta[id] > 0) {
					if (gained) {
						//added to PC without passing through bag
					} else {
						ledger.addItem(new StoredItemInPC(item, pcDelta[id]));
					}
				} else { // < 0
					if (dropped) {
						//lost from PC without passing through bag
						ledger.addItem(new LostItem(item, -pcDelta[id]));
					} else {
						ledger.addItem(new RetrievedItemFromPC(item, -pcDelta[id]));
					}
				}
				delta += pcDelta[id];
			}
			
			if (typeof bagDelta[id] === 'number' && bagDelta[id] !== 0) {
				if (bagDelta[id] > 0) {
					if (gained) {
						ledger.addItem(new GainItem(item, bagDelta[id]));
					} else {
						//cases handled elsewhere
					}
				} else { // < 0
					if (dropped) {
						ledger.addItem(new LostItem(item, -bagDelta[id]));
					} else {
						//cases handled elsewhere
					}
				}
			}
		}
		
		if (numItemsChanged > 10) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `${numItemsChanged} item updates happened in one update cycle!`,
				score: numItemsChanged/10,
			}));
		}
		
		if (curr.inv.money !== prev.inv.money) {
			ledger.add(new MoneyValueChanged(prev.inv.money, curr.inv.money));
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
}

function getDelta(curr, prev) {
	let delta = {};
	Object.keys(curr).forEach(x=>delta[x] = curr[x]);
	Object.keys(prev).forEach(x=>delta[x] = (delta[x]||0) - prev[x]);
	Object.keys(delta).forEach(x=>{
		if (delta[x]===0) delete delta[x];
	});
	return delta;
}


RULES.push(new Rule(`Discard insane item updates`)
	.when(ledger=>ledger.has('ApiDisturbance'))
	.when(ledger=>ledger.has('LostItem', 'GainItem').moreThan(20))
	.then(ledger=>{
		ledger.demote(1, 10); //drop everything
	})
);

//////////////////////////////////////////////////////////////////////////
// Checking item uses
if (!!Bot.gameInfo().regionMap) {
	RULES.push(new Rule(`Check for reports for new item gains.`)
		.when(ledger=>ledger.has('GainItem').unmarked())
		.when(ledger=>{
			const region = Bot.gameInfo().regionMap;
			const currTime = Date.now();
			let map = ledger.ledger.findAllItemsWithName('MapContext')[0];
			if (map && map.area) map = map.area;
			else if (map && map.loc) map = map.loc;
			
			let ret = false;
			for (let x of ledger.get(0)) {
				let report = region.findItemReport(map, x.item.id);
				if (report) {
					x.report = report;
					x.flavor = 'report';
					ret = true;
				}
			}
			return ret;
		})
		.then(ledger=>ledger.mark(0))
	);
}{
	const itemIds = Bot.runOpts('itemIds_pokeballs');
	RULES.push(new Rule(`Pokeballs lost in battle have been thrown`)
		.when(ledger=>ledger.has('BattleContext', 'BattleEnded'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let context = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedBallInBattle(x.item, context.battle, x.amount)));
		})
	);
	RULES.push(new Rule(`Pokeballs lost when a pokemon has been gained have been thrown.`)
		.when(ledger=>ledger.has('PokemonGained'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let gained = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedBallInBattle(x.item, gained.mon, x.amount)));
		})
	);
	RULES.push(new Rule(`Merge UsedBallInBattle items together.`)
		.when(ledger=>ledger.has('UsedBallInBattle').moreThan(1))
		.then(ledger=>ledger.mergeTogether(0))
	);
}{
	const itemIds = Bot.runOpts('itemIds_berries');
	if (Bot.runOpts('heldItem')) {
		RULES.push(new Rule(`Held berries used in battle have been eaten`)
			.when(ledger=>ledger.has('BattleContext'))
			.when(ledger=>ledger.has('MonTakeItem').with('item.id', itemIds))
			.then(ledger=>{
				ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedBerryInBattle(x.item, x.mon)));
			})
		);
	}
}{
	const itemIds = Bot.runOpts('itemIds_revive'); //TODO
	RULES.push(new Rule(`Reviving items lost when a Pokemon is revived have been used.`)
		.when(ledger=>ledger.has('MonRevived'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('hpheal', x.item, item.mon)));
		})
	);
}{
	const itemIds = Bot.runOpts('itemIds_healHP'); //TODO
	RULES.push(new Rule(`Healing items lost when a Pokemon regains HP have been used.`)
		.when(ledger=>ledger.has('MonHealedHP'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('hpheal', x.item, item.mon)));
		})
	);
}{
	const itemIds = Bot.runOpts('itemIds_healPP'); //TODO
	RULES.push(new Rule(`PP restoring items lost when a Pokemon regains PP have been used.`)
		.when(ledger=>ledger.has('MonHealedPP'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0);
			if (item.length > 1) {
				ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('pphealAll', x.item, item[0].mon)));
			} else {
				ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('ppheal', x.item, item[0].mon, item[0].move)));
			}
		})
	);
}{
	const itemIds = Bot.runOpts('itemIds_evoStones'); //TODO
	RULES.push(new Rule(`Stones lost during evoltuion have been used.`)
		.when(ledger=>ledger.has('MonEvolved'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds).unmarked())
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.mark(1).remove(1).get(1).forEach(x=>{
				ledger.add(new UsedItemOnMon('evostone', x.item, item.mon));
				x.amount--;
				if (x.amount) ledger.add(x); //add it back in
			});
		})
	);
	
	RULES.push(new Rule(`Postpone lost stones during an evolution if we don't have a pokemon to pin them on yet.`)
		.when(ledger=>ledger.has('EvolutionContext'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			ledger.postpone(1);
		})
	);
}{
	const itemIds = Bot.runOpts('itemIds_rareCandy'); //TODO
	RULES.push(new Rule(`Rare Candy lost when a pokemon levels up has been used.`)
		.when(ledger=>ledger.has('MonLeveledUp'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon(null, x.item, item.mon)));
		})
	);
}{
	const itemIds = Bot.runOpts('itemIds_tms'); //TODO
	RULES.push(new Rule(`TMs lost during move learn over move have been used.`)
		.when(ledger=>ledger.has('MonLearnedMoveOverOldMove'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('tm', x.item, item.mon)));
		})
	);
	RULES.push(new Rule(`TMs lost during move learn have been used.`)
		.when(ledger=>ledger.has('MonLearned'))
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('tm', x.item, item.mon)));
		})
	);
}

//////////////////////////////////////////////////////////////////////////
// Item aquisition categorization

{
	const itemIds = Bot.runOpts('itemIds_vending');
	RULES.push(new Rule(`Drinks are vended`)
		.when(ledger=>ledger.hasMap(x=> x.has('vending') ))
		.when(ledger=>ledger.has('GainItem').with('item.id', itemIds).ofNoFlavor())
		.then(ledger=>{
			ledger.get(1).forEach(x=> x.flavor = 'vending');
		})
	);
}

//TODO new Rule(`Items gained while shopping are postponed until the shopping is finished`)

RULES.push(new Rule(`Items gained/lost in shops have been bought/sold`)
	.when(ledger=>ledger.hasMap(x=> x.has('shopping') ))
	.when(ledger=>ledger.has('GainItem','LostItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'shopping');
	})
);
RULES.push(new Rule(`Items gained/lost with a change in money on hand has been bought/sold`)
	.when(ledger=>ledger.has('MoneyValueChanged'))
	.when(ledger=>ledger.has('GainItem', 'LostItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'shopping');
	})
);

RULES.push(new Rule(`When shopping happens, we need a shopping context.`)
	.when(ledger=>ledger.has('GainItem','LostItem').ofFlavor('shopping'))
	.when(ledger=>ledger.hasnt('ShoppingContext'))
	.then(ledger=>{
		ledger.add(new ShoppingContext());
	})
);

RULES.push(new Rule(`Mark bough items in the shopping context.`)
	.when(ledger=>ledger.has('ShoppingContext'))
	.when(ledger=>ledger.has('GainItem').ofFlavor('shopping').unmarked())
	.then(ledger=>{
		let ctx = ledger.get(0)[0];
		ctx.keepAlive();
		ledger.mark(1).get(1).forEach(x=>ctx.boughtItem(x.item, x.amount));
	})
);
RULES.push(new Rule(`Mark sold items in the shopping context.`)
	.when(ledger=>ledger.has('ShoppingContext'))
	.when(ledger=>ledger.has('LostItem').ofFlavor('shopping').unmarked())
	.then(ledger=>{
		let ctx = ledger.get(0)[0];
		ctx.keepAlive();
		ledger.mark(1).get(1).forEach(x=>ctx.soldItem(x.item, x.amount));
	})
);
RULES.push(new Rule(`Update the money count on the shopping context.`)
	.when(ledger=>ledger.has('ShoppingContext'))
	.when(ledger=>ledger.has('MoneyValueChanged').unmarked())
	.then(ledger=>{
		let ctx = ledger.get(0)[0];
		ledger.mark(1).get(1).forEach(x=>ctx.cart.money = x.curr);
	})
);
RULES.push(new Rule(`Give the Shopping Context more time to live during Democracy.`)
	.when(ledger=>ledger.has('ShoppingContext').unmarked())
	.when(ledger=>ledger.has('DemocracyContext'))
	.then(ledger=>{
		ledger.mark(0).forEach(x=>x.ttl+=0.75);
	})
);
RULES.push(new Rule(`Set the TTL to 0 on the Shopping Context when we change maps.`)
	.when(ledger=>ledger.has('ShoppingContext').unmarked())
	.when(ledger=>ledger.has('MapChanged'))
	.then(ledger=>{
		ledger.mark(0).forEach(x=>x.ttl=0);
	})
);
RULES.push(new Rule(`Postpone the shopping context.`)
	.when(ledger=>ledger.has('ShoppingContext').unmarked())
	.then(ledger=>{
		ledger.mark(0).postpone(0);
	})
);

{
	const itemIds = Bot.runOpts('itemIds_promo');
	RULES.push(new Rule(`Premire Balls are given away, not bought.`)
		.when(ledger=>ledger.has('GainItem').with('item.id', itemIds).ofFlavor('shopping'))
		.then(ledger=>{
			ledger.get(0).forEach(x=> x.flavor = 'freepromo');
		})
	);
	RULES.push(new Rule(`Premire Balls are given away while we're shopping.`)
		.when(ledger=>ledger.has('GainItem').with('item.id', itemIds))
		.when(ledger=>ledger.has('ShoppingContext'))
		.then(ledger=>{
			ledger.get(0).forEach(x=> x.flavor = 'freepromo');
		})
	);
}

RULES.push(new Rule(`Balls used in a wild battle are postponed until after battle`)
	.when(ledger=>ledger.has('UsedBallInBattle').ofNoFlavor())
	.when(ledger=>ledger.has('BattleContext').with('isImportant', false))
	.then(ledger=>{
		// After so many turns, there's a chance we don't postpone these anymore.
		let item = ledger.get(0)[0];
		if (item._postponeCount > 16 && item.amount > 5 && Math.random() < 0.3) return;
		ledger.postpone(0);
	})
);

if (Bot.runOpts('heldItem')) {
	RULES.push(new Rule(`Items not handled above taken from a mon in battle are postponed.`)
		.when(ledger=>ledger.has('BattleContext'))
		.when(ledger=>ledger.has('MonTakeItem'))
		.then(ledger=>{
			ledger.postpone(1);
		})
	);
	RULES.push(new Rule(`Items not handled above taken from a mon in battle are postponed.`)
		.when(ledger=>ledger.has('BattleContext'))
		.when(ledger=>ledger.has('MonGiveItem'))
		.then(ledger=>{
			ledger.postpone(1);
		})
	);
}

if (Bot.runOpts('heldItem') && Bot.runOpts('abilities')) {
	RULES.push(new Rule(`Items gained inexplicably on a mon with Pickup were Picked Up.`)
		.when(ledger=>ledger.has('HeldItemGained'))
		.when(ledger=>ledger.has('MonGiveItem').withSame('item.id').which(x=>x.mon.ability.toLowerCase() === 'pickup').unmarked())
		.then(ledger=>{
			ledger.mark(1).get(1).forEach(x=>x.flavor='pickupAbility');
		})
	);
	
}

//////////////////////////////////////////////////////////////////////////
// Shopping
/*
RULES.push(new Rule(`Add items bought during shopping to the shopping cart.`)
	.when(ledger=>ledger.hasMapThatIs('shopping'))
	.when(ledger=>ledger.has('GainItem').unmarked())
	.then(ledger=>{
		
	})
);
//*/
module.exports = ItemModule;
