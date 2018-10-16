// newspress/modules/Pokemon.js
// The Pokemon reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	PokemonGained, PokemonIsMissing, PokemonLost, PokemonTraded, PokemonDeposited, PokemonRetrieved,
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
		this.memory.missingQuery = (this.memory.missingQuery||null);
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		this.setDebug(LOGGER, ledger);
		let prev = prev_api.pokemon;
		let curr = curr_api.pokemon;
		
		// If boxes are missing, that is an ApiDisturbance
		if (curr.numNullBoxes) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.INVALID_DATA,
				reason: `${curr.numNullBoxes} PC boxes are missing!`,
				score: curr.numNullBoxes,
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
			ledger.add(new PokemonIsMissing(mon, prev.getRawData(mon)));
		}
		
		// Note odd behaviors with gaining or losing pokemon
		if (added.length > 4) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `More than 4 pokemon have been caught in one update cycle!`,
				score: added.length / 4,
			}));
		}
		if (removed.length > 4) {
			ledger.add(new ApiDisturbance({
				code: ApiDisturbance.LOGIC_ERROR,
				reason: `More than 4 pokemon have gone missing in one update cycle!`,
				score: removed.length / 4,
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
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
	
	finalPass(ledger) {
		let missing = ledger.findAllItemsWithName('PokemonIsMissing');
		
		//TODO do a query to the updaters, and handle the event where the bot dies before the query is resolved or timed out
	}
}

RULES.push(new Rule('Postpone reporting of new or lost Pokemon when we have a temporary party')
	.when(ledger=>ledger.has('TemporaryPartyContext'))
	.when(ledger=>ledger.has('PokemonGained', 'PokemonIsMissing'))
	.then(ledger=>{
		ledger.postpone(1); //Postpone PokemonGained, PokemonIsMissing
	})
);

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
	.when(ledger=>Bot.runFlag('trading_enabled')) //only run this rule if trade watch is enabled
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
			match[1].markAsFallen(`Traded for ${match[0].mon}`);
			ledger.add(new PokemonTraded(match[0].mon, match[1].mon));
			ledger.remove(match); //removes both ledger items
		}
	})
);

RULES.push(new Rule('Report multiple Pokemon changing their name at once as an ApiDisturbance')
	.when(ledger=>ledger.has('MonNicknameChanged').newlyAdded().moreThan(1))
	.then(ledger=>{
		let num = ledger.get(0).length;
		ledger.add(new ApiDisturbance({
			code: ApiDisturbance.LOGIC_ERROR,
			reason: 'Multiple Pokemon changed their nicknames in one update cycle.',
			score: num / 4,
		}));
	})
);

RULES.push(new Rule(`More than 4 simultaneously missing pokemon is an API Disturbance.`)
	// .when(ledger=>ledger.has('PokemonIsMissing').withSame('ticksActive').moreThan(4))
	.when(ledger=>{
		// If there are more than 4 PokemonIsMissing items that are postponed the same number of times 
		// (that is, all created at the same time), then there's an API destrubance ongoing
		let items = ledger.ledger.findAllItemsWithName('PokemonIsMissing');
		if (!items || !items.length) return false;
		let levels = [];
		for (let item of items) {
			let i = item._postponeCount;
			levels[i] = (levels[i]||0) + 1;
			if (levels[i] > 4) { 
				ledger.has('PokemonIsMissing').with('_postponeCount', i); //set up list for then statement
				return true;
			}
		}
		return false;
	})
	.then(ledger=>{
		let num = ledger.get(0).length;
		ledger.add(new ApiDisturbance({
			code: ApiDisturbance.LOGIC_ERROR,
			reason: `There are ${num} Pokemon missing simultaneously!`,
			score: num,
		}));
	})
);
// Between these two rules, more than 4 simultanious pokemon missing should never get asked about.
RULES.push(new Rule('Postpone missing pokemon reports when an API Distrubance is active.')
	.when(ledger=>ledger.has('ApiDisturbance'))
	.when(ledger=>ledger.has('PokemonIsMissing'))
	.then(ledger=>{
		LOGGER.warn('API Distrubances active, postponing missing pokemon.');
		ledger.postpone(1); //Postpone PokemonIsMissing, don't increment ticks
	})
);

RULES.push(new Rule('Postpone (and wait for) confirmed unreleased Pokemon')
	.when(ledger=>ledger.has('PokemonIsMissing').which(x=>x.query === true))
	.then(ledger=>{
		ledger.postpone(0); //Postpone PokemonIsMissing
	})
);

RULES.push(new Rule('Postpone recently missing Pokemon')
	.when(ledger=>ledger.has('PokemonIsMissing').which(x=>x.ticksActive < 5)) //~1 minute
	.then(ledger=>{
		//TODO: DON'T USE LASTRESULT!
		let tickDelta = (ledger.has('DemocracyContext').lastResult)?0.1:1; //~10 minutes in democracy
		ledger.getAndPostpone(0).forEach(x=>x.ticksActive += tickDelta); //Postpone PokemonIsMissing
	})
);

RULES.push(new Rule('Postpone reporting missing Pokemon when asking about MIA Pokemon is disabled')
	.when(ledger=>!Bot.runFlag('query_missing'))
	.when(ledger=>ledger.has('PokemonIsMissing').which(x=>x.ticksActive < 25)) //~6 minutes
	.then(ledger=>{
		//TODO: DON'T USE LASTRESULT!
		let tickDelta = (ledger.has('DemocracyContext').lastResult)?0.2:1; //~30 minutes in democracy
		ledger.getAndPostpone(0).forEach(x=>x.ticksActive += tickDelta); //Postpone PokemonIsMissing
	})
);

RULES.push(new Rule('Ask Updaters about Missing Pokemon')
	.when(ledger=>Bot.runFlag('query_missing'))
	.when(ledger=>ledger.has('PokemonIsMissing'))
	.then(ledger=>{
		ledger.get(0).forEach(item=>{
			LOGGER.debug('')
			if (!item.query) { //Make a query for this pokemon
				item.query = Bot.queryUpdaters(
					`Query: A Lv${item.mon.level} ${item.mon.gender} ${item.mon} is missing from the API, and is suspected released.\n`+
					`If anyone can confirm this release, reply {{confirm}}. If it certainly hasn't been released, reply {{deny}}. I will assume it has been released when this query expires.`, 
					{ timeout:1000*60*10, bypassTagCheck:true });
				item.ticksActive++;
				ledger.postpone(item);
			} else { //Check an existing query for this pokemon
				let res = Bot.checkQuery(item.query)
				if (res === true) { //released
					item.markAsFallen('Confirmed released.');
					ledger.remove(item).add(new PokemonLost(item.mon, item.timestamp, 'confirmed'));
				} else if (res === false) { //not released
					item.query = true;
					ledger.postpone(item);
				} else if (res === null) { //timed out, assume released
					item.markAsFallen('Assumed released.');
					ledger.remove(item).add(new PokemonLost(item.mon, item.timestamp, 'timeout'));
				} else { //waiting for query to resolve
					item.ticksActive++;
					ledger.postpone(item);
				}
			}
		});
	})
);

RULES.push(new Rule('Cancel queries for any found Pokemon')
	.when(ledger=>ledger.has('PokemonFound').which(x=>x.miaItem.query))
	.then(ledger=>{
		ledger.get(0).forEach(x=>{
			let item = x.miaItem;
			if (item.query === true) return; //continue, do nothing
			Bot.cancelQuery(item.query, `Pokemon has been found in ${x.curr.storedIn}`);
		});
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
