// maptool romread/tableread.js
// A reader which can read map tables copied from Spiky's DS Map Editor

const fs = require('fs');
const { MapNode } = require('../mapnode.js');

const COL_INTNAME = 0;
const COL_NAME = 10;

class Gen4TableReader {
	constructor(tableFile) {
		this.headers = [];
		this.matrix = [];
		
		this.tableFile = tableFile;
	}
	load() {
		let lines = fs.readFileSync(this.tableFile, 'utf8');
		lines = lines.split('\n');
		
		let state = null;
		for (let line of lines) {
			if (line.startsWith('=====')) {
				switch (line.slice(5).trim().toLowerCase()) {
					case 'headers': state = 'head'; break;
					case 'matrix': state = 'mat'; break;
					default: state = null; break;
				}
				continue;
			}
			if (line.startsWith('#')) continue;
			if (!line.trim()) continue;
			
			if (state === 'head') {
				this.headers.push(line.split('\t'));
			}
			else if (state === 'mat') {
				this.matrix.push(line.split('\t').map(x=>Number.parseInt(x,10)));
			}
			else {
				throw new Error('Invalid state error!');
			}
		}
	}
	
	readMaps() {
		let mapData = [];
		let areaNames = [];
		
		this.headers.forEach((line, mapId)=>{
			let info = new MapNode(null, {
				bank: 0, map: mapId,
				name: line[COL_NAME],
				areaName: line[COL_NAME],
				width: 32, height: 32, //size of one chunk
				gamedata: {
					intName: line[COL_INTNAME],
					tex1: Number.parseInt(line[1], 10),
					tex2: Number.parseInt(line[2], 10),
					matrix: Number.parseInt(line[3], 10),
				},
			});
			{
				let areaId = areaNames.indexOf(info.areaName);
				if (areaId === -1) {
					areaId = areaNames.length;
					areaNames.push(info.areaName);
				}
				info.areaId = areaId;
			}{
				// Assign map type based on internal name
				// [A][00]([T][00][00])?
				// [A] = Area Type (T=Town,D=Dungeon,R=Route)
				// [00] = Area ID of Type
				// [T] = Room Type (R=Room,GYM=Gym,PC=Pokemon Center,)
				// [00][00] = Room Id, Subroom Id
				let res = /^([A-Z]{1})(\d{2})(?:([A-Z]{1,3})(\d{2})(\d{2}))?$/.exec(info.gamedata.intName);
				if (res) { //matches this format
					let [, areaType, areaId, roomType, roomId, subId, ] = res;
					areaId = Number.parseInt(areaId, 10);
					roomId = Number.parseInt(roomId, 10);
					subId  = Number.parseInt(subId, 10);
					info.gamedata.intId = { areaType, areaId, roomType, roomId, subId };
					
					switch(areaType) {
						case 'C': // inexplicable break from format for "Fight Area"
						case 'T': info.type = 'town'; break;
						case 'R': info.type = 'route'; break;
						case 'D': info.type = 'dungeon'; break;
						case 'P': info.type = 'indoor'; break; //port/ship
						case 'W':
							info.type = 'route';
							info.attrs.water = true;
							break;
					}
					switch (roomType) {
						case 'FS': info.type = 'mart'; break;
						case 'PC': info.type = 'center'; break;
						case 'GYM': info.type = 'gym'; break;
					}
					if (roomType === 'R' && areaType !== 'D') {
						info.type = 'indoor';
					}
				}
				else { //special cases
					// Usually these are mystery zones and can be ignored
					if (info.gamedata.intName.startsWith('SAF')) { //safari zone
						info.type = 'safari';
					}
				}
			}
			if (info.gamedata.matrix === 0) {
				// Attempt to find the width and height of this overworld map
				for (let y = 0; y < this.matrix.length; y++) {
					let x = this.matrix[y].indexOf(mapId);
					if (x === -1) continue;
					// found the top-left corner of the map in the matrix
					let w = 1, h = 1;
					for (let cx = x+1; cx < this.matrix[y].length && this.matrix[y][cx] === mapId; cx++) w++;
					for (let cy = y+1; cy < this.matrix.length && this.matrix[cy][x] === mapId; cy++) h++;
					info.width = w * 32;
					info.height = h * 32;
					break;
				}
			}
			mapData.push(info);
		});
		return { mapData: [ mapData ] };
	}
}

module.exports = { Gen4TableReader };