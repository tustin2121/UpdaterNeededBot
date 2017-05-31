// testMap.js
// Tests the connections of a given map

const path = require('path');
const os = require('os');
const fs = require('fs');
const FILE = path.resolve(os.homedir(), `Dropbox/Apps/Emulator/Pokemon White 2/output`);

global.game = "White2";
const Region = require('./updaters/maps/unova2');

let sorted_curr;
let lastLocs = [ null, null, null ];

let _interval = undefined;
function enableInfo(enabled) {
	if (enabled) {
		if (!_interval) {
			_interval = setInterval(refreshInfo, 5*1000);
		}
	} else {
		if (_interval) {
			clearInterval(_interval);
			_interval = undefined;
		}
	}
}

function refreshInfo() {
	new Promise((resolve, reject)=>{
		fs.readFile(FILE, (err, data)=>{
			if (err) return reject(err);
			try {
				resolve(JSON.parse(data));
			} catch (e) {
				reject(e);
			}
		});
	}).then((data)=>{
		let sorted = {};
		
		const mapid = {
			mapid: data.map_id,
			parentId: data.map_parent,
			matrix: data.map_matrix,
		};
		sorted.location = Unova.find(mapid);
		sorted.position = `${data.x},${data.y}`;
		
		let steps = (lastLocs[0])? sorted.location.getStepsTo(lastLocs[0]) : 0;
		
		console.log(`------------------------------`);
		if (!lastLocs.includes(sorted.location)) {
			if (steps > 2) {
				if (sorted.location.has('healing') === 'pokecenter') {
					console.log(`=> [Bot] **BLACKOUT!**`);
				} else if (!lastLocs[0].is('indoors') && sorted.location.within('flySpot', sorted.position)) {
					console.log(`=> [Bot] We fly to ${sorted.location.name}!`);
				}
			}
			if (sorted.location.has('announce')) {
				console.log(`=> [Bot] ${sorted.location.has('announce')}`);
			} else if (sorted.location.is('noteworthy')) {
				console.log(`=> [Bot] We've arrived in ${sorted.location.name}`);
			}
			lastLocs.pop();
			lastLocs.unshift(sorted.location);
		}
		console.log(`Steps between last location and here: ${steps}`);
		if (sorted.location.has('pc') && sorted.location.within('pc', sorted.position)) {
			console.log(`We are near a PC!`);
		}
		if (sorted.location.has('legendary') && sorted.location.within('legendary', sorted.position)) {
			let l = sorted.location.has('legendary');
			console.log(`We are near a legendary: ${l.name}!`);
		}
		if (sorted.location.within('vending', sorted.position)) {
			console.log(`We are near a vending machine.`);
		}
		if (sorted.location.within('vending', sorted.position)) {
			console.log(`We are near a vending machine.`);
		}
		
		console.log(`------------ Info ------------`);
		console.log(sorted.location);
		console.log(`------------------------------`);
		
		sorted_curr = sorted;
	}).catch((e)=>{
		console.error("Error in Main:",e);
	});
}

enableInfo(true);
refreshInfo();