// testMap.js
// Tests the connections of a given map

const path = require('path');
const os = require('os');
const fs = require('fs');
const net = require('net');
const saveproxy = require("./save-proxy");
const memoryFile = require('path').resolve(__dirname, "memory.json");

const UPDATER = require('./updaters/s4-rand-white2.js');

const { discover } = require("./discovery.js");
const Reporter = require("./report.js");

try { // Make the memory file if it does not exist
	fs.writeFileSync(memoryFile, "{}", { flag:'wx'});
} catch (e) {}

let access = { token:"", timeout:0 };
let memoryBank = saveproxy(memoryFile, "\t");
let data_curr, data_prev;
let sorted_curr, sorted_prev;
let lastLocs = [ null, null, null ];

////////////////////////////////////////////////////////////////////////////////////////////////////

let cachedApi = {};
let apiServe = net.createServer((conn)=>{
	console.log('Socket connected');
	conn.setEncoding('utf8');
	conn.on('end', ()=>{
		console.log('Socket disconnected');
	});
	conn.on('data', (data)=>{
		let d = JSON.parse(data);
		cachedApi = Object.assign(cachedApi, d);
	});
});
apiServe.on('error', (e)=>{
	console.error(`API SERVE ERROR:`, e);
});
apiServe.listen(8021);


////////////////////////////////////////////////////////////////////////////////////////////////////

let _interval = undefined;
function enableInfo(enabled) {
	if (enabled) {
		if (!_interval) {
			_interval = setInterval(refreshInfo, UPDATER.infoUpdateDelay);
		}
	} else {
		if (_interval) {
			clearInterval(_interval);
			_interval = undefined;
		}
	}
}

function getTimestamp(time) {
	let elapsed = ((time || Date.now()) - new Date(UPDATER.runStart*1000).getTime()) / 1000;
	let n		= (elapsed < 0)?"T-":"";
	elapsed 	= Math.abs(elapsed);
	let days    = Math.floor(elapsed / 86400);
    let hours   = Math.floor(elapsed / 3600 % 24);
    let minutes = Math.floor(elapsed / 60 % 60);
    // let seconds = Math.floor(elapsed % 60);
    
    return `${n}${days}d ${hours}h ${minutes}m`;
}

function refreshInfo() {
	console.log("Refreshing info...");
	data_prev = data_curr;
	sorted_prev = sorted_curr;
	data_curr = null;
	sorted_curr = null;
	
	new Promise((resolve, reject)=>{
		resolve(Object.assign({}, cachedApi));
	}).then((data)=>{
		data_curr = data;
		try {
			// console.log("Parsing info...");
			sorted_curr = UPDATER.infoParse(data);
			// console.log("Parsed.");
		} catch (e) {
			console.error('ERROR PARSING INFO!', e);
			return; // Cannot update this time
		}
		
		if (!sorted_prev) return;
		
		// console.log('Reporter reporting in...');
		let reporter = new Reporter(memoryBank, sorted_curr);
		discover(sorted_prev, sorted_curr, reporter.report.bind(reporter));
		
		let update = reporter.collate();
		
		console.log(`---------------------- Node ----------------------`);
		console.log(require('util').inspect(sorted_curr.location, { depth: 1 }));
		console.log(`--------------------------------------------------`);
		
		if (sorted_curr.location) {
			let loc = sorted_curr.location;
			let pos = sorted_curr.position;
			/*
			if (!lastLocs.includes(loc)) {
				if (steps > 2) {
					if (loc.has('healing') === 'pokecenter') {
						console.log(`=> [Bot] **BLACKOUT!**`);
					} else if (!lastLocs[0].is('indoors') && loc.within('flySpot', pos)) {
						console.log(`=> [Bot] We fly to ${loc.name}!`);
					}
				}
				if (loc.has('announce')) {
					console.log(`=> [Bot] ${loc.has('announce')}`);
				} else if (loc.is('noteworthy')) {
					console.log(`=> [Bot] We've arrived in ${loc.name}`);
				}
				lastLocs.pop();
				lastLocs.unshift(loc);
			} */
			let steps = (lastLocs[0])? loc.getStepsTo(lastLocs[0]) : NaN;
			console.log(`Steps between last location and here: ${steps}`);
			if (loc.has('pc') && loc.within('pc', pos)) {
				console.log(`We are near a PC!`);
			}
			if (loc.has('legendary') && loc.within('legendary', pos)) {
				let l = loc.has('legendary');
				console.log(`We are near a legendary: ${l.name}!`);
			}
			if (loc.within('vending', pos)) {
				console.log(`We are near a vending machine.`);
			}
			if (loc.within('vending', pos)) {
				console.log(`We are near a vending machine.`);
			}
		} else {
			console.log(`No location was found!! ${data_curr.map_id}`);
		}
		
		console.log(`--------------------------------------------------`);
		
		if (update) {
			let ts = getTimestamp();
			console.log('=>', `${ts} [Bot] ${update}`);
		} else {
			console.log('Reporter found no update.');
		}
		
	}).catch((e)=>{
		console.error("Error in Main:",e);
	});
}

enableInfo(true);
refreshInfo();