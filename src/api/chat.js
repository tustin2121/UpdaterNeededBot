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
			channels: this.channelList,
			port: 6667,
			secure: false,
			autoConnect: false,
			autoRejoin: true,
			retryCount: 3,
			retryDelay: 1000,
		});
		ibot.on('registered', ()=>LOGGER.trace(`IRC bot Registered.`));
		ibot.on('motd', (msg)=>LOGGER.trace(`IRC: MOTD: ${msg}`));
		ibot.on('message#', this.handleMessage.bind(this));
		
		////////////////////////////////////////////////
		
		this.inputMap = Bot.runConfig.run.inputMap;
		
		// Holds tpp announcements
		this.tppbuffer = null;
		// Holds chat lines (not inputs)
		this.linebuffer = null;
		// Holds inputs
		this.inputbuffer = null;
		// Hold unique inputters
		this.inputterSet = new Set();
		
		if (this.serverUrl && !global.exeFlags.dontConnect) {
			this._init = this.connect();
		}
	}
	
	getStats() {
		let stats = {
			tpp: this.tppbuffer,
			lines: this.linebuffer,
			inputs: this.inputbuffer,
		};
		this.tppbuffer = [];
		this.linebuffer = [];
		this.inputbuffer = {};
		
		for (let key in this.inputMap) {
			if (this.inputMap[key] !== true) continue;
			this.inputbuffer[key] = 0;
		}
		
		return stats;
	}
	
	isReady() {
		return this._init || Promise.resolve(true);
	}
	
	connect() {
		if (!this.serverUrl) return Promise.resolve(true);
		return new Promise((resolve, reject)=>{
			LOGGER.trace('Connecting to chat...');
			this.ibot.connect(()=>{
				LOGGER.info(`Connected to chat (${this.serverUrl} @ ${this.channelList.join(',')} `);
				resolve();
			});
		});
	}
	
	handleMessage(nick, to, text, msg) {
		LOGGER.trace(`${nick}: ${text}`);
		const INPUT_MATCH = Bot.runConfig.run.inputMatch;
		let res;
		if ((res = INPUT_MATCH.exec(text))) {
			this.inputterSet.add(nick); //use this to determine average inputter to viewer ratio
			//let input =
			
			//this.inputbuffer =
		} else if (nick === 'tpp') {
			this.tppbuffer.push(text);
		} else {
			this.linebuffer.push({ nick, text });
		}
	}
	
}
module.exports = ChatAPI;