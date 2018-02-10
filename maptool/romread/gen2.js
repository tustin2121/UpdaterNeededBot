// maptool romread/gen2.js
// The Generation 2 Rom Reader

const { GBReader } = require('./base');

const EAST  = 1 << 0;
const WEST  = 1 << 1;
const SOUTH = 1 << 2;
const NORTH = 1 << 3;

//https://github.com/pret/pokecrystal/blob/master/constants/script_constants.asm#L78
const BGEVENTS = ['READ','UP','DOWN','RIGHT','LEFT','IFSET','IFNOTSET','ITEM','COPY'];
const SPRITEMOVEDATA = [
	//https://github.com/pret/pokecrystal/blob/master/constants/sprite_data_constants.asm#L40
	0x00, 'ITEM_TREE', 'WANDER', 'SPINRANDOM_SLOW',
	'WALK_UP_DOWN', 'WALK_LEFT_RIGHT',
	'STANDING_DOWN','STANDING_UP','STANDING_LEFT','STANDING_RIGHT',
	'SPINRANDOM_FAST', 'PLAYER',
	0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12,
	'FOLLOWING','SCRIPTED','SNORLAX','POKEMON','SUDOWOODO',
	'SMASHABLE_ROCK','STRENGTH_BOULDER','FOLLOWNOTEXACT','SHADOW','EMOTE',
	'SCREENSHAKE','SPIN_CCW','SPIN_CC',0x20,'BIGDOLL','BOULDERDUST','GRASS','LAPRAS',
];
const OBJECTTYPE = ['SCRIPT','ITEMBALL','TRAINER',3,4,5,6];

const ENVIRONS = [ null, "town", "route", "indoor", "cave", null, "gate", "dungeon", ];
// Notes:
/// Caves and Dungeons can be dug out of
/// Routes and Towns are considered outdoor maps

const TILESET_POKECENTER = 0x07;
const TILESET_MART = 0x0C;
const MUSIC_GYM = 0x1B;

class Gen2Reader extends GBReader {
	constructor(romFile) {
		super(romFile);
		populateCharMap(this.CHARMAP);
		
		// Hardcoded offsets into the ROM file
		this._OFFSETS = {
			MapHeaders: 0x94000,
			AreaNamesOffset: 0x1CA8C3,
			SpawnPointList: 0x152AB,
		};
		// Hardcoded lengths for various ROM data
		this._LENGTHS = {
			NumAreaNames: 97,
			MaxSpawnPoints: 0x200,
			MapHeaderBytes: 9,
			DefaultMapBankLength: 12,
			MapBankSentinal: 0x25, //specifically a sentinal if the data ISN'T this, an anti-sentinal if you will
		};
	}
	
