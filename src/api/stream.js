// api/stream.js
// The API for the stream

const HTTP = require('http');
const URL = require('url');

const { SortedData } = require('./pokedata');

const LOGGER = getLogger('StreamAPI');

class StreamAPI {
	constructor(url, updatePeriod) {
		this.updateUrl = url;
		this._updateInterval = setInterval(this.refresh.bind(this), updatePeriod);
		
		/** The sorted stream data from the most recent update. This data may match the previous
		  * data, with a bad return code if the last update failed. */
		this.currInfo = [];
		/** The sorted stream data from the last update cycle. */
		this.prevInfo = [];
		
		//TODO fill in "currInfo" with the last-saved API update
		
		this.refresh();
	}
	
	async refresh() {
		let currInfo = [];
		let prevInfo = this.currInfo;
		try {
			LOGGER.trace(`Requesting Stream API refresh.`);
			let data = await http_get(this.updateUrl);
			//TODO save data to a rotating file
			LOGGER.trace(`Retrieved Stream API. About to parse.`);
			if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					currInfo.push(new SortedData({ data:data[i], game:i }));
				}
			} else {
				currInfo.push(new SortedData({ data }));
			}
			LOGGER.trace(`Stream API parsed successfully.`);
		} catch (e) {
			LOGGER.error(`Error parsing Stream API:`, e);
			currInfo = prevInfo;
			currInfo.forEach(x=>x.httpCode = e.statusCode || 500);
		}
		this.currInfo = currInfo;
		this.prevInfo = prevInfo;
	}
	
	getInfo(game=0) {
		return this.currInfo[game];
	}
	getPrevInfo(game=0) {
		return this.prevInfo[game];
	}
}

function http_get(url) {
	return new Promise((resolve, reject)=>{
		let loc = URL.parse(url);
		loc.headers = {
			'Accept': 'application/json',
		};
		HTTP.get(loc, (res)=>{
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
