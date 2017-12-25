// bot.js
// The definition of the main bot

const fs = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const auth = require("../.auth");
const Discord = require("discord.js");
const RedditAPI = require("./api/reddit");
const { createDebugUrl } = require('./debugxml');

const REDDIT_LIMIT = 4096;
const DISCORD_LIMIT = 2000;

const MEMORY_DIR = path.resolve(__dirname, '../memory');
const MEMORY_APPEND = path.resolve(__dirname, '../memory', 'append');
const AUTH_DIR = path.resolve(__dirname, '../.auth');

const LOGGER = getLogger('UpdaterBot');

let access = { token:"", timeout:0 };

class UpdaterBot {
	constructor(runConfig) {
		try { // Verify the run configuration is viable
			const defConfig = require('../data/runs/default');
			
			if (!runConfig.game0) throw 'Invalid config: no game0 setup!';
			for (let i = 0; true; i++) {
				let game = runConfig['game'+i];
				if (!game) break;
				
				if (typeof game.name !== 'string') throw `Invalid config: game${i} has no or invalid name!`;
				if (typeof game.base !== 'string') throw `Invalid config: game${i} has no or invalid base!`;
				if (typeof game.gen !== 'number') throw `Invalid config: game${i} has no or invalid generation!`;
				if (game.regionMap === undefined) throw `Invalid config: game${i} has no regionMap defined! Should be null or valid region!`;
				if (game.regionMap !== null) {
					try {
						require(`../data/region/${game.regionMap}`);
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
			if (runConfig.run.liveID === undefined) throw 'Invalid run config: liveID is not supplied!';
			if (runConfig.run.discordID === undefined) throw 'Invalid run config: discordID is not supplied!';
			
			runConfig.run = Object.assign({}, defConfig.run, runConfig.run);
			runConfig.modules = Object.assign({}, defConfig.modules, runConfig.modules||{});
		} catch (e) {
			throw new Error(e);
		}
		this.runConfig = runConfig;
		LOGGER.info(`Run config valid.`);
		
		// this.memory = saveProxy(MEMORY_FILE, "\t");
		this.staff = require('./control');
		
		this._updateInterval = setInterval(this.run.bind(this), this.runConfig.infoUpdateDelay);
		
		this.postUpdate(`[Meta] UpdaterNeeded started.`, { test:true });
	}
	
	/** Saves and shuts down the updater bot. */
	shutdown() {
		this.saveMemory();
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
	get taggedIn() { return this.memory.global.taggedIn; }
	set taggedIn(val) { this.memory.global.taggedIn = val; }
	
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
	postUpdate({ text, ledger, dest='tagged', embeds, debugXml }={}) {
		// TODO
		// TODO return promise
		if (!text && !ledger) throw new ReferenceError('Must supply update text!');
		let promises = [];
		let mainLive, mainDiscord, testLive, testDiscord;
		switch(dest) {
			case 'tagged':
				mainLive = mainDiscord = this.taggedIn;
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
		let debugUrl = createDebugUrl(debugUrl) || '';
		//////////////////////////////////////////
		if (mainLive) {
			let updateText = text.replace(/<info id="(\d+)">(.+?)<\/info>/ig, (match, id, txt)=>{
				let info = embeds.reddit[id];
				return `[${txt}](#info ${info})`;
			});
			updateText = `${ts} [Bot] ${updateText}`;
			promises.push(postReddit(this.runConfig.run.liveID, updateText));
		}
		if (mainDiscord) {
			let updateText = text.replace(/<info id="(\d+)">(.+?)<\/info>/ig, (match, id, txt)=>{
				if (embeds.discord.length > 1) return `${txt}[${id}]`;
				return txt;
			});
			updateText = `${ts} [Bot] ${updateText}`;
			promises.push(postDiscord(this.runConfig.run.liveID, updateText, embeds.discord));
		}
		if (testLive) {
			let updateText = text.replace(/<info id="(\d+)">(.+?)<\/info>/ig, (match, id, txt)=>{
				let info = embeds.reddit[id];
				return `[${txt}](#info ${info})`;
			});
			// if (updateText.length + )
			updateText = `${ts} [[Bot](${debugUrl})] ${updateText}`;
			promises.push(postReddit(this.runConfig.run.liveID, updateText));
		}
		if (testDiscord) {
			let updateText = text.replace(/<info id="(\d+)">(.+?)<\/info>/ig, (match, id, txt)=>{
				if (embeds.discord.length > 1) return `${txt}[${id}]`;
				return txt;
			});
			updateText = `${ts} [Bot] ${updateText}`;
			promises.push(postDiscord(this.runConfig.run.liveID, updateText, embeds.discord));
		}
		return Promise.all(promises);
		
		function postReddit(id, updateText) {
			let p;
			if (access.timeout < Date.now()) {
				let token = fs.readFileSync(path.join(AUTH_DIR, 'refresh.token'));
				p = RedditAPI.getOAuth(token, auth.reddit).then((data)=>{
					access.token = data.access_token;
					access.timeout = Date.now() + (data.expires_in * 1000);
					return access.token;
				});
			} else {
				p = Promise.resolve(access.token);
			}
			p.then((token)=>{
				return RedditAPI.postUpdate(updateText, { access_token:token, liveID:id });
			});
			return p;
		}
		function postDiscord(id, updateText, embed) {
			try {
				let dbot = this.staff.dbot;
				let p = dbot.channels.get(id)
					.send(updateText, embed);
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
	alertUpdaters(text, ping) {
		this.staff.alertUpdaters(text, ping);
	}
	/** Poses a query to the updating staff channel, who can confirm or deny the query. */
	queryUpdaters(text) {
		this.staff.queryUpdaters(text);
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
		LOGGER.info(`Memory saved.`);
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