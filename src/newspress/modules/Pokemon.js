// newspress/modules/Pokemon.js
// The Pokemon reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	PokemonGained, PokemonIsMissing, PokemonTraded, PokemonDeposited, PokemonRetrieved,
	MonGiveItem, MonTakeItem, MonSwapItem,
	MonNicknameChanged,
	ApiDisturbance,
} = require('../ledger');

const LOGGER = getLogger('PokemonModule');

const RULES = [];

/**   ** Pokemon Module **
 * Responsible for discovering new pokemon, keeping track of missing pokemon,
 * keeping track of null boxes, keeping track of daycare, etc.
 */
class PokemonModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory, 3);
		this.memory.savedBoxes = (this.memory.savedBoxes||[]);
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
		let prev = prev_api.pokemon;
		let curr = curr_api.pokemon;
		
		// If boxes are missing, that is an ApiDisturbance
		if (curr.numNullBoxes) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.INVALID_DATA,
				reason: `${curr.numNullBoxes} PC boxes are missing!`
			}));
		}
		
		// Copy the pokemon map
		let curr_map = Object.assign({}, curr._map);
		let prev_map = Object.assign({}, prev._map);
		
		// Save off valid pokemon boxes in memory and fill in invalid boxes
		for (let bn = 0; bn < prev._pc.length; bn++) { //Must do previous first before current updates our records
			if (!prev._pc[bn]) {
				LOGGER.warn(`Missing PC Box PREV: adding pokemon to the box.`);
				for (let mon of this.memory.savedBoxes[bn]) {
					LOGGER.warn(`Adding`, mon);
					prev_map[mon.hash] = mon;
				}
			}
		}
		for (let bn = 0; bn < curr._pc.length; bn++) {
			if (curr._pc[bn]) {
				this.memory.savedBoxes[bn] = curr._pc[bn].slice();
			} else {
				LOGGER.warn(`Missing PC Box CURR: adding pokemon to the box.`);
				for (let mon of this.memory.savedBoxes[bn]) {
					LOGGER.warn(`Adding`, mon);
					curr_map[mon.hash] = mon;
				}
			}
		}
		
		// Determine deltas
		let added   = Object.keys(curr_map).filter(x=> !prev_map[x]).map(x=>curr_map[x]);
		let removed = Object.keys(prev_map).filter(x=> !curr_map[x]).map(x=>prev_map[x]);
		let same    = Object.keys(curr_map).filter(x=>!!prev_map[x]).map(x=>({ curr:curr_map[x], prev:prev_map[x] }));
			
		this.debug(`deltas: add=`, added, ` removed=`, removed, ` same.length=`, same.length);
		
		// Note all Pokemon aquisitions
		for (let mon of added) {
			LOGGER.warn(`ledger.add(new PokemonGained(`,mon,`));`);
			ledger.add(new PokemonGained(mon));
		}
		// Note all Pokemon missings
		for (let mon of removed) {
			ledger.add(new PokemonIsMissing(mon));
		}
		
		// Note odd behaviors with gaining or losing pokemon
		if (added.length > 4) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `More than 4 pokemon have been caught in one update cycle!`
			}));
		}
		if (removed.length > 4) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `More than 4 pokemon have gone missing in one update cycle!`
			}));
		}
		
		// Note any updates to PC Pokemon
		for (let { prev, curr } of same) {
			if (prev.name !== curr.name) {
				ledger.add(new MonNicknameChanged(curr, prev.name));
			}
			// Items
			if (Bot.runOpts('heldItem')) {
				if (!prev.item.id && curr.item.id) {
					ledger.addItem(new MonGiveItem(curr, curr.item));
				} else if (prev.item.id && !curr.item.id) {
					ledger.addItem(new MonTakeItem(curr, prev.item));
				} else if (prev.item.id !== curr.item.id) {
					ledger.addItem(new MonSwapItem(curr, curr.item, prev.item));
				}
			}
			// Location changes
			if (prev.storedIn !== curr.storedIn) {
				if (prev.storedIn.startsWith('party') && !curr.storedIn.startsWith('party')) {
					if (curr.storedIn.startsWith('box')) {
						ledger.addItem(new PokemonDeposited(curr, prev.storedIn, 'pc'));
					}
					else if (curr.storedIn.startsWith('daycare')) {
						ledger.addItem(new PokemonDeposited(curr, prev.storedIn, 'daycare'));
					}
					//TODO Poke islands in Gen 7?
				}
				else if (prev.storedIn.startsWith('box') && curr.storedIn.startsWith('party')) {
					ledger.addItem(new PokemonRetrieved(curr, prev.storedIn, 'pc'));
				}
				else if (prev.storedIn.startsWith('daycare') && curr.storedIn.startsWith('party')) {
					ledger.addItem(new PokemonRetrieved(curr, prev.storedIn, 'daycare'));
				}
				//TODO Poke islands in Gen 7?
				// Cannot cross from box directly into daycare or visaversa
			}
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger) );
	}
	
	finalPass(ledger) {
		let missing = ledger.findAllItemsWithName('PokemonIsMissing');
		
		//TODO do a query to the updaters, and handle the event where the bot dies before the query is resolved or timed out
	}
}

