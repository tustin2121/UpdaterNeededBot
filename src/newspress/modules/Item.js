// newspress/modules/Item.js
// The Item reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	GainItem, LostItem, StoredItemInPC, RetrievedItemFromPC,
	UsedBallInBattle, UsedBerryInBattle,
} = require('../ledger');

const RULES = [];

/**   ** Item Module **
 * Responsible for keeping tabs on all items across bag, pc, and held by pokemon.
 * This includes buying, selling, obtaining, using items.
 */
class ItemModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 1); //low priority
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
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
			
		
		for (let id in keySet) {
			let item = curr.inv.getData(id) || prev.inv.getData(id);
			let delta = invDelta[id] || 0;
			
			const gained = invDelta[id] > 0;
			const dropped = invDelta[id] < 0;
			
			if (heldDelta[id] !== 0) {
				//held item LedgerItems are added by the Pokemon and Party modules
				delta += heldDelta[id];
			}
			if (delta == 0) continue;
			
			if (pcDelta[id] !== 0) {
				if (pcDelta[id] > 0) {
					if (gained) {
						//added to PC without passing through bag
					} else {
						ledger.addItem(new StoredItemInPC(item, pcDelta[id]));
					}
				} else { // < 0
					if (dropped) {
						//lost from PC without passing through bag
					} else {
						ledger.addItem(new RetrievedItemFromPC(item, -pcDelta[id]));
					}
				}
				delta += pcDelta[id];
			}
			if (delta == 0) continue;
			
			if (bagDelta[id] !== 0) {
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
			if (delta == 0) continue;
			
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
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

//////////////////////////////////////////////////////////////////////////
// Checking item uses

const BallIds = Bot.runOpts('pokeballIds');
RULES.push(new Rule(`Pokeballs lost in battle have been thrown`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('LostItem').with('item.id', BallIds))
	.then(ledger=>{
		ledger.remove(1).forEach(x=> ledger.add(new UsedBallInBattle(x.item, x.amount)));
	})
);

const BerryIds = Bot.runOpts('berryIds');
if (Bot.runOpts('heldItem')) {
	// const BerryIds = Bot.runOpts('berryIds');
	RULES.push(new Rule(`Held berries used in battle have been eaten`)
		.when(ledger=>ledger.has('BattleContext'))
		.when(ledger=>ledger.has('MonTakeItem').with('item.id', BerryIds))
		.then(ledger=>{
			ledger.remove(1).forEach(x=> ledger.add(new UsedBerryInBattle(x.item, x.mon)));
		})
	);
}

//////////////////////////////////////////////////////////////////////////
// Item aquisition categorization

const DrinkIds = Bot.runOpts('vendedItemIds');
RULES.push(new Rule(`Drinks are vended`)
	.when(ledger=>ledger.hasMap(x=> x.attr('vending') ))
	.when(ledger=>ledger.has('GainItem').with('item.id', DrinkIds).ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'vending');
	})
);

RULES.push(new Rule(`Items gained in shops have been bought`)
	.when(ledger=>ledger.hasMap(x=> x.attr('shopping') ))
	.when(ledger=>ledger.has('GainItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'shopping');
	})
);
RULES.push(new Rule(`Items lost in shops have been sold`)
	.when(ledger=>ledger.hasMap(x=> x.attr('shopping') ))
	.when(ledger=>ledger.has('LostItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'shopping');
	})
);



module.exports = ItemModule;
