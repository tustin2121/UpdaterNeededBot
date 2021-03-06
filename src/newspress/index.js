// newspress/index.js
// The heart of the update reporter system

const { inspect } = require("util");
const { Ledger } = require('./ledger');
const { TypeSetter } = require('./typesetter');
const EventEmitter = require('../api/events');

const LOGGER = getLogger('UpdaterPress');

/** A newspress system which uses the game API and chat records to generate an update. */
class UpdaterPress extends EventEmitter {
	constructor({ modconfig, memory, api, chat, game=0 }) {
		super();
		this.memory = memory;
		this.apiProducer = api;
		this.chatProducer = chat;
		this.gameIndex = game;
		
		this.lastLedger = new Ledger();
		this.lastUpdate = null;
		
		this.modules = [];
		for (let modname in modconfig) {
			if (modconfig[modname] === false) continue; //disabled
			let ModClass = require(`./modules/${modname}`);
			let modmem = this.memory[`mod${game}_${modname}`];
			let mod = new ModClass(modconfig[modname], modmem);
			mod.gameIndex = this.gameIndex;
			this.modules.push( mod );
		}
		this.modules.sort((a,b)=> a.priority - b.priority );
		
		this.lastLedger.loadFromMemory(this.memory['saved_ledger'+this.gameIndex]);
	}
	
	get lastUpdateId() { return this.lastLedger.log.uid; }
	
	/** Starts a new ledger and runs an update cycle.  */
	run() {
		let ledger = new Ledger();
		let data = null;
		{
			let { curr, prev, apiIndex } = this.apiProducer.popInfo(this.gameIndex);
			data = {
				curr_api: curr,
				prev_api: prev,
				curr_chat: (this.gameIndex === 0)? this.chatProducer.getStats() : null,
			};
			LOGGER.debug(`Press[${this.gameIndex}]: new api=>${(curr!==prev)}, chat=>${!!data.curr_chat}`);
			// if (curr === prev) {// && !data.curr_chat) { //TODO remove when Chat is implemented
			// 	// Skip this update cycle
			// 	this.lastUpdate = null;
			// 	return null;
			// }
			ledger.log.apiIndex(apiIndex);
		}
		
		// First Pass: Note all changes and important context into ledger items
		LOGGER.trace('First Pass');
		for (let mod of this.modules) try {
			ledger.log.moduleRun(mod);
			mod.firstPass(ledger, data);
		} catch (e) {
			LOGGER.error(`Error in ${mod.constructor.name} first pass!`, e);
			Bot.emit('updateError', e);
		}
		
		// Add postponed items from the last run, cancelling out any items from first pass as needed
		ledger.addPostponedItems(this.lastLedger);
		
		// Second Pass: Modify the ledger items into more useful things
		let hash = ledger.hash();
		for (let i = 0; i < 10; i++) {
			ledger.log.ruleRound(i);
			LOGGER.trace(`Second Pass [${i}]`);
			for (let mod of this.modules) try {
				mod.secondPass(ledger);
			} catch (e) {
				LOGGER.error(`Error in ${mod.constructor.name} second pass [${i}]!`, e);
				Bot.emit('updateError', e);
			}
			
			let nhash = ledger.hash();
			if (hash === nhash) break; //If the ledger hasn't changed, break
			if (i === 9) LOGGER.warn(`Ledger was not settled by Second Pass iteration 10!`);
			hash = nhash;
		}
		
		LOGGER.trace('Final Pass');
		for (let mod of this.modules) try {
			mod.finalPass(ledger);
		} catch (e) {
			LOGGER.error(`Error in ${mod.constructor.name} final pass!`, e);
			Bot.emit('updateError', e);
		}
		
		LOGGER.note(ledger);
		
		// Sort and trim all of the unimportant ledger items
		ledger.finalize();
		this.lastLedger = ledger;
		this.lastLedger.saveToMemory(this.memory['saved_ledger'+this.gameIndex]);
		
		// Pass ledger to the TypeSetter
		let ts = new TypeSetter({ curr_api:data.curr_api, debugLog:ledger.log, press:this });
		let update = ts.typesetLedger(ledger);
		ledger.log.finalUpdate(update);
		
		if (!update || !update.length) {
			this.lastUpdate = null;
		}
		else {
			let prefix = Bot.gameInfo(this.gameIndex).prefix || '';
			this.lastUpdate = prefix + ' ' + update;
		}
		this.emitLater('run-complete', this.lastUpdate, this.lastLedger, data);
		return this.lastUpdate;
	}
	
