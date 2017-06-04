// updaterneeded
// A reddit updater bot that polls the stream API and posts updates in updater down time

const url = require("url");
const http = require("https");
const fs = require("fs");
const discord = require("discord.js");
const auth = require("./auth");
const reddit = require("./redditapi.js");
const Reporter = require("./reporter");
const saveproxy = require("./save-proxy");
const memoryFile = require('path').resolve(__dirname, "memory.json");

// const UPDATER = require('./updaters/test.js');
const UPDATER = require('./updaters/s4-rand-white2.js');
const TEST_UPDATER = require('./updaters/test.js');

const PING_COOLDOWN = 1000*60*60; // 1 hour
const REQ_COOLDOWN = 1000*30; // 30 seconds

// const { discover } = require("./discovery.js");
// const Reporter = require("./report.js");

try { // Make the memory file if it does not exist
	fs.writeFileSync(memoryFile, "{}", { flag:'wx'});
} catch (e) {}

let access = { token:"", timeout:0 };
let memoryBank = saveproxy(memoryFile, "\t");
let data_curr, data_prev;
let sorted_curr, sorted_prev;
let taggedIn = false;
let reporter = new Reporter(memoryBank);

////////////////////////////////////////////////////////////////////////////////////////////////////

let staffChannel = null;
let dLastPing = 0;
let dLastReq = 0;
let dbot = new discord.Client({
	disabledEvents: [ //Events we completely ignore entirely
		// 'GUILD_CREATE',
		// 'GUILD_DELETE',
		// 'GUILD_UPDATE',
		// 'GUILD_MEMBER_ADD',
		// 'GUILD_MEMBER_REMOVE',
		'MESSAGE_REACTION_ADD',
		'MESSAGE_REACTION_REMOVE',
		'MESSAGE_REACTION_REMOVE_ALL',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_SERVER_UPDATE',
		// 'RELATIONSHIP_ADD',
		// 'RELATIONSHIP_REMOVE',
	],
});
dbot.on('error', (err)=> console.error('DISCORD BOT ERROR: '+err.stack));
dbot.on('warn', (err)=> console.error('DISCORD BOT WARNING: '+err));
dbot.on('ready', ()=> console.log('Discord bot has connected and is ready.'));
dbot.on('disconnect', (evt)=>{
	console.log(`Discord bot has disconnected with code ${evt.code}: ${evt.reason}. Reconnecting...`);
	// dbot.login(auth.discord.token);
});
dbot.on('message', (msg)=>{
	if (msg.author.id === dbot.user.id) return; //Don't rspond to own message
	console.log('Discord Message:',msg.content);
	let [ type, ...args ] = require('./discordcmd.js')(msg, memoryBank);
	switch (type) {
		case 'tagin':
			if (!staffChannel) staffChannel = msg.channel;
			taggedIn = true;
			msg.channel.send(`On it.`).catch((e)=>console.error('Discord Error:',e));
			// postUpdate(`[Bot-Meta] Tagged in at ${getTimestamp()}.`, TEST_UPDATER.liveID);
			break;
		case 'tagout':
			if (taggedIn) {
				msg.channel.send(`Stopping.`).catch((e)=>console.error('Discord Error:',e));
			}
			taggedIn = false;
			// postUpdate(`[Bot-Meta] Tagged out at ${getTimestamp()}.`, TEST_UPDATER.liveID);
			break;
		case 'reqUpdate':
			console.log(`${dLastReq + REQ_COOLDOWN} < ${Date.now()}`, dLastReq + REQ_COOLDOWN < Date.now());
			if (dLastReq + REQ_COOLDOWN < Date.now()) {
				msg.channel.send(`You requested another update too quickly. Cooldown is 30 seconds due to API rate limits.`).catch((e)=>console.error('Discord Error:',e));
				break;
			}
			dLastReq = Date.now();
			let update;
			switch (args[0]) {
				case 'team': 
					update = reporter.generateUpdate('team');
					if (update) {
						msg.channel.send(`Posting [Info] update with team information to the updater.`).catch((e)=>console.error('Discord Error:',e));
						postUpdate(update, UPDATER.liveID);
					} else {
						msg.channel.send(`Unable to collate team info at this time.`).catch((e)=>console.error('Discord Error:',e));
					}
					break;
			}
			break;
		case 'reload':
			let mod = args[0];
			if (mod === 'region') mod = UPDATER.region;
			if (__reloadFile(mod)) {
				msg.channel.send(`Module '${mod}' reloaded.`).catch(e=>console.error('Discord Error:',e));
			} else {
				msg.channel.send(`Error reloading module '${mod}'!`).catch(e=>console.error('Discord Error:',e));
			}
			break;
		case 'helpout-help':
			msg.channel.send(`If you want me to help, tell me what you want me to do, and I'll post those updates to the updater myself.\n\n`
				+ `I can give [Info] about **catch**es, I can list [Info] about our **shopping** results, I can announce **item pickups**, I can announce **level ups**, and I can announce **move learns**.`)
				.catch((e)=>console.error('Discord Error:',e));
			break;
		case 'helpout':
			break;
			taggedIn = args[0];
			let help = [];
			if (help['catches']) help.push('give info about our catches');
			if (help['shopping']) help.push('list our shopping results');
			if (help['items']) help.push('announce item aquisitions');
			if (help['level']) help.push('announce level ups');
			if (help['moves']) help.push('announce move learns');
			if (help.length > 1) help[help.length-2] = "and "+help[help.length-2];
			
			msg.channel.send(`Ok, I'll ${help.join(', ')}. Don't hesistate to delete my updates if they get in the way.`).catch((e)=>console.error('Discord Error:',e));
			// The [Lvl 5 male Oddish] we caught [was nicknamed `X` and was|didn't get a nickname before being] sent to Box #5.
			// The [Lvl 10 female Rattata] we caught [was nicknamed `X`|didn't get a nickname].
			break;
	}
});
dbot.login(auth.discord.token);
reporter.alertUpdaters = function(text){
	if (!taggedIn) return;
	if (!staffChannel) return;
	
	let group = "@Live Updater ";
	if (dLastPing + PING_COOLDOWN < Date.now()) {
		group = "";
	} else {
		dLastPing = Date.now();
	}
	staffChannel.send(`${group}${text}`).catch((e)=>console.error('Discord Error:',e));;
};

