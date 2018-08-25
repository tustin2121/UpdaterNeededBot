// api/chat.js
// The API for reading chat and buffering it for use by the updater.

const auth = require('../../.auth');
const irc = require('irc');
const EventEmitter = require('./events');

const LOGGER = getLogger('ChatAPI');

class ChatAPI extends EventEmitter {
	constructor({ url, channels, memory }) {
		super();
		this.serverUrl = url;
		this.channelList = channels;
		this.memory = memory;
		if (!Array.isArray(this.channelList)) {
			this.channelList = [this.channelList];
		}
		
		let ibot = this.ibot = new irc.Client(url, auth.irc.username, {
			password: auth.irc.password,
			channels: this.channelList,
			port: 6667,
			secure: false,
			autoConnect: false,
			autoRejoin: true,
			retryCount: 30000,
			retryDelay: 1000,
		});
		ibot.on('registered', ()=>LOGGER.debug(`IRC bot Registered.`));
		ibot.on('motd', (msg)=>LOGGER.debug(`IRC: MOTD: ${msg}`));
		ibot.on('message#', this.handleMessage.bind(this));
		ibot.on('pm', (nick, text, msg)=>LOGGER.debug(`IRC PM:`, msg));
		
		ibot.on('error', (msg)=>{
			if (msg.command === 'err_unknowncommand' && msg.args[1] === 'WHOIS') return; //ignore this error, it'll always appear
			LOGGER.error(`IRC ERROR:`, msg);
		});
		
		////////////////////////////////////////////////
		
		this.inputMap = Bot.runConfig.run.inputMap;
		
		/** Holds tpp announcements */
		this.tppbuffer = [];
		/** Holds chat lines (not inputs) */
		// this.linebuffer = [];
		/** Holds inputs */
		// this.inputbuffer = {};
		/** Hold unique inputters */
		// this.inputterSet = new Set();
		
		if (this.serverUrl && !global.exeFlags.dontConnect) {
			this._init = this.connect();
		}
	}
	
	getStats() {
		let stats = {
			tpp: this.tppbuffer,
			// lines: this.linebuffer,
			// inputs: this.inputbuffer,
		};
		this.tppbuffer = [];
		// this.linebuffer = [];
		// this.inputbuffer = {};
		
		// for (let key in this.inputMap) {
		// 	if (this.inputMap[key] !== true) continue;
		// 	this.inputbuffer[key] = 0;
		// }
		
		return stats;
	}
	
	isReady() {
		return this._init || Promise.resolve(true);
	}
	
	connect() {
		if (!this.serverUrl) return Promise.resolve(true);
		return new Promise((resolve, reject)=>{
			LOGGER.info('Connecting to chat...');
			try {
				this.ibot.connect(()=>{
					LOGGER.info(`Connected to chat (${this.serverUrl} @ ${this.channelList.join(',')})`);
					resolve();
				});
			} catch (e) {
				LOGGER.error(`Could not connect to chat (${this.serverUrl} @ ${this.channelList.join(',')})`, e);
				resolve(); //Resolve anyway so things begin without chat
			}
		});
	}
	
	get isConnected() {
		return (this.ibot && this.ibot.conn && this.ibot.conn.connected);
	}
	
	handleMessage(nick, to, text, msg) {
		// LOGGER.debug(`${nick}: ${text}`);
		const INPUT_MATCH = Bot.runConfig.run.inputMatch;
		let res;
		if (nick === 'tpp') {
			LOGGER.trace(`${nick}: ${text}`);
			this.tppbuffer.push(text);
		}
		else if ((res = INPUT_MATCH.exec(text))) {
			// this.inputterSet.add(nick); //use this to determine average inputter to viewer ratio
			//let input =
			
			//this.inputbuffer =
		}
		else {
			// this.linebuffer.push({ nick, text });
		}
	}
	
}
module.exports = ChatAPI;