// maptool emu-connect/index.js
// The class that connects to the emulator when we can't read the rom involved

const http = require('http');
const EventEmitter = require('events');

const SERVER = `http://localhost:5337`;

function get(url) {
	return new Promise((resolve, reject)=>{
		http.get(`${SERVER}${url}`, (res)=>{
			let rawData = '';
			res.on('data', chunk=>rawData+=chunk);
			res.on('end', ()=>{
				if (res.statusCode !== 200) {
					reject(new Error(`Emulator server error: ${res.statusCode} - ${rawData}`));
				} else {
					resolve(rawData);
				}
			});
		});
	});
}


const READ_GAME = {
	'red': function (){
		get('/ReadByteRange/D35E/5').then((text)=>{
			this.setState({
				map_bank: 0xFF,
				map_id: Number.parseInt(text.substr(0, 2), 16),
				x: Number.parseInt(text.substr(8, 2), 16),
				y: Number.parseInt(text.substr(6, 2), 16),
			});
		});
	},
	'firered': function (){
		get('/ReadByteRange/*3005008/6').then((text)=>{
			this.setState({
				map_bank: Number.parseInt(text.substr(8, 2), 16),
				map_id: Number.parseInt(text.substr(10, 2), 16),
				x: Number.parseInt(text.substr(2, 2)+text.substr(0, 2), 16),
				y: Number.parseInt(text.substr(6, 2)+text.substr(4, 2), 16),
			});
		});
	},
};
READ_GAME['Pokemon - Red Version (USA, Europe)'] = READ_GAME['red']; //alias

class EmuConnect extends EventEmitter {
	constructor() {
		super();
		this.last = {};
	}
	
	listen() {
		this._timer = setInterval(()=>{
			this.getState();
		}, 500);
	}
	
	pause() {
		get('/Pause');
	}
	play() {
		get('/Play');
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
	
	getState() {
		get('/GetRomName').then(text=>{
			let r = READ_GAME[text];
			if (r) r.call(this);
			else {
				console.error(`Unknown rom name: ${text}`);
			}
		});
	}
}

module.exports = EmuConnect;