RULES.push(new Rule('Pokemon found to be in a new storage location are deposited.')
	//PokemonFound = merge of PokemonIsMissing and PokemonGained
	.when(ledger=>ledger.has('PokemonFound').with('inNewLocation', true).unmarked()) 
	.then(ledger=>{
		ledger.mark(0).get(0).forEach(x=>{
			let { prev, curr } = x;
			if (typeof prev.storedIn !== 'string' || typeof curr.storedIn !== 'string') return; //sanity check
			// A copy of the Location changes above
			if (prev.storedIn.startsWith('party') && !curr.storedIn.startsWith('party')) {
				if (curr.storedIn.startsWith('box')) {
					ledger.add(new PokemonDeposited(curr, prev.storedIn, 'pc'));
				}
				else if (curr.storedIn.startsWith('daycare')) {
					ledger.add(new PokemonDeposited(curr, prev.storedIn, 'daycare'));
				}
				//TODO Poke islands in Gen 7?
			}
			else if (prev.storedIn.startsWith('box') && curr.storedIn.startsWith('party')) {
				ledger.add(new PokemonRetrieved(curr, prev.storedIn, 'pc'));
			}
			else if (prev.storedIn.startsWith('daycare') && curr.storedIn.startsWith('party')) {
				ledger.add(new PokemonRetrieved(curr, prev.storedIn, 'daycare'));
			}
			//TODO Poke islands in Gen 7?
			// Cannot cross from box directly into daycare or visaversa
		});
	})
);

RULES.push(new Rule('GainedPokemon in the same storage location as a MissingPokemon are traded')
	.when(ledger=>ledger.has('PokemonIsMissing'))
	.when(ledger=>ledger.has('PokemonGained'))
	.when(ledger=>{// If there are PokemonIsMissing and PokemonGained entries that match, match them up
		let MIA = new Map(ledger.get(0).map(x=> [x.mon.storedIn, x]));
		let NEW = new Map(ledger.get(1).map(x=> [x.mon.storedIn, x]));
		let MAP = new Map();
		NEW.forEach((val, key)=>{
			if (MIA.has(key)) {
				MAP.set(val, MIA.get(key));
			}
		});
		ledger.matchedItems.push(MAP); 
		return MAP.size > 0; //return true if we found some matches
	})
	.then(ledger=>{
		let MAP = ledger.get(2);
		for (let match of MAP) { //match is an array [PokemonGained, PokemonIsMissing];
			ledger.add(new PokemonTraded(match[0], match[1]));
			ledger.remove(match); //removes both ledger items
		}
	})
);

RULES.push(new Rule('Report multiple Pokemon changing their name at once as an ApiDisturbance')
	.when(ledger=>ledger.has('MonNicknameChanged').newlyAdded().moreThan(1))
	.then(ledger=>{
		ledger.add(new ApiDisturbance({
			code: ApiDisturbance.LOGIC_ERROR,
			reason: 'Multiple Pokemon changed their nicknames in one update cycle.',
		}));
	})
);

RULES.push(new Rule('Postpone all Missing Pokemon')
	.when(ledger=>ledger.has('PokemonIsMissing'))
	.then(ledger=>{
		ledger.postpone(0); //Postpone PokemonIsMissing
	})
);

RULES.push(new Rule('Postpone reporting of name changes until the end of a battle')
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonNicknameChanged'))
	.then(ledger=>{
		ledger.postpone(1); //Postpone MonNicknameChanged
	})
);

RULES.push(new Rule('Postpone reporting of new Pokemon until the end of a battle')
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('PokemonGained'))
	.then(ledger=>{
		ledger.postpone(1); //Postpone PokemonGained
	})
);

RULES.push(new Rule('Do not report any name changes when a pokemon is caught')
	.when(ledger=>ledger.has('PokemonGained'))
	.when(ledger=>ledger.has('MonNicknameChanged'))
	.then(ledger=>{
		ledger.remove(1); //Remove MonNicknameChanged, if there are any left after postpone cancellation
	})
);

module.exports = PokemonModule;
