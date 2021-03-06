// api/reddit.js
//

const LOGGER = getLogger('Reddit');

const fs = require("fs");
const url = require("url");
const path = require('path');
const http = require("https");

const AUTH_DIR = path.resolve(__dirname, '../../.auth');

module.exports = {
	getOAuth : function(refresh, { client_id, client_secret, username, password, oAuth_token, redirect_uri }) {
		return new Promise(function(resolve, reject){
			LOGGER.info('Updating OAuth token...');
			let loc = url.parse(`https://www.reddit.com/api/v1/access_token`);
			loc.method = 'POST';
			loc.headers = {
				"Authorization": `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}`,
			};
			let req = http.request(loc, (res)=>{
				// LOGGER.info(`STATUS: ${res.statusCode}`);
				// LOGGER.info(`HEADERS: ${JSON.stringify(res.headers)}`);
				
				let json = "";
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					// LOGGER.info(`BODY: ${chunk}`);
					json += chunk;
				});
				res.on('end', () => {
					// LOGGER.info('No more data in response.');
					try {
						let j = JSON.parse(json);
						if (!j.access_token) {
							LOGGER.info('Unsuccessful response!');
							LOGGER.debug(`STATUS: ${res.statusCode}`);
							LOGGER.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
							LOGGER.debug(`BODY: ${json}`);
						}
						resolve(j);
					} catch (e) {
						LOGGER.info('Unsuccessful response!');
						LOGGER.debug(`STATUS: ${res.statusCode}`);
						LOGGER.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
						LOGGER.debug(`BODY: ${json}`);
						reject(e);
					}
				});
			});
			req.on('error', (e)=>{
				LOGGER.error(`problem with request: ${e.message}`);
				reject(e);
			});
			if (refresh) {
				LOGGER.trace('grant_type=refresh_token');
				req.write(`grant_type=refresh_token&refresh_token=${refresh}`);
			} else {
				LOGGER.trace('grant_type=authorization_code');
				req.write(`grant_type=authorization_code&code=${oAuth_token}&redirect_uri=${redirect_uri}`);
				// req.write(`grant_type=password&username=${username}&password=${password}`);
			}
			req.end();
		}).then((json)=>{
			if (json.refresh_token) {
				fs.writeFileSync(path.resolve(AUTH_DIR, "refresh.token"), json.refresh_token);
			}
			return json;
		});
	},
	
	postUpdate : function(update, { liveID, access_token }) {
		return new Promise(function(resolve, reject){
			let loc = url.parse(`https://oauth.reddit.com/api/live/${liveID}/update`);
			loc.method = 'POST';
			loc.headers = {
				"Authorization": `bearer ${access_token}`,
				'User-Agent': `UpdaterNeeded bot (run by Node.js) by /u/tustin2121`,
			};
			let req = http.request(loc, (res)=>{
				LOGGER.trace(`STATUS: ${res.statusCode}`);
				// LOGGER.info(`HEADERS: ${JSON.stringify(res.headers)}`);
				
				let json = "";
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					// LOGGER.info(`BODY: ${chunk}`);
					json += chunk;
				});
				res.on('end', () => {
					// LOGGER.info('No more data in response.');
					try {
						let j = JSON.parse(json);
						if (!j.success) {
							LOGGER.info('Unsuccessful response!');
							LOGGER.debug('REQUEST: ', req.output);
							LOGGER.debug('====================================');
							LOGGER.debug(`STATUS: ${res.statusCode}`);
							LOGGER.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
							LOGGER.debug(`BODY: ${json}`);
						}
						LOGGER.trace(`Posted successfully!`);
						resolve(j);
					} catch (e) {
						LOGGER.info('Unsuccessful response!');
						LOGGER.debug(`STATUS: ${res.statusCode}`);
						LOGGER.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
						LOGGER.debug(`BODY: ${json}`);
						reject(e);
					}
				});
			});
			req.on('error', (e)=>{
				LOGGER.error(`problem with request: ${e.message}`);
				reject(e);
			});
			// req.write(JSON.stringify( {'api_type':'json', 'body': update} ));
			req.write(`body=${encodeURIComponent(update)}`);
			req.end();
			LOGGER.trace(`postUpdate complete.`);
			
			// LOGGER.log('REQUEST: ', req.output);
			// LOGGER.log('====================================');
		});
	},
}