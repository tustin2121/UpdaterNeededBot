// maptool romread/tableread.js
// A reader which can read map tables copied from Spiky's DS Map Editor

const fs = require('fs');
const { MapNode } = require('../mapnode.js');

const COL_ID = 0;
const COL_AREAID = 1;
const COL_NAME = 2;
const COL_HEADER = 3;

class Gen6TableReader {
	constructor(tableFile) {
		this.headers = [];
		
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
					default: state = null; break;
				}
				continue;
			}
			if (line.startsWith('#')) continue;
			if (!line.trim()) continue;
			
			if (state === 'head') {
				this.headers.push(line.split('\t'));
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
			let buffer = Buffer.from(line[COL_HEADER],'hex');
			
			let info = new MapNode(null, {
				bank: 0, map: mapId,
				name: line[COL_NAME],
				areaId: Number.parseInt(line[COL_AREAID], 10),
				areaName: line[COL_NAME],
				width: 32, height: 32, //size of one chunk
				gamedata: {
					headerData: line[COL_HEADER],
				},
			});
			{
				// Determine info based on what little header information we can gather
				let mapMatrix = buffer.readUInt16LE(0x02);
				let mapModel = buffer.readUInt16LE(0x04);
				let parentMap = buffer.readUInt16LE(0x1A);
				let showSignpost = buffer.readUInt8(0x1D) == 0x04; //either 0x04 or 0x00
				let mapType = buffer.readUInt8(0x20);
				let battleBG = buffer.readUInt16LE(0x26); //possibly?
				
				switch (mapType) {
					case 0x01: info.type = 'outdoor'; break;
					case 0x02: info.type = 'indoor'; break;
					case 0x03: info.type = 'center'; break;
					case 0x04: info.type = 'mart'; break;
					case 0x05: info.type = 'gatehouse'; break;
				}
				
				if (info.areaId === 24) { //prism tower
					info.type = 'gym';
				} else {
					switch (battleBG) {
						case 0x02: //Santalune Gym?
						case 0x03: //Cyllage Gym?
						case 0x00: //Shalour Gym?
						case 0x04: //Coumarine Gym?
						// Prism Tower (gym) has its own name
						case 0x01: //Laverre Gym?
						case 0x0d: //Anistar Gym?
						case 0x0e: //Snowbelle Gym?
							info.type = 'gym';
							info.name = info.name.slice(0, -4) + 'Gym'; //Slice off "City"/"Town", add "Gym"
							break;
					}
				}
			}
			mapData.push(info);
		});
		return { mapData: [ mapData ] };
	}
}

module.exports = { Gen6TableReader };