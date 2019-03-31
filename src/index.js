// updaterneeded
// An updater bot that polls the stream API and chat and posts updates

// Get the command line arguments, skipping the first two
const [,, RUN_START, RUN_CONFIG] = process.argv;
if (!RUN_START) {
	console.error('Must provide run start time! Exiting.');
	return;
}
if (!RUN_CONFIG) {
	console.error('Must provide run config! Exiting.');
	return;
}
if (isNaN(Number.parseInt(RUN_START, 10))) {
	console.error('Invalid run start time! Exiting.');
	return;
}
const TIME_TO_RUN = Date.now() - new Date(Number.parseInt(RUN_START, 10) * 1000).getTime();
console.log(`TIME_TO_RUN = ${Date.now()} - ${new Date(Number.parseInt(RUN_START) * 1000).getTime()} = ${TIME_TO_RUN}`)

////////////////////////////////////////////////////////////////////////////////

global.getLogger = require('./logging');
global.exeFlags = {
	dontConnect: false, //process.argv[2] === 'noconnect',
};

global.printElapsedTime = function printElapsedTime(date, milis=true) {
	if (milis) date /= 1000;
	return `${Math.floor(date/(60*60*24))}d ${Math.floor(date/(60*60))%24}h ${Math.floor(date/(60))%60}m ${Math.floor(date)%60}s`;
}

////////////////////////////////////////////////////////////////////////////////

const fs = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
// const UpdaterBot = require('./bot');

const LOGGER = getLogger('MAIN');

////////////////////////////////////////////////////////////////////////////////

if (!process.stdout.isTTY) {
	LOGGER.warn(`Warning: starting without TTY. You may not be able to Ctrl+C.`);
}

process.on('unhandledRejection', (e, p, ...args)=>{
	if (typeof e === 'string') {
		LOGGER.debug('Unhandled non-error promise rejection:\n', e, '\n', p, args);
	} else {
		LOGGER.fatal('Unhandled promise rejection!\n', e, '\n', p, args);
	}
});

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

if (TIME_TO_RUN < 0) {
	// If there's still time before the run...
	LOGGER.info(`Starting Intermission-Time UpdaterNeeded ${require('../package.json').version}.`);
	const UpdaterBot = require('./interbot');
	
	// Make the memory file if it does not exist
	try {
		const MEM_PATH = path.resolve(__dirname, '../memory-inter');
		mkdirp.sync(MEM_PATH);
		let mem = { config: require(`../data/intermission.js`) };
		fs.writeFileSync(path.join(MEM_PATH, 'memory.json'), JSON.stringify(mem), { flag:'wx'});
	} catch (e) {
		// LOGGER.error('Error writing initial MEMORY FILE! ', e);
	}
	
	global.Bot = new UpdaterBot(RUN_START*1000);
} 
else {
	LOGGER.info(`Starting Run-Time UpdaterNeeded ${require('../package.json').version}.`);
	const UpdaterBot = require('./runbot');
	
	// Make the memory file if it does not exist
	try {
		const MEM_PATH = path.resolve(__dirname, '../memory');
		mkdirp.sync(MEM_PATH);
		mkdirp.sync(path.join(MEM_PATH, 'api'));
		fs.writeFileSync(path.join(MEM_PATH, 'memory.json'), '{}', { flag:'wx'});
	} catch (e) {
		// LOGGER.error('Error writing initial MEMORY FILE! ', e);
	}
	
	global.Bot = new UpdaterBot(require(`../data/runs/${RUN_CONFIG}.js`));
	// global.Bot = new UpdaterBot(require('../data/runs/testing-pyrite'));
}
Bot.start();
