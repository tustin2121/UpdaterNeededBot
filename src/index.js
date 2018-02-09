// updaterneeded
// An updater bot that polls the stream API and chat and posts updates

global.getLogger = require('./logging');

////////////////////////////////////////////////////////////////////////////////

const fs = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const saveProxy = require('./save-proxy');
const UpdaterBot = require('./bot');

const LOGGER = getLogger('MAIN');

const MEMORY_FILE = path.resolve(__dirname, '../memory', 'memory.json');

////////////////////////////////////////////////////////////////////////////////

LOGGER.info('Starting UpdaterNeeded.');

try { // Make the memory file if it does not exist
	mkdirp.sync(path.dirname(MEMORY_FILE));
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

global.Bot = new UpdaterBot(require('../data/runs/testing-pyrite'));
Bot.start();
