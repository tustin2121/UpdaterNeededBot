// bot.js
// The base class for both run and intermission bots

/* global getLogger */
const fs = require("fs");
const path = require('path');
const EventEmitter = require('./api/events');

const LOGGER = getLogger('UpdaterBot');

class UpdaterBot extends EventEmitter {
	constructor(memoryDir) {
		super();
		
		this.__memDir = memoryDir;
		this.loadMemory();
		// Ensure these memory regions exist
		this.memory.global;
		
		this.staff = null;
		
		this.on('error', (e)=>LOGGER.error('Error event!', e));
	}
	
	start() {
		this.staff = require('./control');
		
		this.staff.isReady().then(()=>{
			LOGGER.info(`UpdaterNeeded startup complete.`);
			if (this.memory.global.rebootRequested) {
				delete this.memory.global.rebootRequested;
				this.staff.alertUpdaters(`Reboot successful.`, { bypassTagCheck:true });
			}
			this.emit('bot-ready');
		}).catch(ex=>{
			LOGGER.fatal(ex);
		});
		
		this.alertUpdaters = this.staff.alertUpdaters;
		this.queryUpdaters = this.staff.queryUpdaters;
		this.requestQuery = this.staff.requestQuery;
		this.checkQuery = this.staff.checkQuery;
		this.cancelQuery = this.staff.cancelQuery;
	}
	
	/** Saves and shuts down the updater bot. */
	shutdown() {
		if (this._updateInterval) {
			clearInterval(this._updateInterval);
			this._updateInterval = null;
		}
		this.emit('shutdown');
		
		this.saveMemory();
		getLogger.shutdown()
			.then(()=>process.exit());
		//TODO Figure out why the postDebug() promise is resolving before it should!
	}
	
	getStatusString() {
		let uptime = printElapsedTime(Math.floor(require("process").uptime()), false);
		let version = require('../package.json').version;
		return `undefined-Time UpdaterNeeded Bot ${version} present.\nUptime: ${uptime}`;
	}
	
	////////////////////////////////////////////////////////////////////////////
	// Stub methods
	
	runOpt(){ return false; }
	runFlag(){ return false; }
	gameInfo(){ return false; }
	
	////////////////////////////////////////////////////////////////////////////
	
	/** Loads the memory file from disk. Used at startup. */
	loadMemory() {
		this.__mem = JSON.parse(fs.readFileSync(path.join(this.__memDir, 'memory.json'), {encoding:'utf8'}));
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
		fs.writeFileSync(path.join(this.__memDir, 'memory.json'), JSON.stringify(this.__mem, null, '\t'));
		LOGGER.debug(`Memory saved.`);
	}
	
	/** Loads the memory append file from disk and merges it into working memory. */
	mergeMemory() {
		const MEMORY_APPEND = path.resolve(this.__memDir, 'append');
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
UpdaterBot.prototype.runFlags = UpdaterBot.prototype.runFlag; //alias
UpdaterBot.prototype.runOpts = UpdaterBot.prototype.runOpt; //alias
module.exports = UpdaterBot;
