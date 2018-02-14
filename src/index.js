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

global.Bot = new UpdaterBot(require('../data/runs/s501-dual-gen1'));
Bot.start();

//*
setTimeout(()=>{
	Bot.queryUpdaters("This is a test query. Please confirm or deny this query by using the buttons below.")
	.then(({ res, msg })=>{
		let result;
		if (res === true) {
			result = 'confirmed';
		} else if (res === false) {
			result = 'denied';
		} else {
			result = 'ignored';
		}
		msg.edit(`~~${msg.content}~~ This query has been ${result}. Thank you for participating in this test.`).catch((e)=>LOGGER.error(e));
	});
}, 10*1000); //*/