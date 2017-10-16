// updaterneeded
// A reddit updater bot that polls the stream API and posts updates in updater down time

const url = require("url");
const http = require("https");
const fs = require("fs");
const discord = require("discord.js");
const auth = require("./auth");
const reddit = require("./redditapi.js");
const saveproxy = require("./save-proxy");
const memoryFile = require('path').resolve(__dirname, "memory.json");

// const UPDATER = require('./updaters/s4-theta-emerald.js');
// const TEST_UPDATER = require('./updaters/test.js');

const PING_COOLDOWN = 1000*60*60; // 1 hour
const REQ_COOLDOWN = 1000*30; // 30 seconds

try { // Make the memory file if it does not exist
	fs.writeFileSync(memoryFile, "{}", { flag:'wx'});
} catch (e) {}

let access = { token:"", timeout:0 };
let memoryBank = saveproxy(memoryFile, "\t");

////////////////////////////////////////////////////////////////////////////////////////////////////

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
	autoReconnect: true,
});
dbot.on('error', (err)=> console.error('DISCORD BOT ERROR: '+err.stack));
dbot.on('warn', (err)=> console.error('DISCORD BOT WARNING: '+err));
dbot.on('ready', ()=> console.log('Discord bot has connected and is ready.'));
dbot.on('disconnect', (evt)=>{
	console.log(`Discord bot has disconnected with code ${evt.code}: ${evt.reason}. Reconnecting...`);
	try {
		let inspect = require('util').inspect;
		let info = '======= Disconnection Event =========\n';
		info += inspect(evt, { depth: null, showHidden: true, showProxy: true });
		info += '\n\n======== Bot State ========\n';
		info += inspect(dbot, { depth: null, showHidden: true, showProxy: true });
		
		let now = Date.now();
		let y = now.getFullYear();
		let m = ('00'+now.getMonth()+1).slice(-2);
		let d = ('00'+now.getDate()).slice(-2);
		let h = ('00'+now.getHours()).slice(-2);
		let min = ('00'+now.getMinutes()).slice(-2);
		let s = ('00'+now.getSeconds()).slice(-2);
		let outfile = require('path').resolve(__dirname, `disconnects/${y}${m}${d}_${h}${min}${s}.log`);
		fs.writeFile(outfile, info, 'utf8', (err)=>{
			console.log(`Wrote disconnect log with error: `, err);
		});
	} catch (e) {
		console.log(`Error writing disconnect log!: `, e);
	}
	dbot.destroy().then(()=>dbot.login(auth.discord.token));
});
dbot.on('message', (msg)=>{
	if (msg.author.id === dbot.user.id) return; //Don't rspond to own message
	if (msg.channel.id != 266878339346726913) return; //Ignore non-staff channel (note, not triple equals since id is not a 'number', but a 'snowflake')
	console.log(`Discord Message: [${msg.channel.id}|${msg.channel.id==266878339346726913}] ${msg.content}`);
	let [ type, ...args ] = require('./discordcmd.js')(msg, memoryBank);
	switch (type) {
		case 'status':
			let uptime = Math.floor(require("process").uptime());
			uptime = `${Math.floor(uptime/(60*60*24))}d ${Math.floor(uptime/(60*60))%24}h ${Math.floor(uptime/60)%60}m ${uptime%60}s`;
			let tg = "No";
			msg.channel.send(`API-less UpdaterNeeded Bot present.\nUptime: ${uptime}\nTagged In: ${tg}`).catch((e)=>console.error('Discord Error:',e));
			break;
		case 'tagin':
			if (args[0]) { // /me tags UpdaterNeeded
				msg.channel.send(`<:BibleThump:230149636520804353>`).catch((e)=>console.error('Discord Error:',e));
			} else {
				msg.channel.send(`I wish I could.`).catch((e)=>console.error('Discord Error:',e));
			}
			break;
		case 'tagout':
			// msg.channel.send(`Stopping.`).catch((e)=>console.error('Discord Error:',e));
			break;
		case 'reqUpdate':
			let update;
			switch (args[0]) {
				case 'team':
					msg.channel.send(`I don't know anything about the party, sorry.`).catch((e)=>console.error('Discord Error:',e));
					break;
			}
			break;
		case 'save-mem':
			memoryBank.forceSave();
			msg.channel.send(`Memory bank saved to disk.`).catch(e=>console.error('Discord Error:',e));
			break;
		case 'helpout':
		case 'helpout-help':
			msg.channel.send(`I cannot help, sorry.`)
				.catch((e)=>console.error('Discord Error:',e));
			break;
		case 'shutup':
			msg.channel.send(args[0]);
			break;
	}
});
dbot.login(auth.discord.token);

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

