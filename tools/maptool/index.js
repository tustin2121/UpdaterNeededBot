// maptool index.js
// Maptool main file

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const EmuConnect = require('./emu-connect');
const { generateDefaultMapTypes } = require('./mapnode.js');

class App extends EventEmitter {
	constructor() {
		super();
		this.mainWindow = null;
		this.mapWindow = null;
		
		this.currFile = null;
		this.currData = null;
		this.loadedROM = null;
	}
	
	getMap({ bank=0, id=0, area }) {
		let node = this.currData.nodes[bank][id];
		if (area) node = node.areas[area];
		return node;
	}
	
	loadRegion(file) {
		this.currFile = file;
		this.currData = JSON.parse(fs.readFileSync(file));
	}
	
	saveRegion() {
		fs.writeFileSync(this.currFile, JSON.stringify(this.currData, null, '\t'));
	}
	
	newRegion({ file, name, romReader }) {
		let data = {
			name,
			types: generateDefaultMapTypes,
			nodes: [],
		};
		if (romReader) {
			romReader.load();
			let { mapData } = romReader.readMaps();
			data.nodes = mapData;
		}
		fs.writeFileSync(file, JSON.stringify(data, null, '\t'));
		return this.loadRegion(file);
	}
	
	openMapWindow() {
		this.mapWindow.show();
	}
}

const APP = global.App = new App();

console.log('Hello');

nw.Window.open("main.html", {
	title: "Maptool",
	width: 520, height: 640,
	position: "center",
	resizable: true,
	focus: true,
}, (win)=> {
	APP.mainWindow = win
	win.on('closed', ()=>{
		// APP.mainWindow = null;
		// APP.mapWindow = null;
		process.exit();
	})
});

nw.Window.open("map.html", {
	title: "Maptool MapView",
	width: 1060, height: 640,
	position: "center",
	resizable: true,
	show: false,
}, (win)=> APP.mapWindow = win);
