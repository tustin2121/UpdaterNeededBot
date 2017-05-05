// updaterneeded
// A reddit updater bot that polls the stream API and posts updates in updater down time

const url = require("url");
const http = require("https");
const fs = require("fs");
const discord = require("discord.js");
const auth = require("./auth");
const reddit = require("./redditapi.js");

const UPDATER = require('./updaters/test.js');
// const UPDATER = require('./updaters/s4-blazed-glazed.js');

const { discover } = require("./discovery.js");
const Reporter = require("./report.js");

let access = { token:"", timeout:0 };
let memoryBank = {
	//!!!!!!!!!!!!!!!!!!! TEMPORARY !!!!!!!!!!!!!!!!!!!!!!!
	// inE4Run: false,
	// e4Attempt: 0,
	// iAmABotWarning: false,
};
let data_curr, data_prev;
let sorted_curr, sorted_prev;
// let shopping_delta = {}, shopping_map = 0;
let taggedIn = false;

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
	switch (require('./discordcmd.js')(msg, memoryBank)) {
		case 'tagin':
			taggedIn = true;
			msg.channel.send(`On it.`).catch((e)=>console.error('Discord Error:',e));
			break;
		case 'tagout':
			taggedIn = false;
	}
});
dbot.login(auth.discord.token);

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
		
		if (!sorted_prev) return;
		
		console.log('Reporter reporting in...');
		let reporter = new Reporter(memoryBank, sorted_curr);
		discover(sorted_prev, sorted_curr, reporter.report.bind(reporter));
		
		let update = reporter.collate();
		if (update) {
			let ts = getTimestamp();
			console.log('UPDATE:', `${ts} [Bot] ${update}`);
			
			let liveID = (taggedIn)?UPDATER.liveID:"ysqpsvyo0yjv"; //Live or test updater
			
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
			p.then((token)=>{
				return reddit.postUpdate(`${ts} [Bot] ${update}`, { access_token:token, liveID });
			});
		} else {
			console.log('Reporter found no update.');
		}
	}).catch((e)=>{
		console.error("Error in Main:",e);
	});
}

enableInfo(true);
refreshInfo();