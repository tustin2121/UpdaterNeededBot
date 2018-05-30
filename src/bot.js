// bot.js
// The definition of the main bot

const fs = require("fs");
const path = require('path');
const auth = require('../.auth');
const EventEmitter = require('./api/events');

const RedditAPI = require("./api/reddit");
const StreamAPI = require("./api/stream");
const ChatAPI = require("./api/chat");
const WebServer = require("./webserv");
const { createDebugUrl } = require('./debug/xml');
const { UpdaterPressPool } = require('./newspress');
const { formatFor } = require('./newspress/typesetter');

const REDDIT_LIMIT = 4096;
const DISCORD_LIMIT = 2000;

const MEMORY_DIR = path.resolve(__dirname, '../memory');
const MEMORY_APPEND = path.resolve(__dirname, '../memory', 'append');
const AUTH_DIR = path.resolve(__dirname, '../.auth');

const LOGGER = getLogger('UpdaterBot');

let access = { token:"", timeout:0 };

class UpdaterBot extends EventEmitter {
	constructor(runConfig) {
		if (!runConfig) throw new Error('No run config provided!');
		try { // Verify the run configuration is viable
			const defConfig = require('../data/runs/default');
			
			if (!runConfig.game0) throw 'Invalid config: no game0 setup!';
			let i = 0;
			for (i = 0; true; i++) {
				let game = runConfig['game'+i];
				if (!game) break;
				
				if (typeof game.name !== 'string') throw `Invalid config: game${i} has no or invalid name!`;
				if (typeof game.base !== 'string') throw `Invalid config: game${i} has no or invalid base!`;
				if (typeof game.gen !== 'number') throw `Invalid config: game${i} has no or invalid generation!`;
				if (game.regionMap === undefined) throw `Invalid config: game${i} has no regionMap defined! Should be null or valid region!`;
				if (game.regionMap !== null) {
					try {
						const { MapRegion } = require('./api/mapnode');
						game.regionMap = new MapRegion(require(`../data/region/${game.regionMap}.json`));
					} catch (e) {
						throw `Invalid config: game${i} requires an invalid region map!`;
					}
				}
				if (!game.trainer) throw `Invalid config: game${i} must provide trainer id and secret in an object!`;
				if (typeof game.trainer.id !== 'number') throw `Invalid config: game${i}'s trainer has trainer id!`;
				if (typeof game.trainer.secret !== 'number') throw `Invalid config: game${i}'s trainer has secret id!`;
				game.opts = Object.assign({},
					require('../data/genopts/default'),
					require('../data/genopts/gen'+game.gen),
					game.opts || {});
				
				if (game.opts['trainerClasses']) {
					let trc = {};
					for (let cl in game.opts['trainerClasses']) {
						let set = {};
						for (let id of game.opts['trainerClasses'][cl]) {
							set[id] = true;
						}
						trc[cl] = set;
					}
					game.opts['trainerClasses'] = trc;
				}
				
				LOGGER.info(`Discovered game${i} in run config.`);
			}
			
			if (!runConfig.run) throw 'Invalid config: no run setup!';
			if (typeof runConfig.run.runStart !== 'number') throw 'Invalid run config: invalid run start date! Must be a unix timestamp!';
			
			runConfig.run = Object.assign({}, defConfig.run, runConfig.run);
			runConfig.modules = Object.assign({}, defConfig.modules, runConfig.modules||{});
			runConfig.numGames = i;
		} catch (e) {
			throw new Error(e);
		}
		super();
		this.runConfig = runConfig;
		LOGGER.info(`Run config valid.`);
		
		this.loadMemory();
		
		// Ensure these memory regions exist
		this.memory.global;
		this.memory.runFlags;
		
		this.staff = null;
		this.streamApi = null;
		this.chatApi = null;
		this.press = null;
		this._updateInterval = null;
		
		this.on('error', (e)=>LOGGER.error('Error event!', e));
	}
	
