// maptool emu-connect/index.js
// The server that emulators connect to when we can't read the rom involved

const http = require('http');
const EventEmitter = require('events');

class EmuConnect extends EventEmitter {
	constructor() {
		super();
		this.server = http.createServer((req, res)=>{
			if (req.method === 'POST') {
				let data = '';
				req.setEncoding('utf8');
				req.on('data', (chunk)=> data += chunk );
				req.on('end', ()=>{
					res.end();
					this.setState(JSON.parse(data));
				});
			}
		});
	}
	
	listen() {
		this.server.listen(21345);
	}
	
	setState(data) {
		this.emit('map-change', {
			area: data.area_id || 0,
			bank: data.map_bank || 0,
			id: data.map_id || 0,
			
			matrix: data.matrix || 0,
			parent: data.parent || 0,
			mapid: data.id || 0,
		});
	}
}

module.exports = EmuConnect;