	readMaps() {
		let oldOff = this.offset;
		let mapData = {};
		const OFFSETS = this._OFFSETS;
		const LENGTHS = this._LENGTHS;
		
		const AREA_NAMES = LENGTHS.NumAreaNames; //TODO replace with way to read from ROM (there isn't)
		
		// First, read in the area names for our use
		let areaNames = this.readStridedData(OFFSETS.AreaNamesOffset, 4, AREA_NAMES).map(data=>{
			let ptr = GBReader.sameBankPtrToLinear(OFFSETS.AreaNamesOffset, data.readUint16(2));
			let str = this.readText(ptr);
			return str.toLowerCase().replace(/(\b[a-z])/g, c=>c.toUpperCase());
		});
		this.areas = areaNames;
		
		// Read in spawn points (a list with an FF sentinal)
		let spawnPoints = {};
		let spawnList = [];
		this.readStridedData(OFFSETS.SpawnPointList, 4, LENGTHS.MaxSpawnPoints, true).map(data=>{
			let bank = data.readByte(0);
			let id = data.readByte(1);
			spawnPoints[bank] = spawnPoints[bank] || {};
			spawnPoints[bank][id] = {
				y : data.readByte(2),
				x : data.readByte(3),
			};
			spawnList.push(`${bank}.${id}`);
		});
		
		const MAP_HEADER_BYTES = LENGTHS.MapHeaderBytes;
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
			let mapTable = this.readStridedData(ptr, MAP_HEADER_BYTES, ((bankTable[b+1] - ptr)/MAP_HEADER_BYTES) || LENGTHS.DefaultMapBankLength);
			// Go through each map header and read in the info for it.
			for (let m = 0; m < mapTable.length; m++)
			try {
				let mapHeader = mapTable[m].buffer;
				let mapHeaderReader = mapTable[m];
				if (mapHeader[0] !== LENGTHS.MapBankSentinal) {
					//If a map header doesn't start with the bank 0x25, then it's probably not map header data anymore
					console.log(`Non 0x${LENGTHS.MapBankSentinal.toString(16)} ${b+1}.${m+1}`);
					break;
				}
				
				let info = { //basic info from map header 1
					bank: b+1, map: m+1,
					areaId: mapHeader[5],
					areaName: areaNames[mapHeader[5]],
					mapType: ENVIRONS[mapHeader[2]],
					width: null, height: null,
					warps: [ null ],
					conns: {},
					events: [],
					name: areaNames[mapHeader[5]],
					attrs: {},
					locOf: {},
				};
				
				// Assign fly locations
				if (spawnPoints[b] && spawnPoints[b][m]) {
					let f = spawnPoints[b][m];
					info.locOf.spawnPoint = `${f.x},${f.y}`;
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
				
				let c_len = this.readUint8(); //Read coord event length
				for (let e = 0; e < c_len; e++) {
					info.events.push({
						type: 'coord',
						sceneId: this.readUint8(),
						y: this.readUint8(),
						x: this.readUint8(),
					});
					this.skip(1+2+1+1); //Skip filler and script pointer
				}
				
				let b_len = this.readUint8(); //Read BG event length
				for (let e = 0; e < c_len; e++) {
					info.events.push({
						type: 'bg',
						y: this.readUint8(),
						x: this.readUint8(),
						bgType: BGEVENTS[this.readUint8()],
					});
					this.skip(2); //Skip script pointer
				}
				
				let e_len = this.readUint8(); //Read Object event length
				for (let e = 0; e < c_len; e++) {
					let item = {
						type: 'object',
						sprite: this.readUint8(),
						y: this.readUint8(),
						x: this.readUint8(),
						moveFn: SPRITEMOVEDATA[this.readUint8()],
					};
					let radius = this.readUint8();
					item.radius_y = (radius >> 4);
					item.radius_x = (radius & 0x0F);
					
					let h1 = this.readUint8(); //read hour limits
					let h2 = this.readUint8();
					if (h1 < h2) item.hours = `appears between ${h1}-${h2}`;
					else if (h1 > h2) item.hours = `vanishes between ${h2}-${h1}`;
					else if (h1===h2) item.hours = `always`;
					else if (h1===-1) {
						let timesOfDay = [];
						if (h2 & (1 << 0)) timesOfDay.push('MORN');
						if (h2 & (1 << 1)) timesOfDay.push('DAY');
						if (h2 & (1 << 2)) timesOfDay.push('NIGHT');
						if (h2 & (1 << 3)) timesOfDay.push('DARKNESS');
						item.hours = timesOfDay.join(',');
					}
					let colorfn = this.readUint8();
					item.objectType = OBJECTTYPE[colorfn & 0x0F];
					item.sightRange = this.readUint8();
					this.skip(2); //Skip script pointer
					item.eventFlag = this.readUint16();
					info.events.push(item);
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
		this.offset = oldOff;
		return { mapData, spawnList, spawnPoints };
		
		function readConnectionInfo() {
			let c = {
				__addr: this.offset.toString(16),
				bank: this.readUint8(),
				id: this.readUint8(),
			};
			this.skip(2+2+1); //skip strip pointer, location, and length
			this.skip(1); //skip map width
			c.y = this.readInt8(); //x offset
			c.x = this.readInt8(); //y offset
			this.skip(2); //skip window
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
