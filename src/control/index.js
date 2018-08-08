// control/index.js
//
/* globals getLogger, Bot */
const LOGGER = getLogger('Discord');
const ERR = (e)=>LOGGER.error('Discord Error:',e);

const EMOJI_CONFIRM = '\u2705'; //':white_check_mark:';
const EMOJI_DENY = '\u274E'; //':negative_squared_cross_mark:';

const PING_COOLDOWN = 1000*60*60; // 1 hour
// const STAFF_CHANNEL_SNOWFLAKE = 266878339346726913; //staff channel
// const STAFF_CHANNEL_SNOWFLAKE = "412122002162188289"; //test channel

const auth = require('../../.auth');
const discord = require("discord.js");

const queryDict = {};

let staffChannel = null;
let lastPing = 0;

/** Generates a random 5-character alphanumeric id. Entropy of 36^5 */
const generateId = ()=>Math.floor(Math.random()*Math.pow(36,5)).toString(36);

let dbot = new discord.Client({
	disabledEvents: [ //Events we completely ignore entirely
		// 'GUILD_CREATE',
		// 'GUILD_DELETE',
		// 'GUILD_UPDATE',
		// 'GUILD_MEMBER_ADD',
		// 'GUILD_MEMBER_REMOVE',
		// 'MESSAGE_REACTION_ADD',
		// 'MESSAGE_REACTION_REMOVE',
		// 'MESSAGE_REACTION_REMOVE_ALL',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_SERVER_UPDATE',
		// 'RELATIONSHIP_ADD',
		// 'RELATIONSHIP_REMOVE',
	],
	autoReconnect: true,
});
dbot.on('error', (err)=> LOGGER.error('BOT: ', err));
dbot.on('warn', (err)=> LOGGER.warn('BOT: ', err));
dbot.on('ready', ()=>{
	LOGGER.log('Discord bot has connected and is ready.');
	staffChannel = dbot.channels.get(Bot.runConfig.run.controlChannel);
	// staffChannel = dbot.channels.get(STAFF_CHANNEL_SNOWFLAKE);
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
		LOGGER.fatal(`Error writing disconnect log!: `, e);
	}
	dbot.destroy().then(()=>dbot.login(auth.discord.token));
});
dbot.on('message', (msg)=>{
	if (msg.author.id === dbot.user.id) return; //Don't rspond to own message
	if (msg.channel.id != Bot.runConfig.run.controlChannel) return; //Ignore non-staff channel (note, not triple equals since id is not a 'number', but a 'snowflake')
	LOGGER.debug(`Discord Message: ${msg.content}`);
	
	try {
		require('./commands')(msg);
	} catch (e) {
		LOGGER.fatal('Error processing Discord command!', e);
		msg.channel.send(':dizzy_face: Ow! Error processing command!').catch(ERR);
	}
});

const offActivities = [
	['tiddilywinks with sewer lids', { type:'PLAYING' }],
	['the PC beep', { type:'LISTENING' }],
	['Netflix', { type:'WATCHING' }],
	['Super Mario Odyssey', { type:'PLAYING' }],
	[`the sounds of a summer's night`, { type:'LISTENING' }],
	[`Twitter explode over something menial`, { type:'WATCHING' }],
];

Bot.on('tagged', ()=>{
	let status = (!!Bot.taggedIn)?'online':'idle';
	dbot.user.setStatus(status).catch(ERR);
	if (Bot.taggedIn) {
		dbot.user.setActivity('the stream', { type:'WATCHING', url:'http://www.twitch.tv/twitchplayspokemon' }).catch(ERR);
	} else {
		let activity = offActivities[Math.floor(Math.random()*offActivities.length)];
		dbot.user.setActivity(...activity).catch(ERR);
	}
});
Bot.on('pre-update-cycle', ()=>{
	let status = (!!Bot.taggedIn)?'online':'idle';
	dbot.user.setStatus(status).catch(ERR);
});
Bot.on('updateError', ()=>{
	dbot.user.setStatus('dnd').catch(ERR);
});


