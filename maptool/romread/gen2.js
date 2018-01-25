// maptool romread/gen2.js
// The Generation 2 Rom Reader

const { GBReader } = require('./base');

const EAST  = 1 << 0;
const WEST  = 1 << 1;
const SOUTH = 1 << 2;
const NORTH = 1 << 3;

const ENVIRONS = [ null, "town", "route", "indoor", "cave", null, "gate", "dungeon", ];
// Notes:
/// Caves and Dungeons can be dug out of
/// Routes and Towns are considered outdoor maps

const TILESET_POKECENTER = 0x07;
const TILESET_MART = 0x0C;
const MUSIC_GYM = 0x1B;

const OFFSETS = {
	MapHeaders: 0x94000,
	AreaNamesOffset: 0x1CA8C3,
	SpawnPointList: 0x152AB,
};

class Gen2Reader extends GBReader {
	constructor(romFile) {
		super(romFile);
		populateCharMap(this.CHARMAP);
	}
	
	readMaps() {
		let oldOff = this.offset;
		let mapData = {};
		
		const AREA_NAMES = 97; //TODO replace with way to read from ROM (there isn't)
		
		// First, read in the area names for our use
		let areaNames = this.readStridedData(OFFSETS.AreaNamesOffset, 4, AREA_NAMES).map(data=>{
			let ptr = GBReader.sameBankPtrToLinear(OFFSETS.AreaNamesOffset, data.readUint16(2));
			let str = this.readText(ptr);
			return str.toLowerCase().replace(/(\b[a-z])/g, c=>c.toUpperCase());
		});
		this.areas = areaNames;
		
		// Read in spawn points (a list with an FF sentinal)
		let spawnPoints = {};
		this.readStridedData(OFFSETS.SpawnPointList, 4, 0x200, true).map(data=>{
			let bank = data.readByte(0);
			let id = data.readByte(1);
			spawnPoints[bank] = spawnPoints[bank] || {};
			spawnPoints[bank][id] = {
				y : data.readByte(2),
				x : data.readByte(3),
			};
		});
		
		const MAP_HEADER_BYTES = 9;
		// Determine number of banks (First pointer points past the end of the list)
		//const MAP_BANKS = 26;
		const MAP_BANKS = (this.readUint16(OFFSETS.MapHeaders) - (OFFSETS.MapHeaders & 0xFFFF)) / 2;
		
		// Read the map header pointers
		let bankTable = this.readStridedData(OFFSETS.MapHeaders, 2, MAP_BANKS)
			.map(bankPtr => GBReader.sameBankPtrToLinear(OFFSETS.MapHeaders, bankPtr.readUint16(0)) )
		
		// Then, go through each bank and read the map data
		for (let b = 0; b < bankTable.length; b++) {
			let ptr = bankTable[b];
			let bankData = {};
			// Read in all of the map headers for this bank
			let mapTable = this.readStridedData(ptr, MAP_HEADER_BYTES, ((bankTable[b+1] - ptr)/MAP_HEADER_BYTES) || 12);
			// Go through each map header and read in the info for it.
			for (let m = 0; m < mapTable.length; m++)
			try {
				let mapHeader = mapTable[m].buffer;
				let mapHeaderReader = mapTable[m];
				if (mapHeader[0] !== 0x25) {
					//If a map header doesn't start with the bank 0x25, then it's probably not map header data anymore
					console.log(`Non 0x25 ${b+1}.${m+1}`);
					break; 
				}
				
				let info = { //basic info from map header 1
					bank: b+1, map: m+1,
					areaId: mapHeader[5],
					areaName: areaNames[mapHeader[5]],
					mapType: ENVIRONS[mapHeader[2]],
					warps: [ null ],
				};
				
				// Assign fly locations
				if (spawnPoints[b] && spawnPoints[b][m]) {
					let f = spawnPoints[b][m];
					info.spawnPoint = `${f.x},${f.y}`;
				}
				
				// Refine map types
				if (info.mapType === 'indoor') {
					if (mapHeader[1] == TILESET_POKECENTER) {
						info.mapType = 'center';
					} else if (mapHeader[1] == TILESET_MART) {
						info.mapType = 'mart';
					} else if (mapHeader[6] == MUSIC_GYM) {
						info.mapType = 'gym';
					}
				}
				
				// Move the read cursor to map data header
				this.offset = GBReader.sameBankPtrToLinear(OFFSETS.MapHeaders, mapHeaderReader.readUint16(3))
				this.skip(); // Skip boarder block info
				// Width and height are stored as blocks (2x2 walking tiles)
				info.height = this.readUint8() * 2;
				info.width = this.readUint8() * 2;
				this.skip(3); // Skip block pointer
				let scriptBank = this.readUint8();
				this.skip(2); // Skip script pointers
				
				let eventHeader = this.readUint16(); // Read event pointer
				
				let conns = this.readUint8(); //Read connections
				info.conns = {};
				if (conns & NORTH) info.conns.n = readConnectionInfo.call(this);
				if (conns & SOUTH) info.conns.s = readConnectionInfo.call(this);
				if (conns &  WEST) info.conns.w = readConnectionInfo.call(this);
				if (conns &  EAST) info.conns.e = readConnectionInfo.call(this);
				
				// Move the read cursor to the map event header
				this.offset = GBReader.romBankAddrToLinear(scriptBank, eventHeader);
				this.skip(2); //Skip two bytes of filler
				let w_len = this.readUint8(); //Read length of warp list
				for (let w = 0; w < w_len; w++) {
					info.warps.push({
						y: this.readUint8(),
						x: this.readUint8(),
						warp: this.readUint8(),
						bank: this.readUint8(),
						id: this.readUint8(),
					});
				}
				
				bankData[m+1] = info;
			} catch (e) {
				console.error(`Error reading map, skipping! Bank ${b+1}, Map ${m+1}: `, e);
				bankData[m+1] = { bank:b+1, map:m+1, error:'Invalid map data' };
				continue;
			}
			mapData[b+1] = bankData;
		}
		this.maps = mapData;
		return mapData;
		
		function readConnectionInfo() {
			let c = {
				bank: this.readUint8(),
				id: this.readUint8(),
			};
			this.skip(2+2+1); //skip strip pointer, location, and length
			this.skip(1); //skip map width
			c.y = this.readUint8(); //x offset
			c.x = this.readUint8(); //y offset
			return c;
		}
	}
}

