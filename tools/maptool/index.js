// maptool index.js
// Maptool main file

const EventEmitter = require('events');
const EmuConnect = require('./emu-connect');

class App extends EventEmitter {
	constructor() {
		super();
		this.mainWindow = null;
		this.mapWindow = null;
		
		this.currFile = null;
		this.currData = null;
		this.loadedROM = null;
	}
	
	openMapWindow() {
		this.mapWindow.show();
	}
}

const APP = global.App = new App();

console.log('Hello');

nw.Window.open("main.html", {
	title: "Maptool",
	width: 1260, height: 640,
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