	start() {
		this.staff = require('./control');
		this.streamApi = new StreamAPI({
			url: this.runConfig.run.apiSrc,
			updatePeriod: this.runConfig.run.apiPollPeriod,
			memory: this.memory.api_stream,
		});
		this.chatApi = new ChatAPI({
			url: this.runConfig.run.chatSrc,
			channels: this.runConfig.run.chatChannel,
			memory: this.memory.api_chat,
		});
		this.press = new UpdaterPressPool({
			numGames : this.runConfig.numGames,
			modconfig: this.runConfig.modules,
			memory: this.memory,
			api: this.streamApi,
			chat: this.chatApi,
		});
		this.webserver = new WebServer();
		this.webserver.connect();
		
		Promise.all([
			this.staff.isReady(),
			this.streamApi.isReady(),
			this.chatApi.isReady(),
		]).then(()=>{
			if (!global.exeFlags.dontConnect)
				this._updateInterval = setInterval(this.run.bind(this), this.runConfig.run.updatePeriod);
			LOGGER.info(`UpdaterNeeded startup complete. Update interval: ${this.runConfig.run.updatePeriod/1000} sec.`);
			this.postDebug(`[Meta] UpdaterNeeded started.`);
			if (Bot.memory.global.rebootRequested) {
				delete Bot.memory.global.rebootRequested;
				this.staff.alertUpdaters(`Reboot successful.`, { bypassTagCheck:true });
			}
		}).catch(ex=>{
			LOGGER.fatal(ex);
		});
	}
	
	/** Saves and shuts down the updater bot. */
	shutdown() {
		clearInterval(this._updateInterval);
		this._updateInterval = null;
		this.emit('shutdown');
		
		this.saveMemory();
		this.postDebug('[Meta] UpdaterNeeded shutting down.')
			.then(()=>getLogger.shutdown)
			.then(()=>process.exit());
			//TODO Figure out why the postDebug() promise is resolving before it should!
	}
	
	/** Queries whether a given generation, game, or run option is set. */
	runOpts(opt, game=0) {
		let config = this.runConfig['game'+game];
		if (!config) throw new Error(`Could not get run option '${opt}': Invalid game index '${game}'!`);
		let val = config.opts[opt];
		if (val === undefined) throw new Error(`Could not get run option '${opt}': Invalid option!`);
		return val;
	}
	
	/** Queries whether a given run flag is enabled. Run flags are different from run options because
	 *  they are kept in memory and can be turned on and off without restarting the bot. */
	runFlag(flag, def) {
		let val = this.memory.runFlags[flag];
		if (val === undefined) val = def;
		return !!val;
	}
	
	/** Gets the game configuration for the given game. */
	gameInfo(game=0) {
		let config = this.runConfig['game'+game];
		if (!config) throw new Error(`Could not get game config for game '${game}': Invalid game index '${game}'!`);
		return config;
	}
	
	/**
	 * Gets the game indexes referred to by a given word. This method matches the word to
	 * the game name match regexes provided by the game configs. If nothing matches,
	 * returns an empty array.
	 */
	gameWordMatch(word) {
		if (!word) return [];
		let games = [];
		for (let i = 0; i < this.runConfig.numGames; i++) {
			let match = this.runConfig['game'+i].nameMatch;
			if (!match) continue;
			if (match.test(word)) games.push(i);
		}
		return games;
	}
	
	get numGames() { return this.runConfig.numGames; }
	
	////////////////////////////////////////////////////////////////////////////
	
	/**
	 * The heart of UpdaterNeeded. This is the update cycle, which runs every X seconds, defined in
	 * the run config. This loop is what creates the ledger and runs through all of the modules, and
	 * then posts the update at the end of it, if there is an update to post.
	 */
	run() {
		LOGGER.note(`============ Update Cycle ${this.getTimestamp()} ============`);
		this.emit('pre-update-cycle');
		LOGGER.trace(`Update cycle starting.`);
		try {
			let update = this.press.run();
			if (update) {
				this.postUpdate({ text:update, });
				
				if (this.isHelping) {
					update = this.press.runHelp(this.taggedIn);
					if (update) this.postUpdate({ text:update, dest:'main' });
				}
				else if (typeof this.taggedIn === 'number') { //tagged in for one game only
					update = this.press.pool[this.taggedIn].lastUpdate;
					if (update) this.postUpdate({ text:update, dest:'main' });
				}
			}
			
			LOGGER.trace(`Update cycle complete.`);
		} catch (e) {
			LOGGER.fatal(`Unhandled error in update cycle!`, e);
		}
		this.emit('post-update-cycle');
		this.saveMemory();
	}
	