function listenForQueryUpdate(query) {
	Bot.once('query'+query.id, (res, user)=>{
		query.result = res;
		staffChannel.fetchMessage(query.msgId).then(msg=>{
			if (res === true) msg.edit(`~~${query.text}~~\n[Query confirmed by ${user}]`);
			else if (res === false) msg.edit(`~~${query.text}~~\n[Query denied by ${user}]`);
			else if (res === null) msg.edit(`~~${query.text}~~\n[Query timed out]`);
			else if (typeof res === 'string') msg.edit(`~~${query.text}~~\n[Query canceled: ${res}]`);
		}).catch(ERR);
	});
}

for (let id in Bot.memory.queries) {
	listenForQueryUpdate(Bot.memory.queries[id]);
}

let loggedIn;
if (!global.exeFlags.dontConnect)
	loggedIn = dbot.login(auth.discord.token);

module.exports = {
	dbot,
	isReady() { return loggedIn; },
	
	alertUpdaters(text, { ping=false, bypassTagCheck=false, reuseId }={}) {
		if (!bypassTagCheck && Bot.taggedIn !== true) return Promise.reject();
		if (!staffChannel) return Promise.reject();
		
		let group = '';
		if (ping) {
			if (lastPing + PING_COOLDOWN < Date.now()) {
				group = "<@&148087914360864768> ";
			}
			lastPing = Date.now();
		}
		
		if (reuseId) {
			return staffChannel.fetchMessage(reuseId).then(m=>{
				m.edit(`${group}${text}`);
			}).catch(ERR);
		}
		return staffChannel
			.send(`${group}${text}`).catch(ERR);
	},
	
	queryUpdaters(text, { timeout, bypassTagCheck=false }={}) {
		if (Bot.taggedIn !== true) return false;
		if (!staffChannel) return false;
		if (!timeout) timeout = 1000 * 60 * 5; //5 minutes
		let id = generateId();
		
		text = text.replace(/\{\{confirm\}\}/gi, '`updater, confirm '+id+'`');
		text = text.replace(/\{\{deny\}\}/gi, '`updater, deny '+id+'`');
		let query = Bot.memory.queries[id] = {
			id, text, msgId: null, 
			expiresAt: Date.now() + timeout,
			result: undefined,
		};
		let minLeft = Math.ceil((query.expiresAt - Date.now()) / (60 * 1000));
		
		staffChannel
			.send(`${text}\n[Query expires in ${minLeft} minutes]`)
			.then(msg=> query.msgId=msg.id )
			.catch(ERR);
		
		listenForQueryUpdate(query);
		return id;
	},
	checkQuery(id) {
		let query = Bot.memory.queries[id];
		if (!query) return null; //no query for the given id - assume it has been timed out
		if (query.result !== undefined) {
			delete Bot.memory.queries[id];
			return query.result;
		}
		if (Date.now() > query.expiresAt) { //query expired
			Bot.emit('query'+id, null);
			delete Bot.memory.queries[id];
			return null;
		}
		let minLeft = Math.ceil((query.expiresAt - Date.now()) / (60 * 1000));
		
		if (!query.msgId) { //the message didn't send? attempt to send the query again
			staffChannel
				.send(`${query.text}\n[Query expires in ${minLeft} minutes]`)
				.then(msg=> query.msgId=msg.id )
				.catch(ERR);
		} else {
			staffChannel.fetchMessage(query.msgId).then(msg=>{
				msg.edit(`${query.text}\n[Query expires in ${minLeft} minutes]`);
			});
		}
	},
	cancelQuery(id, reason) {
		if (typeof reason !== 'string') throw new TypeError('Must give a string reason for cancelling a query!');
		let query = Bot.memory.queries[id];
		if (!query) return;
		Bot.emit('query'+id, reason);
		delete Bot.memory.queries[id];
	},
	
	reconnect() {
		dbot.destroy().then(()=>dbot.login(auth.discord.token));
	},
};