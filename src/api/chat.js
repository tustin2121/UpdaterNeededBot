// api/chat.js
// The API for reading chat and buffering it for use by the updater.

const auth = require('../../.auth');
const irc = require('irc');

const LOGGER = getLogger('ChatAPI');

class ChatAPI {
	constructor({ url, channels, memory }) {
		this.serverUrl = url;
		this.channelList = channels;
		this.memory = memory;
		if (!Array.isArray(this.channelList)) {
			this.channelList = [this.channelList];
		}
		
		let ibot = new irc.Client(url, auth.irc.username, {
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
		this.ibot = ibot;
		
		////////////////////////////////////////////////
		
		// Holds chat lines (not inputs)
		this.linebuffer = [];
		// Holds inputs
		this.inputbuffer = {};
	}
	
	connect() {
		LOGGER.trace('Connecting to chat...');
		this.ibot.connect(()=>{
			LOGGER.info(`Connected to chat (${this.serverUrl} @ ${this.channelList.join(',')} `);
		});
	}
	
	handleMessage(nick, to, text, msg) {
		//TODO
	}
	
	getStats() {
		let lines = this.linebuffer;
		let inputs = this.inputbuffer;
		this.linebuffer = [];
		this.inputbuffer = {};
		
		return { lines, inputs };
	}
}
module.exports = ChatAPI;