	generateUpdate(type, game) {
		return this.press.generateUpdate(type, game);
	}
	
	////////////////////////////////////////////////////////////////////////////
	
	/** If this updater is tagged in. */
	get taggedIn() { return this.memory.global.taggedIn; }
	set taggedIn(val) {
		this.memory.global.taggedIn = val;
		this.memory.global.lastTagChange = Date.now();
		this.emit('tagged', val);
	}
	
	/** If this update is helping. */
	get isHelping() {
		// We're helping when we're partially tagged in, ie a truthy value that is not true.
		return this.memory.global.taggedIn && typeof this.memory.global.taggedIn === 'object';
	}
	
	get lastApiDisturbance() { return this.memory.global.lastApiDisturbance; }
	set lastApiDisturbance(val) {
		if (typeof val !== 'number' && !Number.isFinite(val)) return;
		this.memory.global.lastApiDisturbance = Math.max(this.memory.global.lastApiDisturbance, val);
	}
	
	/** Gets the current timestamp for this run. */
	getTimestamp({ time, padded=false, compact=false }={}) {
		let elapsed = ((time || Date.now()) - new Date(this.runConfig.run.runStart*1000).getTime()) / 1000;
		let n		= (elapsed < 0)?"T-":"";
		elapsed 	= Math.abs(elapsed);
		let days    = Math.floor(elapsed / 86400);
		let hours   = Math.floor(elapsed / 3600 % 24);
		let min		= Math.floor(elapsed / 60 % 60);
		let sec 	= Math.floor(elapsed % 60);
		
		if (padded) {
			days = `00${days}`.slice(-2);
			hours = `00${hours}`.slice(-2);
			min = `00${min}`.slice(-2);
			sec = `00${sec}`.slice(-2);
		}
		let out = `${n}${days}d ${hours}h ${min}m`;
		if (compact) {
			out = `${n}${days}d${hours}h${min}m${sec}s`;
		}
		return out;
	}
	