module.exports = { Gen2Reader };


function populateCharMap(c) {
	c[0x4A] = 'PkMn'; //'πµ';
	//c[0x50] = String Terminator
	c[0x54] = "POKé";
	c[0x5B] = "PC";
	c[0x5C] = "TM";
	c[0x5D] = "TRAINER";
	c[0x5E] = "ROCKET";
	c[0x80] = 'A';
	c[0x81] = 'B';
	c[0x82] = 'C';
	c[0x83] = 'D';
	c[0x84] = 'E';
	c[0x85] = 'F';
	c[0x86] = 'G';
	c[0x87] = 'H';
	c[0x88] = 'I';
	c[0x89] = 'J';
	c[0x8A] = 'K';
	c[0x8B] = 'L';
	c[0x8C] = 'M';
	c[0x8D] = 'N';
	c[0x8E] = 'O';
	c[0x8F] = 'P';
	c[0x90] = 'Q';
	c[0x91] = 'R';
	c[0x92] = 'S';
	c[0x93] = 'T';
	c[0x94] = 'U';
	c[0x95] = 'V';
	c[0x96] = 'W';
	c[0x97] = 'X';
	c[0x98] = 'Y';
	c[0x99] = 'Z';
	c[0x9A] = '(';
	c[0x9B] = ')';
	c[0x9C] = ':';
	c[0x9D] = ';';
	c[0x9E] = '[';
	c[0x9F] = ']';
	c[0xA0] = 'a';
	c[0xA1] = 'b';
	c[0xA2] = 'c';
	c[0xA3] = 'd';
	c[0xA4] = 'e';
	c[0xA5] = 'f';
	c[0xA6] = 'g';
	c[0xA7] = 'h';
	c[0xA8] = 'i';
	c[0xA9] = 'j';
	c[0xAA] = 'k';
	c[0xAB] = 'l';
	c[0xAC] = 'm';
	c[0xAD] = 'n';
	c[0xAE] = 'o';
	c[0xAF] = 'p';
	c[0xB0] = 'q';
	c[0xB1] = 'r';
	c[0xB2] = 's';
	c[0xB3] = 't';
	c[0xB4] = 'u';
	c[0xB5] = 'v';
	c[0xB6] = 'w';
	c[0xB7] = 'x';
	c[0xB8] = 'y';
	c[0xB9] = 'z';
	c[0xD0] = "'d";
	c[0xD1] = '|';
	c[0xD2] = '~';
	c[0xD3] = '%';
	c[0xD4] = '&';
	c[0xD5] = '}';
	c[0xD6] = '@';
	c[0xE0] = "'";
	c[0xE1] = 'Pk'; //'π';
	c[0xE2] = 'Mn'; //'µ';
	c[0xE3] = '-';
	c[0xE6] = '?';
	c[0xE7] = '!';
	c[0xE8] = '.';
	c[0xE9] = '+';
	c[0xEA] = 'é';
	c[0xEB] = '→';
	c[0xEF] = '♂';
	c[0xF0] = '$';
	c[0xF1] = '×';
	c[0xF2] = '.';
	c[0xF3] = '/';
	c[0xF4] = ',';
	c[0xF5] = '♀';
	c[0xF6] = '0';
	c[0xF7] = '1';
	c[0xF8] = '2';
	c[0xF9] = '3';
	c[0xFA] = '4';
	c[0xFB] = '5';
	c[0xFC] = '6';
	c[0xFD] = '7';
	c[0xFE] = '8';
	c[0xFF] = '9';
}
