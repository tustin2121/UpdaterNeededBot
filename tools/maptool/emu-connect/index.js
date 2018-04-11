// maptool emu-connect/index.js
// The server that emulators connect to when we can't read the rom involved

const http = require('http');
const EventEmitter = require('events');

class EmuConnect extends EventEmitter {
	constructor() {
		super();
		this.last = {};
		
		this.server = http.createServer((req, res)=>{
			if (req.method === 'POST') {
				let data = '';
				req.setEncoding('utf8');
				req.on('data', (chunk)=> data += chunk );
				req.on('end', ()=>{
					res.end();
					this.setState(JSON.parse(data));
				});
				return;
			}
			res.statusCode = 418; //I am a teapot
			res.end();
		});
	}
	
	listen() {
		this.server.listen(21345);
	}
	
	setState(data) {
		let mapChanged = false, posChanged = false;
		let last = this.last;
		data = {
			bank: data.map_bank || 0,
			id: data.map_id || 0,
			area: data.area_id || 0,
			x: data.x || 0,
			y: data.y || 0,
			z: data.z || 0,
		};
		
		mapChanged |= last.area !== data.area;
		mapChanged |= last.bank !== data.bank;
		mapChanged |= last.id !== data.id;
		posChanged |= last.x !== data.x;
		posChanged |= last.y !== data.y;
		posChanged |= last.z !== data.z;
		
		this.last = data;
		if (mapChanged) this.emit('map-changed', data);
		if (posChanged) this.emit('pos-changed', data);
	}
}

module.exports = EmuConnect;
