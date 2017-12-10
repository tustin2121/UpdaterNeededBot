// updaterneeded
// An updater bot that polls the stream API and chat and posts updates

global.getLogger = require('./logging');

////////////////////////////////////////////////////////////////////////////////

const fs = require("fs");
const path = require('path');
const saveProxy = require('./save-proxy');

const LOGGER = getLogger('MAIN');

const MEMORY_FILE = path.resolve(__dirname, '../memory', 'memory.json');

////////////////////////////////////////////////////////////////////////////////

LOGGER.info('Starting UpdaterNeeded.');

try { // Make the memory file if it does not exist
	fs.mkdirSync(path.dirname(MEMORY_FILE));
	fs.writeFileSync(MEMORY_FILE, '{}', { flag:'wx'});
} catch (e) {}

let sigint = false;
process.on('SIGINT', ()=>{
	if (sigint) {
		LOGGER.fatal(`Killing UpdaterNeeded.`);
		process.exit(-1);
	}
	sigint = true;
	LOGGER.info(`Closing UpdaterNeeded.`);
	Bot.shutdown();
});

////////////////////////////////////////////////////////////////////////////////

class UpdaterBot {
	constructor() {
		this.memory = saveProxy(MEMORY_FILE, "\t");
		this.staff = require('./control');
		
		this.postUpdate(`[Meta] UpdaterNeeded started.`, { test:true });
	}
	
	get taggedIn() { return this.memory.taggedIn; }
	set taggedIn(val) { this.memory.taggedIn = val; }
	
	
	alertUpdaters(text, ping) {
		this.staff.alertUpdaters(text, ping);
	}
	
	getTimestamp(time) {
		let elapsed = ((time || Date.now()) - new Date(UPDATER.runStart*1000).getTime()) / 1000;
		let n		= (elapsed < 0)?"T-":"";
		elapsed 	= Math.abs(elapsed);
		let days    = Math.floor(elapsed / 86400);
	    let hours   = Math.floor(elapsed / 3600 % 24);
	    let minutes = Math.floor(elapsed / 60 % 60);
	    // let seconds = Math.floor(elapsed % 60);
	    
	    return `${n}${days}d ${hours}h ${minutes}m`;
	}
	
	reloadMemory() {
		this.memory.dispose();
		this.memory = saveProxy(MEMORY_FILE, "\t");
		LOGGER.info(`Reloaded Memory from disk.`);
	}
	shutdown() {
		this.memory.forceSave();
	}
}

global.Bot = new UpdaterBot();

