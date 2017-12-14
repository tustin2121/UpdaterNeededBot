// api/reddit.js
//

const url = require("url");
const http = require("https");
const fs = require("fs");

module.exports = {
	getOAuth : function(refresh, { client_id, client_secret, username, password, oAuth_token, redirect_uri }) {
		return new Promise(function(resolve, reject){
			LOGGER.log('Updating OAuth token...');
			let loc = url.parse(`https://www.reddit.com/api/v1/access_token`);
			loc.method = 'POST';
			loc.headers = {
				"Authorization": `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}`,
			};
			let req = http.request(loc, (res)=>{
				// LOGGER.log(`STATUS: ${res.statusCode}`);
				// LOGGER.log(`HEADERS: ${JSON.stringify(res.headers)}`);
				
				let json = "";
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					// LOGGER.log(`BODY: ${chunk}`);
					json += chunk;
				});
				res.on('end', () => {
					// LOGGER.log('No more data in response.');
					try {
						let j = JSON.parse(json);
						if (!j.access_token) {
							LOGGER.log('Unsuccessful response!');
							LOGGER.debug(`STATUS: ${res.statusCode}`);
							LOGGER.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
							LOGGER.debug(`BODY: ${json}`);
						}
						resolve(j);
					} catch (e) {
						LOGGER.log('Unsuccessful response!');
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
				req.write(`grant_type=refresh_token&refresh_token=${refresh}`);
			} else {
				req.write(`grant_type=authorization_code&code=${oAuth_token}&redirect_uri=${redirect_uri}`);
				// req.write(`grant_type=password&username=${username}&password=${password}`);
			}
			req.end();
		}).then((json)=>{
			if (json.refresh_token) {
				fs.writeFile(__dirname+"/refresh.token", json.refresh_token);
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
				// LOGGER.log(`STATUS: ${res.statusCode}`);
				// LOGGER.log(`HEADERS: ${JSON.stringify(res.headers)}`);
				
				let json = "";
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					// LOGGER.log(`BODY: ${chunk}`);
					json += chunk;
				});
				res.on('end', () => {
					// LOGGER.log('No more data in response.');
					try {
						let j = JSON.parse(json);
						if (!j.success) {
							LOGGER.log('Unsuccessful response!');
							LOGGER.debug('REQUEST: ', req.output);
							LOGGER.debug('====================================');
							LOGGER.debug(`STATUS: ${res.statusCode}`);
							LOGGER.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
							LOGGER.debug(`BODY: ${json}`);
						}
						resolve(j);
					} catch (e) {
						LOGGER.log('Unsuccessful response!');
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
			
			// LOGGER.log('REQUEST: ', req.output);
			// LOGGER.log('====================================');
		});
	},
}