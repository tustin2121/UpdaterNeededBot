// newspress/index.js
// The heart of the update reporter system

const { Ledger } = require('./ledger');
const { typeset } = require('./typesetter');

/** A newspress system which uses the game API and chat records to generate an update. */
class UpdaterPress {
	constructor({ modconfig, memory, api, chat, game=0 }) {
		this.memory = memory;
		this.apiProducer = api;
		this.chatProducer = chat;
		this.gameIndex = game;
		
		this.lastLedger = new Ledger();
		
		this.modules = [];
		for (let modname in modconfig) {
			if (modconfig[modname] === false) continue; //disabled
			let ModClass = require(`./modules/${modname}`);
			let modmem = this.memory[`mod${game}_${modname}`];
			let mod = new ModClass(modconfig[modname], modmem)
			this.modules.push( mod );
		}
	}
	
	/** Starts a new ledger and runs an update cycle.  */
	run() {
		let ledger = new Ledger();
		let data = {
			curr_api : this.apiProducer.getInfo(this.gameIndex),
			prev_api : this.apiProducer.getPrevInfo(this.gameIndex),
			curr_chat: (this.gameIndex === 0)? this.chatProducer.getStats() : null,
		};
		
		// First Pass: Note all changes and important context into ledger items
		for (let mod of this.modules) {
			mod.firstPass(ledger, data);
		}
		
		// Second Pass: Modify the ledger items into more useful things
		let hash = ledger.hash();
		for (let i = 0; i < 10; i++) {
			for (let mod of this.modules) {
				mod.secondPass(ledger);
			}
			
			let nhash = ledger.hash();
			if (hash === nhash) break; //If the ledger hasn't changed, break
			hash = nhash;
		}
		
		for (let mod of this.modules) {
			mod.finalPass(ledger);
		}
		
		// Sort and trim all of the unimportant ledger items
		ledger.finalize();
		this.lastLedger = ledger;
		
		// Pass ledger to the TypeSetter
		let update = typeset(ledger);
		if (!update || !update.length) return null;
		
		let prefix = Bot.gameInfo(this.gameIndex).prefix || '';
		return prefix + ' ' + update;
	}
	
	/** Gets helpful items from a previous ledger. */
	runHelp(helpOpts) {
		// Generate a clone ledger
		let ledger = new Ledger(this.lastLedger);
		// And trim the ledger to only the helpful ledger items
		ledger.trimToHelpfulItems(helpOpts);
		
		// Pass ledger to the TypeSetter
		let update = typeset(ledger);
		if (!update || !update.length) return null;
		
		let prefix = Bot.gameInfo(this.gameIndex).prefix || '';
		return prefix + ' ' + update;
	}
}

/** A newspress system which uses multiple sub-presses to update a mutli-game run. */
class UpdaterPressPool {
	constructor({ numGames, modconfig, memory, api, chat }) {
		this.pool = [];
		for (let i = 0; i < numGames; i++) {
			this.pool.push(new UpdaterPress({ modconfig, memory, api, chat, game:i }));
		}
	}
	
	run() {
		let updates = [];
		for (let press of this.pool) {
			let up = press.run();
			if (up) updates.push(up);
		}
		if (!updates.length) return null;
		return updates.join('\n\n');
	}
	
	runHelp() {
		let updates = [];
		for (let press of this.pool) {
			let up = press.runHelp();
			if (up) updates.push(up);
		}
		if (!updates.length) return null;
		return updates.join('\n\n');
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

