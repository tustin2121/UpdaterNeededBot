// maptool romread/tableread.js
// A reader which can read map tables copied from Spiky's DS Map Editor

const fs = require('fs');
const { MapNode } = require('../mapnode.js');

const COL_mapType		= 0;
const COL_unkA			= 1;
const COL_texture		= 2;
const COL_matrix		= 3;
const COL_scripts		= 4;
const COL_levelScripts	= 5;
const COL_texts			= 6;
const COL_musicSpring	= 7;
const COL_musicSummer	= 8;
const COL_musicAutumn	= 9;
const COL_musicWinder	= 10;
const COL_wildPokemon	= 11;
const COL_mapId			= 12;
const COL_parentMapId	= 13;
const COL_name			= 14;
const COL_nameStyle		= 15;
const COL_weather		= 16;
const COL_camera		= 17;
const COL_unkB			= 18;
const COL_flags			= 19;
const COL_unkC			= 20;
const COL_nameIcon		= 21;
const COL_flyX			= 22;
const COL_flyY			= 23;
const COL_flyZ			= 24;

class Gen5TableReader {
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
				name: line[COL_name],
				areaName: line[COL_name],
				width: 32, height: 32, //size of one chunk
				gamedata: {
					mapId: Number.parseInt(line[COL_mapId], 10), 
					parentId: Number.parseInt(line[COL_parentMapId], 10), 
					mapType: Number.parseInt(line[COL_mapType], 10),
					tex: Number.parseInt(line[COL_texture], 10),
					matrix: Number.parseInt(line[COL_matrix], 10),
				},
			});
			let flySpot = [
				Number.parseInt(line[COL_flyX], 10),
				Number.parseInt(line[COL_flyZ], 10),
				Number.parseInt(line[COL_flyY], 10),
			];
			if (flySpot[0] != 5 && flySpot[1] != 4) { //dunno why these are the defaults...
				info.addArea({
					name: "flySpot",
					x: flySpot[0], y: flySpot[1], z: flySpot[2],
					attrs: { flyspot: true, },
				});
			}
			{
				let areaId = areaNames.indexOf(info.areaName);
				if (areaId === -1) {
					areaId = areaNames.length;
					areaNames.push(info.areaName);
				}
				info.areaId = areaId;
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

module.exports = { Gen5TableReader };