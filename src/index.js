// updaterneeded
// An updater bot that polls the stream API and chat and posts updates

global.getLogger = require('./logging');
global.exeFlags = {
	dontConnect: process.argv[2] === 'noconnect',
};

////////////////////////////////////////////////////////////////////////////////

const fs = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const saveProxy = require('./save-proxy');
const UpdaterBot = require('./bot');

const LOGGER = getLogger('MAIN');

const MEMORY_FILE = path.resolve(__dirname, '../memory', 'memory.json');

////////////////////////////////////////////////////////////////////////////////

if (!process.stdout.isTTY) {
	LOGGER.warn(`Warning: starting without TTY. You may not be able to Ctrl+C.`);
}

LOGGER.info('Starting UpdaterNeeded.');

// Make the memory file if it does not exist
try {
	const MEM_PATH = path.resolve(__dirname, '../memory');
	mkdirp.sync(MEM_PATH);
	mkdirp.sync(path.join(MEM_PATH, 'api'));
	fs.writeFileSync(MEMORY_FILE, '{}', { flag:'wx'});
} catch (e) {}

let sigint = false;
process.on('SIGINT', ()=>{
	if (sigint) {
		LOGGER.fatal(`Killing UpdaterNeeded.`);
		console.error(`Killing UpdaterNeeded.`); //eslint-disable-line no-console
		process.exit(-1);
	}
	sigint = true;
	LOGGER.info(`Closing UpdaterNeeded.`);
	Bot.shutdown();
});

global.Bot = new UpdaterBot(require('../data/runs/s502-storm-silver.js'));
Bot.start();
