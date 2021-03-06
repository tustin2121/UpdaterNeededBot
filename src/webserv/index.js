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
			LOGGER.info(`Listening on ${serv.address().address}:${serv.address().port}`);
		});
		io.on('connection', _remoteConnected);
		
		////////////////////////////////////////////////////////////////////////////
		// Routing
		
		app.get('/fa', express.static(path.join(__dirname, 'site/fa/')));
		app.get('/api/:id', (req, res, next)=>{
			let i = Number.parseInt(res.params.id, 10);
			if (Number.isNaN(i)) return res.sendStatus(400);
			const opts = {
				root: path.join(__dirname, '../../memory/api'),
			};
			res.sendFile(`stream_api.${i}.json`, opts, (err)=>{
				if (err){
					LOGGER.error('Error sending API:', err);
					next(err);
				} else {
					LOGGER.trace(`Sent stream_api.${i}.json`);
				}
			});
		});
		app.get('/u/:id', (req, res, next)=>{
			//TODO
			res.sendFile(path.join(__dirname, 'site', `index.html`));
		});
		
		app.use(express.static(path.join(__dirname, 'site'), {
			extensions: ['html'],
			index: 'index.html',
			fallthrough: false, // Last Middleware
		}));
		
		serv.listen(21231);
		this.server = serv;
		return;
		
		function _remoteConnected(sock) {
			LOGGER.info(`Remote connected.`);
			const evts = {};
			
			Bot.on('post-update-cycle', evts['post-update']=()=>{
				Bot.press.pool.forEach((p, i)=>{
					sock.emit(`ledger`, i, p.lastLedger.log.getXml());
				})
			});
			Bot.streamApi.on('api-written', evts['api-written']=(id)=>{
				sock.emit('api-update', id);
			});
			
			
			
			sock.on('disconnect', ()=>{
				Bot.removeListener('post-update-cycle', evts['post-update']);
				Bot.streamApi.removeListener('api-written', evts['api-written']);
				LOGGER.info('Remote disconnected.')
			});
		}
	}
	
}

module.exports = WebServer;
