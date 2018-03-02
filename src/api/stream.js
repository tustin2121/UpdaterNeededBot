// api/stream.js
// The API for the stream

const FS = require('fs');
const HTTP = require('http');
const HTTPS = require('https');
const URL = require('url');
const PATH = require('path');
const EventEmitter = require('./events');

const API_SAVE_DIR = PATH.resolve(__dirname, '../../memory/api');
const NUM_PREV_SAVES = 50;

const { SortedData } = require('./pokedata');

const LOGGER = getLogger('StreamAPI');

class StreamAPI extends EventEmitter {
	constructor({ url, updatePeriod, memory }) {
		super();
		this.updateUrl = url;
		this._updateInterval = setInterval(this.refresh.bind(this), updatePeriod);
		this.memory = memory;
		
		/** The sorted stream data from the most recent update. This data may match the previous
		 *  data, with a bad return code if the last update failed. */
		this.currInfo = [];
		/** The sorted stream data from the last update cycle. */
		this.prevInfo = [];
		this.memory.lastIndex = (this.memory.lastIndex || 0);
		
		// Cannot complete in this constructor, as global "Bot" has yet to be defined
		this._startup = new Promise((resolve, reject)=>{
			process.nextTick(()=>{
				// fill in "currInfo" with the last-saved API update
				// (which will shuffle to "prevInfo" when refresh() is called below)
				let currInfo = [];
				let prevInfo = [];
				let currIdx = this.memory.lastIndex;
				let prevIdx = (this.memory.lastIndex+NUM_PREV_SAVES-1)%NUM_PREV_SAVES;
				
				if (disk_get(currIdx, currInfo)) {
					disk_get(prevIdx, prevInfo);
				} else {
					prevInfo = currInfo;
				}
				
				this.currInfo = currInfo;
				this.prevInfo = prevInfo;
				
				/** Indicates if the UpdaterPool has gotten the most recent update. */
				this.memory.hasPoppedUpdate = this.memory.hasPoppedUpdate || new Array(Bot.runConfig.numGames);
				
				this.emitLater('ready');
				resolve();
			});
		});
	}
	
	isReady() {
		return this._startup;
	}
	
	async refresh() {
		let currInfo = [];
		let prevInfo = this.currInfo;
		try {
			LOGGER.trace(`Requesting Stream API refresh.`);
			let data = await http_get(this.updateUrl);
			let ts = Date.now();
			{ // Save data to a rotating file
				let i = (this.memory.lastIndex+1) % NUM_PREV_SAVES;
				let str = `${ts}\n`+JSON.stringify(data, null, '\t');
				FS.writeFile( PATH.join(API_SAVE_DIR, `stream_api.${i}.json`), str, ()=>{
					LOGGER.debug(`Previous API saved at stream_api.${i}.json`);
					this.emit('api-written', i);
				});
				this.memory.lastIndex = i;
			}
			LOGGER.trace(`Retrieved Stream API. About to parse.`);
			for (let i = 0; i < Bot.runConfig.numGames; i++) {
				let key = Bot.gameInfo(i).key;
				if (key !== null && key !== undefined) {
					currInfo.push(new SortedData({ data:data[key], game:i, ts }));
				} else {
					currInfo.push(new SortedData({ data:data, game:i, ts }));
				}
			}
			LOGGER.trace(`Stream API parsed successfully.`);
		} catch (e) {
			LOGGER.error(`Error parsing Stream API:`, e);
			currInfo = prevInfo.map(x=> x.clone(e.statusCode || 500));
		}
		this.currInfo = currInfo;
		this.prevInfo = prevInfo;
		this.memory.hasPoppedUpdate.fill(false);
		this.emitLater('refreshed');
	}
	
	getInfo(game=0) {
		return this.currInfo[game];
	}
	getPrevInfo(game=0) {
		return this.prevInfo[game];
	}
	
	popInfo(game=0) {
		try {
			if (!this.memory.hasPoppedUpdate[game]) {
				// If we haven't yet gotten this info, return proper current and previous
				return { curr:this.currInfo[game], prev:this.prevInfo[game] };
			} else {
				// If we have gotten this info before, return two currents, so no updates happen twice
				return { curr:this.currInfo[game], prev:this.currInfo[game] };
			}
		} finally {
			this.memory.hasPoppedUpdate[game] = true;
		}
	}
}

function disk_get(index, info) {
	try {
		LOGGER.trace(`Loading Stream API from disk: stream_api.${index}.json`);
		let data = FS.readFileSync(PATH.join(API_SAVE_DIR, `stream_api.${index}.json`), 'utf8');
		let ts = data.split('\n',1)[0];
		data = JSON.parse(data.substr(ts.length+1));
		ts = Number.parseInt(ts, 10);
		LOGGER.trace(`Retrieved last Stream API. About to parse.`);
		for (let i = 0; i < Bot.runConfig.numGames; i++) {
			let key = Bot.gameInfo(i).key;
			if (key !== null && key !== undefined) {
				info.push(new SortedData({ data:data[key], game:i, ts }));
			} else {
				info.push(new SortedData({ data:data, game:i, ts }));
			}
		}
		return true;
	} catch (e) {
		// If there IS no previous info (first time running), or something
		// is wrong with the previous info, default to an empty but valid API
		let code = 500;
		if (e.code === 'ENOENT') {
			LOGGER.error(`Unable to load Previous Stream info: stream_api.${index}.json does not exist.`);
			code = 404;
		} else {
			LOGGER.error(`Error restoring Stream API from disk:`, e);
		}
		const data = { party: [], pc: {}, };
		for (let i = 0; i < Bot.runConfig.numGames; i++) {
			info.push(new SortedData({ data:data, game:i, code }));
		}
		return false;
	}
}

function http_get(url) {
	const H = url.startsWith('https')? HTTPS : HTTP;
	return new Promise((resolve, reject)=>{
		let loc = URL.parse(url);
		loc.headers = {
			'Accept': 'application/json',
		};
		H.get(loc, (res)=>{
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			
			let error;
			if (statusCode !== 200) {
				error = new Error(`Request Failed. Status Code: ${statusCode}`);
				error.statusCode = statusCode;
			// } else if (!/^application\/json/.test(contentType)) {
			// 	error = new Error(`Invalid content-type. Expected application/json but received ${contentType}`);
			}
			if (error) {
				LOGGER.error(error.message);
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
		}).on('error', (e)=>reject(e) );
	});
}

module.exports = StreamAPI;
