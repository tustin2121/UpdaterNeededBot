// maptool index.js
// Maptool main file

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const EmuConnect = require('./emu-connect');
const { MapRegion } = require('./mapnode.js');

class Application extends EventEmitter {
	constructor() {
		super();
		this.mainWindow = null;
		this.mapWindow = null;
		this.reportWindow = null;
		
		this.currFile = null;
		this.currData = null;
		this.loadedROM = null;
		this._dirty = false;
		
		this.emuConnect = new EmuConnect();
		this.emuConnect.on('map-changed', ({ bank, id, area, x, y, z })=>{
			this.currData.ensureMap(bank, id, { area });
			this.emit('map-changed', { bank, id, x, y, z });
		});
		this.emuConnect.on('pos-changed', ({ bank, id, x, y, z })=>{
			this.emit('pos-changed', { bank, id, x, y, z });
		});
	}
	
	set isDirty(val) {
		this._dirty = val;
		this.emit('dirty', this._dirty);
	}
	get isDirty(){ return this._dirty; }
	
	/** An async emit used by the objects in mapnode to specify that it has become dirty. */
	notifyChange(type, obj) {
		process.nextTick(()=>{
			this.isDirty = true;
		});
	}
	
	getMap({ bank=0, id=0, area }) {
		return this.currData.resolve({ bank, id, area });
	}
	
	loadRegion(file) {
		this.currFile = file;
		this.currData = new MapRegion(JSON.parse(fs.readFileSync(file)));
		this.isDirty = false;
		this.emit('load');
	}
	
	saveRegion() {
		let data = this.currData.serialize();
		fs.writeFileSync(this.currFile, JSON.stringify(data, null, '\t'));
		this.isDirty = false;
	}
	
	newRegion({ file, name, romReader }) {
		let data = new MapRegion(name);
		if (romReader) {
			romReader.load();
			let { mapData } = romReader.readMaps(data);
			data.nodes = mapData;
		}
		fs.writeFileSync(file, JSON.stringify(data.serialize(), null, '\t'));
		return this.loadRegion(file);
	}
	
	openMapWindow() {
		this.mapWindow.show();
	}
	openReportWindow() {
		this.reportWindow.show();
	}
}

const APP = global.App = new Application();

nw.Window.open("main.html", {
	title: "Maptool",
	width: 970, height: 640,
	position: "center",
	resizable: true,
	focus: true,
}, (win)=> {
	APP.mainWindow = win
	win.on('closed', ()=> process.exit() );
});

nw.Window.open("map.html", {
	title: "Maptool MapView",
	width: 640, height: 480,
	// position: "center",
	resizable: true,
	show: false,
}, (win)=> APP.mapWindow = win);

nw.Window.open("report.html", {
	title: "Maptool Report Preview",
	width: 480, height: 500,
	// position: "center",
	resizable: true,
	show: false,
}, (win)=> APP.reportWindow = win);