	/** Posts update to the destination updates
	 * @param text - The main text of the update. This is echoed everywhere.
	 * @param dest - Destination target: 'debug'= debug updater only, 'tagged'= both when tagged in,
	 * 				'forced'= post to both regardless, 'main'= main updater only (used when helping)
	 * @param extras - an object with extra information to embed in the update
	 * @param debugXml - The packed xml for this update, posted to the debug updater
	 */
	postUpdate({ text, dest='tagged', debugXml }={}) {
		if (!text) throw new ReferenceError('Must supply update text!');
		LOGGER.info(`Update [=>${dest}]: ${text}`);
		let promises = [];
		let mainLive, mainDiscord, testLive, testDiscord;
		switch(dest) {
			case 'tagged':
				mainLive = mainDiscord = (this.taggedIn === true);
				testLive = testDiscord = true;
				break;
			case 'forced':
				mainLive = mainDiscord = true;
				testLive = testDiscord = true;
				break;
			case 'debug':
				mainLive = mainDiscord = false;
				testLive = testDiscord = true;
				break;
			case 'main':
				mainLive = mainDiscord = true;
				testLive = testDiscord = false;
				break;
		}
		let ts = this.getTimestamp();
		let debugUrl = `https://u.tppleague.me/u/${this.press.lastUpdateId}`; //createDebugUrl(debugXml) || '';
		//////////////////////////////////////////
		if (mainLive && this.runConfig.run.liveID) {
			let update = formatFor.reddit(text);
			let updateText = `${ts} [Bot] ${update.text}`;
			promises.push(
				postReddit.call(this, this.runConfig.run.liveID, updateText)
				.catch(e=>LOGGER.error('Post to Updater Failed:', e)));
				//If we don't catch individually, Promise.all returns early
		}
		if (mainDiscord && this.runConfig.run.discordID) {
			let update = formatFor.discord(text);
			let updateText = `${ts} [Bot] ${update.text}`;
			promises.push(
				postDiscord.call(this, this.runConfig.run.discordID, updateText, update.embeds)
				.catch(e=>LOGGER.error('Post to Discord Failed:', e)));
		}
		if (testLive && this.runConfig.run.testLiveID) {
			let update = formatFor.reddit(text);
			// if (updateText.length + )
			let updateText = `${ts} [[Bot](${debugUrl})] ${update.text}`;
			promises.push(
				postReddit.call(this, this.runConfig.run.testLiveID, updateText)
				.catch(e=>LOGGER.error('Post to Test Updater Failed:', e)));
		}
		if (testDiscord && this.runConfig.run.testDiscordID) {
			let update = formatFor.discord(text);
			let updateText = `${ts} [Bot] ${update.text}`;
			promises.push(
				postDiscord.call(this, this.runConfig.run.testDiscordID, updateText, update.embeds)
				.catch(e=>LOGGER.error('Post to Test Discord Failed:', e)));
		}
		this.emit('update', text, ts, dest);
		return Promise.all(promises);
		
		function postReddit(id, updateText) {
			let p;
			if (access.timeout < Date.now()) {
				let token;
				try {
					token = fs.readFileSync(path.join(AUTH_DIR, 'refresh.token'));
				} catch (e) {
					if (e.code === 'ENOENT') token = undefined;
				}
				p = RedditAPI.getOAuth(token, auth.reddit).then((data)=>{
					access.token = data.access_token;
					access.timeout = Date.now() + (data.expires_in * 1000);
					return access.token;
				});
			} else {
				p = Promise.resolve(access.token);
			}
			p = p.then((token)=>{
				return RedditAPI.postUpdate(updateText, { access_token:token, liveID:id });
			});
			return p;
		}
		function postDiscord(id, updateText, embed) {
			try {
				let dbot = this.staff.dbot;
				let channel = dbot.channels.get(id);
				if (!channel) throw new ReferenceError(`Channel [${id}] does not exist!`);
				if (embed.length)
					embed = { embed: { fields: embed } };
				else
					embed = {};
				let p = channel.send(updateText, embed);
				return p;
			} catch (e) {
				return Promise.reject(e);
			}
		}
	}
	postDebug(text) {
		return this.postUpdate({ text, dest:'debug' });
	}
	
	////////////////////////////////////////////////////////////////////////////
	
	/** Alerts the updating staff channel, with an optional ping. */
	alertUpdaters(text, opts) {
		return this.staff.alertUpdaters(text, opts);
	}
	/** Poses a query to the updating staff channel, who can confirm or deny the query. */
	queryUpdaters(text, opts) {
		return this.staff.queryUpdaters(text, opts);
	}
	
	////////////////////////////////////////////////////////////////////////////
	
	/** Loads the memory file from disk. Used at startup. */
	loadMemory() {
		this.__mem = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'memory.json'), {encoding:'utf8'}));
		let proxy = new Proxy(this.__mem, {
			get: (target, key)=>{
				if (target[key] === undefined) {
					target[key] = {};
				}
				return target[key];
			},
			set: ()=>{
				throw new Error('Do not set values directly to main memory!');
			},
		});
		this.memory = proxy;
		LOGGER.info(`Memory loaded.`);
	}
	
	/** Saves the memory file to disk. Used after every update. */
	saveMemory() {
		fs.writeFileSync(path.join(MEMORY_DIR, 'memory.json'), JSON.stringify(this.__mem, null, '\t'));
		LOGGER.debug(`Memory saved.`);
	}
	
	/** Loads the memory append file from disk and merges it into working memory. */
	mergeMemory() {
		try {
			let append = require(MEMORY_APPEND);
			delete require.cache[require.resolve(MEMORY_APPEND)];
			
			for (let pkey in append) {
				let sub = append[pkey];
				if (typeof sub === 'object' && this.__mem[pkey]) {
					for (let key in sub) {
						this.__mem[pkey][key] = sub[key]
					}
				}
			}
			LOGGER.info(`Memory merged from memappend.js successfully.`);
		} catch (e) {
			LOGGER.error(`Unable to merge memory:`, e);
		}
	}
	
}
module.exports = UpdaterBot;