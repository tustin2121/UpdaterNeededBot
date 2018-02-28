// webserv/index.js
// The debugging webserver.

const path = require('path');
const LOGGER = getLogger('Server');

class WebServer {
	constructor() {
		this.server = null;
	}
	
	connect() {
		const express = require('express');
		const app = express();
		const serv = (()=>{
			/*eslint no-constant-condition: 0*/
			if (false) { //TODO check in options for paths to security certs and the like
				return require('https').createServer({}, app);
			} else {
				return require('http').createServer(app);
			}
		})();
		const io = require('socket.io')(serv);
		
		serv.on('listening', ()=>{
			LOGGER.log(`Listening on ${serv.address().address}:${serv.address().port}`);
		});
		io.on('connection', _remoteConnected);
		
		////////////////////////////////////////////////////////////////////////////
		// Routing
		
		app.get('/fa', express.static(path.join(__dirname, 'site/fa')));
		
		app.use(express.static(path.join(__dirname, 'site'), {
			extensions: ['html'],
			index: 'index.html',
			fallthrough: false, // Last Middleware
		}));
		
		serv.listen(21231);
		this.server = serv;
		return;
		
		function _remoteConnected(sock) {
			LOGGER.log(`Remote connected.`);
			const evts = {};
			
			Bot.on('post-update-cycle', evts['post-update'] = ()=>{
				//TODO
			});
			
			
			
			
			sock.on('disconnect', ()=>{
				Bot.removeListener('post-update-cycle', evts['post-update']);
				LOGGER.log('Remote disconnected.')
			});
			
			
		}
	}
	
}


