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
	LOGGER.info('Discord bot has connected and is ready.');
	if (Bot.runConfig) {
		staffChannel = dbot.channels.get(Bot.runConfig.run.controlChannel);
	} else {
		staffChannel = dbot.channels.get(Bot.memory.config.controlChannel);
	}
	// staffChannel = dbot.channels.get(STAFF_CHANNEL_SNOWFLAKE);
});
dbot.on('disconnect', (evt)=>{
	LOGGER.info(`Discord bot has disconnected with code ${evt.code}: ${evt.reason}. Reconnecting...`);
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
	//Ignore non-staff channel (note, not triple equals since id is not a 'number', but a 'snowflake')
	if (Bot.runConfig) {
		if (msg.channel.id != Bot.runConfig.run.controlChannel) return; 
	} else {
		if (msg.channel.id != Bot.memory.config.controlChannel) return; 
	}
	
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
	['Breath of the Wild', { type:'PLAYING' }],
	['Wind Waker', { type:'PLAYING' }],
	['Super Smash Bros Ultimate', { type:'PLAYING' }],
	
	['the PC beep', { type:'LISTENING' }],
	[`the sounds of a summer's night`, { type:'LISTENING' }],
	
	['Netflix', { type:'WATCHING' }],
	[`Twitter explode over something menial`, { type:'WATCHING' }],
	[`YouTube videos`, { type:'WATCHING' }],
	[`the Pokemon Anime`, { type:'WATCHING' }],
];
let lastActivity = null;

function setDiscordStatus({ status, activity }) {
	if (status in {'online':1, 'idle':1, 'dnd':1}) {
		dbot.user.setStatus(status).catch(ERR);
	}
	if (activity) {
		dbot.user.setActivity(...activity).catch(ERR);
	}
}

function updateDiscordStatus() {
	let status = (!!Bot.taggedIn)?'online':'idle';
	dbot.user.setStatus(status).catch(ERR);
	if (Bot.taggedIn) {
		lastActivity = ['the stream', { type:'WATCHING', url:'http://www.twitch.tv/twitchplayspokemon' }];
		dbot.user.setActivity(...lastActivity).catch(ERR);
	} else {
		lastActivity = offActivities[Math.floor(Math.random()*offActivities.length)];
		dbot.user.setActivity(...lastActivity).catch(ERR);
	}
}

Bot.on('tagged', updateDiscordStatus);
Bot.on('bot-ready', updateDiscordStatus);

Bot.on('pre-update-cycle', ()=>{
	let status = (!!Bot.taggedIn)?'online':'idle';
	dbot.user.setStatus(status).catch(ERR);
	dbot.user.setActivity(...lastActivity).catch(ERR);
});
Bot.on('updateError', (tag)=>{
	dbot.user.setStatus('dnd').catch(ERR);
	if (tag) {
		dbot.user.setActivity(tag, { type:'PLAYING' });
	}
});


function listenForQueryUpdate(query) {
	Bot.once('query'+query.id, (res, user)=>{
		query.result = res;
		query.user = user;
		if (query.text && query.msgId) {
			staffChannel.fetchMessage(query.msgId).then(msg=>{
				if (res === true) msg.edit(`~~${query.text}~~\n[Query confirmed by ${user}]`);
				else if (res === false) msg.edit(`~~${query.text}~~\n[Query denied by ${user}]`);
				else if (res === null) msg.edit(`~~${query.text}~~\n[Query timed out]`);
				else if (typeof res === 'string') {
					if (user)
						msg.edit(`~~${query.text}~~\n[Query marked '${res}' by ${user}]`);
					else
						msg.edit(`~~${query.text}~~\n[Query canceled: ${res}]`);
				}
			}).catch(ERR);
		}
		if (typeof query.evtid === 'string' && query.evtid) {
			Bot.emit(query.evtid, query);
		}
	});
}

for (let id in Bot.memory.queries) {
	listenForQueryUpdate(Bot.memory.queries[id]);
}

let loggedIn;
if (!global.exeFlags.dontConnect)
	loggedIn = dbot.login(auth.discord.token);

module.exports = {
	dbot, setDiscordStatus,
	isReady() { return loggedIn; },
	
	alertUpdaters(text, { ping=false, bypassTagCheck=false, reuseId }={}) {
		if (!bypassTagCheck && Bot.taggedIn !== true) return Promise.reject('Will not alert updaters: Not checked in.');
		if (!staffChannel) return Promise.reject(new ReferenceError('Cannot alert updaters: Staff channel is not assigned!'));
		
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
	
	/** 
	 * Sends a Query to the updater control channel. 
	 * @param {string} text - The text of the query. Should contain the text 
	 * 	'{{confirm}}' and '{{deny}}', which will be replaced with commands on how to
	 *  confirm or deny the query, respectively.
	 * @param {object} [opts]
	 * @param {number} [opts.timeout] - The time until this question times out. Defaults to 5 minutes.
	 * @param {boolean} [opts.bypassTagCheck] - If this question should be asked even if not tagged in.
	 * @returns {string} - The ID of the query.
	 */
	queryUpdaters(text, { timeout=1000*60*5, bypassTagCheck=false }={}) {
		if (!bypassTagCheck) {
			if (Bot.taggedIn !== true) return false;
		}
		if (!staffChannel) return false;
		let id = generateId();
		
		//TODO have a list of other responses besides confirm/deny, so when one of them is given, we can
		// check against the query as to whether that's a valid response.
		text = text.replace(/\{\{confirm\}\}/gi, '`updater, confirm '+id+'`');
		text = text.replace(/\{\{deny\}\}/gi, '`updater, deny '+id+'`');
		text = text.replace(/\{\{invalid\}\}/gi, '`updater, invalid '+id+'`');
		let query = Bot.memory.queries[id] = {
			id, text, msgId:null, evtid:null,
			expiresAt: (timeout)? Date.now() + timeout : Infinity,
			result: undefined,
		};
		let minLeft = '';
		if (timeout) {
			minLeft = Math.ceil((query.expiresAt - Date.now()) / (60 * 1000));
			minLeft = `\n[Query expires in ${minLeft} minutes]`;
		}
		
		staffChannel
			.send(`${text}${minLeft}`)
			.then(msg=> query.msgId=msg.id )
			.catch(ERR);
		
		listenForQueryUpdate(query);
		return id;
	},
	
	/**
	 * Requests a Query id to use for custom or multiple queries.
	 * @param {number=} timeout - The time until the query times out. Defaults to 5 minutes.
	 * @param {string=} evtid - The event to fire off should this query be updated.
	 * @returns {string} - The ID of the query.
	 */
	requestQuery(timeout=1000*60*5, evtid=null) {
		let id = generateId();
		let query = Bot.memory.queries[id] = {
			id, text:null, msgId:null, evtid:null,
			expiresAt: Date.now() + timeout,
			result: undefined,
		};
		listenForQueryUpdate(query);
		return id;
	},
	
	/**
	 * Checks on the status of a given query.
	 * @param {string} id - The id of the query to check.
	 * @returns {object|number|null} - Returns a result object if the query was
	 *   confirmed or denied, null if the query expired, or the number
	 *   of minutes remaining to display if the query has not yet expired.
	 */
	checkQuery(id) {
		let query = Bot.memory.queries[id];
		if (!query) return null; //no query for the given id - assume it has been timed out
		if (query.result !== undefined) {
			delete Bot.memory.queries[id];
			if (query.text) { //If this module asked the question, the only thing the remote module cares about is the result
				return query.result;
			} else { //If it's a custom query, return the whole object, so it can see the user who confirmed it.
				return query;
			}
		}
		if (Date.now() > query.expiresAt) { //query expired
			Bot.emit('query'+id, null);
			delete Bot.memory.queries[id];
			return null;
		}
		let minLeft = '';
		if (Number.isFinite(query.expiresAt)) {
			minLeft = Math.ceil((query.expiresAt - Date.now()) / (60 * 1000));
			minLeft = `\n[Query expires in ${minLeft} minutes]`;
		}
		
		if (query.text !== null) {
			if (!query.msgId) { //the message didn't send? attempt to send the query again
				staffChannel
					.send(`${query.text}${minLeft}`)
					.then(msg=> query.msgId=msg.id )
					.catch(ERR);
			} else {
				staffChannel.fetchMessage(query.msgId).then(msg=>{
					msg.edit(`${query.text}${minLeft}`);
				});
			}
		}
		return minLeft;
	},
	
	/**
	 * Cancels the given query with the given reason.
	 * @param {string} id - The id of the query to cancel
	 * @param {string} reason - The reason this query was canceled.
	 */
	cancelQuery(id, reason) {
		if (typeof reason !== 'string') throw new TypeError('Must give a string reason for cancelling a query!');
		let query = Bot.memory.queries[id];
		if (!query) return;
		Bot.emit('query'+id, reason);
		delete Bot.memory.queries[id];
	},
	
	/** Attempts to reconnect the discord bot. */
	reconnect() {
		dbot.destroy().then(()=>dbot.login(auth.discord.token));
	},
};