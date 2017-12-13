// bot.js
// The definition of the main bot

const LOGGER = getLogger('UpdaterBot');

class UpdaterBot {
	constructor(runConfig) {
		try { // Verify the run configuration is viable
			if (!runConfig.run) throw 'Invalid config: no run setup!';
			if (!runConfig.game0) throw 'Invalid config: no game0 setup!';
			if (!runConfig.modules) throw 'Invalid config: no modules list!';
			if (!runConfig.run.runStart) throw 'Invalid run config: invalid run start date!';
			if (!runConfig.run.updatePeriod) throw 'Invalid run config: invalid update period!';
			for (let i = 0; true; i++) {
				let game = runConfig['game'+i];
				if (!game) break;
				
				if (!game.gen) throw `Invalid game${i} config: no generation defined!`;
				if (!game.trainer) throw `Invalid game${i} config: no trainer info defined!`;
				game.opts = Object.assign({},
					require('../data/genopts/default'),
					require('../data/genopts/gen'+game.gen),
					game.opts || {});
				
				LOGGER.info(`Discovered game${i} in run config.`);
			}
		} catch (e) {
			throw new Error(e);
		}
		this.runConfig = runConfig;
		LOGGER.info(`Run config valid.`);
		
		this.memory = saveProxy(MEMORY_FILE, "\t");
		this.staff = require('./control');
		
		this._updateInterval = setInterval(this.run.bind(this), this.runConfig.infoUpdateDelay);
		
		this.postUpdate(`[Meta] UpdaterNeeded started.`, { test:true });
	}
	
	/** Saves and shuts down the updater bot. */
	shutdown() {
		this.memory.forceSave();
		//TODO: postUpdate('[Meta] UpdaterNeeded shutting down.', TEST_UPDATER).then(()=>process.exit());
	}
	
	/** Queries whether a given generation, game, or run option is set. */
	runOpts(opt, game=0) {
		let config = this.runConfig['game'+game];
		if (!config) throw new Error(`Could not get run option '${opt}': Invalid game index '${game}'!`);
		let val = config.opts[opt];
		if (val === undefined) throw new Error(`Could not get run option '${opt}': Invalid option!`);
		return val;
	}
	
	////////////////////////////////////////////////////////////////////////////
	
	/** If this updater is tagged in. */
	get taggedIn() { return this.memory.taggedIn; }
	set taggedIn(val) { this.memory.taggedIn = val; }
	
	/** Gets the current timestamp for this run. */
	getTimestamp(time) {
		let elapsed = ((time || Date.now()) - new Date(this.runConfig.runStart*1000).getTime()) / 1000;
		let n		= (elapsed < 0)?"T-":"";
		elapsed 	= Math.abs(elapsed);
		let days    = Math.floor(elapsed / 86400);
		let hours   = Math.floor(elapsed / 3600 % 24);
		let minutes = Math.floor(elapsed / 60 % 60);
		// let seconds = Math.floor(elapsed % 60);
		
		return `${n}${days}d ${hours}h ${minutes}m`;
	}
	
	/** Posts update to the destination updates
	 * @param text - The main text of the update. This is echoed everywhere.
	 * @param dest - Destination target: 'debug'= debug updater only, 'tagged'= both when tagged in, 
	 * 				'forced'= post to both regardless, 'main'= main updater only (used when helping)
	 * @param embeds - an object with embeds for a given type of destination (reddit/discord)
	 * @param debugXml - The packed xml for this update, posted to the debug updater
	 */
	postUpdate({ text, dest='tagged', embeds, debugXml }={}) {
		// TODO 
		// TODO return promise
	}
	postDebug(text) {
		return this.postUpdate({ text, dest='debug' });
	}
	
	////////////////////////////////////////////////////////////////////////////
	
	/** Alerts the updating staff channel, with an optional ping. */
	alertUpdaters(text, ping) {
		this.staff.alertUpdaters(text, ping);
	}
	/** Poses a query to the updating staff channel, who can confirm or deny the query. */
	queryUpdaters(text) {
		this.staff.queryUpdaters(text);
	}
	
	////////////////////////////////////////////////////////////////////////////
	
	/** Reloads memory. */
	reloadMemory() {
		this.memory.dispose();
		this.memory = saveProxy(MEMORY_FILE, "\t");
		LOGGER.info(`Reloaded Memory from disk.`);
	}
	
}