function __reloadFile(modulename) {
	let path = require.resolve(modulename);
	let _oldmodule = require.cache[path];
	delete require.cache[path];
	try {
		require(modulename);
	} catch (e) {
		console.error(e);
		console.log("Failed to reload module! Attempting to revert!");
		require.cache[path] = _oldmodule;
		return false;
	}
	return true;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

let _interval = undefined;
function enableInfo(enabled) {
	if (enabled) {
		if (!_interval) {
			_interval = setInterval(refreshInfo, UPDATER.infoUpdateDelay);
			console.log('Interval set:',_interval);
		}
	} else {
		if (_interval) {
			clearInterval(_interval);
			console.log('Interval cleared:',_interval);
			_interval = undefined;
		}
	}
}

function getTimestamp(time) {
	let elapsed = ((time || Date.now()) - new Date(UPDATER.runStart*1000).getTime()) / 1000;
	let n		= (elapsed < 0)?"T-":"";
	elapsed 	= Math.abs(elapsed);
	let days    = Math.floor(elapsed / 86400);
    let hours   = Math.floor(elapsed / 3600 % 24);
    let minutes = Math.floor(elapsed / 60 % 60);
    // let seconds = Math.floor(elapsed % 60);
    
    return `${n}${days}d ${hours}h ${minutes}m`;
}

function refreshInfo() {
	console.log("Refreshing info...");
	data_prev = data_curr;
	sorted_prev = sorted_curr;
	data_curr = null;
	sorted_curr = null;
	
	new Promise((resolve, reject)=>{
		let loc = url.parse(UPDATER.infoSource);
		loc.headers = {
			'Accept': 'application/json',
		};
		http.get(loc, (res)=>{
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			
			let error;
			if (statusCode !== 200) {
				error = new Error(`Request Failed. Status Code: ${statusCode}`);
			} else if (!/^application\/json/.test(contentType)) {
				error = new Error(`Invalid content-type. Expected application/json but received ${contentType}`);
			}
			if (error) {
				console.error(error.message);
				res.resume(); // consume response data to free up memory
				return reject(error);
			}
			
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { rawData += chunk; });
			res.on('end', () => {
				try {
					resolve(JSON.parse(rawData));
				} catch (e) {
					reject(e);
				}
			});
		}).on('error', (e)=>{
			reject(e);
		});
	}).then((data)=>{
		data_curr = data;
		try {
			console.log("Parsing info...");
			sorted_curr = UPDATER.infoParse(data);
			console.log("Parsed.");
		} catch (e) {
			console.error('ERROR PARSING INFO!', e);
			return; // Cannot update this time
		}
		
		console.log('Reporter reporting in...');
		if (!reporter.discover(sorted_curr)) return;
		// let reporter = new Reporter(memoryBank, sorted_curr);
		// discover(sorted_prev, sorted_curr, reporter.report.bind(reporter));
		
		let update = reporter.collate();
		if (update) {
			let ts = getTimestamp();
			console.log('UPDATE:', `${ts} [Bot] ${update}`);
			postUpdate(`${ts} [Bot] ${update}`, TEST_UPDATER.liveID);
			
			if (taggedIn === true) {
				// Fully tagged in
				postUpdate(`${ts} [Bot] ${update}`, UPDATER.liveID);
			} else if (taggedIn) {
				// Partially tagged in, helping out with things
				update = reporter.collate(taggedIn); // Retrieve new partial update
				postUpdate(`[Info] [Bot] ${update}`, UPDATER.liveID);
			}
			reporter.clear();
		} else {
			console.log('Reporter found no update.');
		}
	}).catch((e)=>{
		console.error("Error in Main:",e);
	});
}

function postUpdate(update, liveID) {
	if (!update || !liveID) throw new ReferenceError('Must supply update text and live updater id to send it to!');
	let p;
	if (access.timeout < Date.now()) {
		let token = fs.readFileSync(__dirname+"/refresh.token", {encoding:'utf8'});
		p = reddit.getOAuth(token, auth.reddit).then((data)=>{
			access.token = data.access_token;
			access.timeout = Date.now() + (data.expires_in * 1000);
			return access.token;
		});
	} else {
		p = Promise.resolve(access.token);
	}
	return p.then((token)=>{
		return reddit.postUpdate(update, { access_token:token, liveID });
	});
}

let sigint = false;
process.on('SIGINT', ()=>{
	if (sigint) process.exit(-1);
	sigint = true;
	memoryBank.forceSave();
	postUpdate('[Meta] UpdaterNeeded shutting down.', TEST_UPDATER.liveID)
		.then(()=>process.exit());
});

enableInfo(true);
refreshInfo();
postUpdate('[Meta] UpdaterNeeded started.', TEST_UPDATER.liveID);