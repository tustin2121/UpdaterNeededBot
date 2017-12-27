// control/index.js
//

const LOGGER = getLogger('DISCORD');
const PING_COOLDOWN = 1000*60*60; // 1 hour
const STAFF_CHANNEL_SNOWFLAKE = 266878339346726913;

const auth = require('../../.auth');
const discord = require("discord.js");

const queryDict = {};

let staffChannel = null;
let lastPing = 0;

const generateId = (()=>{
	const ALPHA = `abcdefghijklmnopqrstuvwxyz0123456789`;
	return ()=>{
		while (true) {
			let id = '';
			for (let i = 0; i < 5; i++) {
				id += ALPHA[Math.floor(Math.random() * ALPHA.length)];
			}
			if (queryDict[id]) continue;
			return id;
		}
	};
})();


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
dbot.on('error', (err)=> LOGGER.error('BOT: '+err.stack));
dbot.on('warn', (err)=> LOGGER.warn('BOT: '+err));
dbot.on('ready', ()=>{
	LOGGER.log('Discord bot has connected and is ready.');
	staffChannel = dbot.channels.get(STAFF_CHANNEL_SNOWFLAKE);
});
dbot.on('disconnect', (evt)=>{
	LOGGER.log(`Discord bot has disconnected with code ${evt.code}: ${evt.reason}. Reconnecting...`);
	try {
		let inspect = require('util').inspect;
		let info = '======= Disconnection Event =========\n';
		info += inspect(evt, { depth: null, showHidden: true, showProxy: true });
		info += '\n\n======== Bot State ========\n';
		info += inspect(dbot, { depth: null, showHidden: true, showProxy: true });
		info += '\n\n============================\n';
		LOGGER.error(info);
		
		// let now = Date.now();
		// let y = now.getFullYear();
		// let m = ('00'+now.getMonth()+1).slice(-2);
		// let d = ('00'+now.getDate()).slice(-2);
		// let h = ('00'+now.getHours()).slice(-2);
		// let min = ('00'+now.getMinutes()).slice(-2);
		// let s = ('00'+now.getSeconds()).slice(-2);
		// let outfile = require('path').resolve(__dirname, `disconnects/${y}${m}${d}_${h}${min}${s}.log`);
		// fs.writeFile(outfile, info, 'utf8', (err)=>{
		// 	console.log(`Wrote disconnect log with error: `, err);
		// });
	} catch (e) {
		LOGGER.error(`Error writing disconnect log!: `, e);
	}
	dbot.destroy().then(()=>dbot.login(auth.discord.token));
});
dbot.on('message', (msg)=>{
	if (msg.author.id === dbot.user.id) return; //Don't rspond to own message
	if (msg.channel.id != STAFF_CHANNEL_SNOWFLAKE) return; //Ignore non-staff channel (note, not triple equals since id is not a 'number', but a 'snowflake')
	LOGGER.log(`Discord Message: [${msg.channel.id}|${msg.channel.id==STAFF_CHANNEL_SNOWFLAKE}] ${msg.content}`);
	
	require('./commands')(msg);
});

dbot.login(auth.discord.token);

module.exports = {
	dbot,
	
	alertUpdaters(text, ping=false) {
		if (Bot.taggedIn !== true) return;
		if (!staffChannel) return;
		
		let group = '';
		if (ping) {
			if (lastPing + PING_COOLDOWN < Date.now()) {
				group = "<@&148087914360864768> ";
			} else {
				lastPing = Date.now();
			}
		}
		staffChannel
			.send(`${group}${text}`)
			.catch((e)=>LOGGER.error('Discord Error:',e));
	},
	
	queryUpdaters(text) {
		if (Bot.taggedIn !== true) return Promise.reject();
		if (!staffChannel) return Promise.reject();
		
		let resolve, reject, id = generateId();
		text = text.replace(/#####/gi, id);
		let p = new Promise((res, rej)=>{
			resolve = res;
			reject = rej;
		}).then((val)=>{
			delete queryDict[id];
			return val;
		}, (val)=>{
			delete queryDict[id];
			return val;
		});
		
		p.id = id;
		p.confirm = function(){ resolve(true); };
		p.deny = function(){ resolve(false); };
		p.cancel = function(){ resolve(null); };
		p.timeout = function() { resolve(null); };
		queryDict[id] = p;
		
		p.msg = staffChannel.send(text).catch((e)=>{
			reject();
			LOGGER.error('Discord Error:',e);
		});
		
		return p;
	},
	getQuery(id) { return queryDict[id]; },
	
	reconnect() {
		dbot.destroy().then(()=>dbot.login(auth.discord.token));
	},
};