	/** Gets helpful items from a previous ledger. */
	runHelp(helpOpts) {
		// Generate a clone ledger
		let ledger = new Ledger(this.lastLedger);
		// And trim the ledger to only the helpful ledger items
		ledger.trimToHelpfulItems(helpOpts);
		
		let { curr } = this.apiProducer.popInfo(this.gameIndex);
		
		// Pass ledger to the TypeSetter
		let ts = new TypeSetter({ curr_api:curr, debugLog:ledger.log, press:this, helpOpts });
		let update = ts.typesetLedger(ledger);
		if (!update || !update.length) return null;
		
		let prefix = Bot.gameInfo(this.gameIndex).prefix || '';
		return prefix + ' ' + update;
	}
	
	generateUpdate(type) {
		try {
			if (type === 'team') {
				let info = this.apiProducer.getInfo(this.gameIndex);
				// LOGGER.trace(`info`,info);
				let out = [];
				for (let mon of info.party) {
					// LOGGER.trace(`mon`,mon);
					let exInfo = mon.getExtendedInfo();
					let line = `* <info ext="${exInfo}">\`${mon.name}\` (${mon.species}) ${mon.gender} L${mon.level}</info>`;
					let status = [];
					if (mon.status) status.push(mon.status);
					if (mon.hp < 100) {
						if (mon.hp === 0) status.push('fainted');
						else status.push(`${mon.hp}% health`);
					}
					if (status.length) line += ` (${status.join(', ')})`;
					out.push(line);
				}
				let prefix = (Bot.gameInfo(this.gameIndex).prefix||'');
				if (info.level_cap != 100) {
					return `${prefix}[Info] Current Party (Current level cap is ${info.level_cap}):\n\n${out.join('\n')}`;
				} else {
					return `${prefix}[Info] Current Party:\n\n${out.join('\n')}`;
				}
			}
		} catch (e) {
			LOGGER.error(`Error generating requested update!`, e);
			Bot.emit('updateError', e);
		}
		return null;
	}
	
	getRunStats(prefix) {
		let mod = this.modules.find(x=>x.constructor.name === 'RunStatsModule');
		if (!mod || !mod.produceStatsReport) return `Run stats module not loaded.`;
		return mod.produceStatsReport(prefix);
	}
}

/** A newspress system which uses multiple sub-presses to update a mutli-game run. */
class UpdaterPressPool extends EventEmitter {
	constructor({ numGames, modconfig, memory, api, chat }) {
		super();
		this.pool = [];
		for (let i = 0; i < numGames; i++) {
			this.pool.push(new UpdaterPress({ modconfig, memory, api, chat, game:i }));
		}
	}
	
	get lastUpdateId() { return this.pool.map(x=>x.lastUpdateId).join('+'); }
	
	run() {
		let updates = [];
		for (let press of this.pool) {
			let up = press.run();
			if (up) updates.push(up);
		}
		process.nextTick(()=>this.emit('run-complete'));
		if (!updates.length) return null;
		return updates.join('\n\n');
	}
	
	runHelp(helpOpts) {
		let updates = [];
		for (let press of this.pool) {
			let up = press.runHelp(helpOpts);
			if (up) updates.push(up);
		}
		if (!updates.length) return null;
		return updates.join('\n\n');
	}
	
	generateUpdate(type, game) {
		if (typeof game === 'number') {
			return this.pool[game].generateUpdate(type);
		}
		let lines = [];
		for (let press of this.pool) {
			lines.push(press.generateUpdate(type));
		}
		return lines.join('\n\n');
	}
}

module.exports = { UpdaterPress, UpdaterPressPool };

/*
- Modules work like this:
	- The API is parsed and normalized. The chat is also collected and filtered.
	- The normalized API and chat info are passed through all of the modules' first pass, where
	  the modules discover things independently of one another. As the modules discover items,
	  all of their discoveries are logged in a "ledger".
		- This ledger is a single update item, like "lost 1 [item]", and "moved to [location]".
		  Each update item has an importance, nominally 1. Items of little importance have 0, and
		  items of high importance (like gym battles) are 2.
	- This ledger is now passed through the modules again on a second pass, where modules
	  apply a list of rules to the ledger to reduce its size.
		- These rules turn simple update items into more complex update items.
		  Like "lost 1 Hard Stone" and "Onix item changed from null to Hard Stone" into
		  "Gave Onix a Hard Stone to hold". Or "lost 1 pokeball" and "in a wild battle with Aipom"
		  into "threw 1 pokeball at a wild Aipom".
		- This second pass happens multiple times, until the ledger changes size no more,
		  min 2 passes, max 10 passes.
	- This ledger is now sorted on importance and reporting order, and items with importance
	  lower than 1 are dropped.
	- This ledger goes to the Typesetter now, which turns all of the items into elequent english,
	  and will then post it to updating mediums.
		- The Typesetter will choose from a randomized list of phrases for each item type, and
		  plug in variables as needed.
		- The Typesetter is also responsible for formatting for Reddit or Discord, using rich
		  embeds for the latter case.
*/

