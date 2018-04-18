// newspress/modules/Item.js
// The Item reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	GainItem, LostItem, StoredItemInPC, RetrievedItemFromPC,
	UsedBallInBattle, UsedBerryInBattle, UsedItemOnMon,
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
		
		this.debug('keyset', keySet);
		
		for (let id of keySet) {
			let item = curr.inv.getData(id) || prev.inv.getData(id);
			let delta = invDelta[id] || 0;
			
			this.debug('item delta', item, delta, heldDelta[id], pcDelta[id], bagDelta[id]);
			
			const gained = invDelta[id] > 0;
			const dropped = invDelta[id] < 0;
			
			if (typeof heldDelta[id] === 'number' && heldDelta[id] !== 0) {
				//held item LedgerItems are added by the Pokemon and Party modules
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
{
	const itemIds = Bot.runOpts('itemIds_pokeballs');
	RULES.push(new Rule(`Pokeballs lost in battle have been thrown`)
		.when(ledger=>ledger.has('BattleContext'))
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
		.when(ledger=>ledger.has('LostItem').with('item.id', itemIds))
		.then(ledger=>{
			let item = ledger.get(0)[0];
			ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedItemOnMon('evostone', x.item, item.mon)));
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
	const DrinkIds = Bot.runOpts('itemIds_vending');
	RULES.push(new Rule(`Drinks are vended`)
		.when(ledger=>ledger.hasMap(x=> x.has('vending') ))
		.when(ledger=>ledger.has('GainItem').with('item.id', DrinkIds).ofNoFlavor())
		.then(ledger=>{
			ledger.get(1).forEach(x=> x.flavor = 'vending');
		})
	);
}

//TODO new Rule(`Items gained while shopping are postponed until the shopping is finished`)

RULES.push(new Rule(`Items gained in shops have been bought`)
	.when(ledger=>ledger.hasMap(x=> x.has('shopping') ))
	.when(ledger=>ledger.has('GainItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'shopping');
	})
);
RULES.push(new Rule(`Items lost in shops have been sold`)
	.when(ledger=>ledger.hasMap(x=> x.has('shopping') ))
	.when(ledger=>ledger.has('LostItem').ofNoFlavor())
	.then(ledger=>{
		ledger.get(1).forEach(x=> x.flavor = 'shopping');
	})
);



module.exports = ItemModule;
