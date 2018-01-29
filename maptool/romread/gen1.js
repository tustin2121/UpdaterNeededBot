// maptool romread/gen1.js
// The Generation 1 Rom Reader

const { GBReader } = require('./base');

const EAST  = 1 << 0;
const WEST  = 1 << 1;
const SOUTH = 1 << 2;
const NORTH = 1 << 3;


class Ge12Reader extends GBReader {
	constructor(romFile) {
		super(romFile);
		populateCharMap(this.CHARMAP);
		
		// Hardcoded offsets into the ROM file
		this._OFFSETS = {
			MapPointers: 0x01AE, //(0:01AE)
			MapBanks: 0xC23D, //(3:423D)
			TownMapNamesOffset: 0x71473, //(1C:5473)
			TownMapExternalEntries: 0x71313, //(1C:5313)
			TownMapInternalEntries: 0x71382, //(1C:5382)
			
			SpawnPointList: 0x152AB,
		};
		// Hardcoded lengths for various ROM data
		this._LENGTHS = {
			NumMaps: 248,
			
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
		
		const NUM_MAPS = LENGTHS.NumMaps;
		
		// First, read in the area names for our use
		let areaNames = [];
		{	// Read in the town map name index
			// First, read in the "external map" entries, which are one-to-one with map ids
			this.offset = OFFSETS.TownMapExternalEntries;
			while (this.offset < OFFSETS.TownMapInternalEntries) {
				this.skip(); // Skip Town Map y/x location nibble
				let name = this.readUint16(); // Read pointer to name
				name = this.readText(GBReader.sameBankPtrToLinear(OFFSETS.TownMapNamesOffset, name), 0xFF);
				areaNames.push(name); 
			}
			// Then, read in the "internal map" entries, which apply to all maps until the given id
			while (true) {
				let mid = this.readUint8(); //read in mapid
				if (mid === 0xFF) break; //End of the list sentinel
				this.skip(); // Skip Town Map y/x location nibble
				let name = this.readUint16(); // Read pointer to name
				name = this.readText(GBReader.sameBankPtrToLinear(OFFSETS.TownMapNamesOffset, name), 0xFF);
				while (areaNames.length-1 < mid) {
					areaNames.push(name);
				}
			}
		}
		
		// Read the map header pointer tables
		let mapBanks = this.readStridedData(OFFSETS.MapBanks, 1, NUM_MAPS);
		let mapPointers = this.readStridedData(OFFSETS.MapPointers, 2, NUM_MAPS)
			.map((ptr, idx)=> GBReader.romBankAddrToLinear(mapBanks[idx].readUint8(0), ptr.readUint16(0)));
		
		// Go through each map pointer and read the map data
		for (let m = 0; m < mapPointers.length; m++) {
			let ptr = mapPointers[m];
			this.offset = ptr;
			let info = { 
				id: m, //0-based index
				areaName: areaNames[m],
				tileset: this.readUint8(),
				height: this.readUint8() * 2,
				width: this.readUint8() * 2,
			}; 
			this.skip(2); // Skip block pointer
			this.skip(2); // Skip texts pointer
			this.skip(2); // Skip scripts pointer
			
			let conns = this.readUint8(); //Read connections
			info.conns = {};
			if (conns & NORTH) info.conns.n = readConnectionInfo.call(this);
			if (conns & SOUTH) info.conns.s = readConnectionInfo.call(this);
			if (conns &  WEST) info.conns.w = readConnectionInfo.call(this);
			if (conns &  EAST) info.conns.e = readConnectionInfo.call(this);
			
			// Pointer to the data object (which is usually right after anyway)
			let dataOffset = this.readUint16();
			this.offset = GBReader.sameBankPtrToLinear(this.offset, dataOffset);
			
			this.skip(); // Skip border block
			let w_len = this.readUint8(); //Read length of warp list
			for (let w = 0; w < w_len; w++) {
				info.warps.push({
					y: this.readUint8(),
					x: this.readUint8(),
					warp: this.readUint8(),
					id: this.readUint8(),
				});
			}
		}
		
		return mapData;
		
		function readConnectionInfo() {
			let c = {
				__addr: this.offset.toString(16),
				id: this.readUint8(), // Map Id
			};
			this.skip(2); // Skip connection strip location
			this.skip(2); // Skip current map position
			this.skip(1); // Skip width of connection strip
			this.skip(1); // Skip map width
			c.y = this.readInt8(); // Y alignment (y coord of player when entering map)
			c.x = this.readInt8(); // X alignment (x coord of player when entering map)
			this.skip(2); // Skip window (position of upper left block after entering map)
			return c;
		}
		
		//TODO
		// The difference between gen 2 and gen 1:
		// Gen 2 is nice and neat in its code. Everything is in one place
		// Gen 1 has maps scattered EVERYWHERE inside the ROM. Also the Banks and 
		// Pointers to the proper headers are in two separate locations as well.
		
		// https://github.com/pret/pokered/blob/master/main.asm
		// https://github.com/pret/pokered/blob/master/home.asm
		// https://github.com/pret/pokered/blob/674b4dcc4aabde8b5556c0ed32383c32b11a4f0e/data/map_header_banks.asm
		// https://github.com/pret/pokered/blob/674b4dcc4aabde8b5556c0ed32383c32b11a4f0e/data/map_header_pointers.asm
		// https://github.com/pret/pokered/blob/master/data/mapHeaders/vermilioncity.asm
		// https://github.com/pret/pokered/blob/674b4dcc4aabde8b5556c0ed32383c32b11a4f0e/data/mapHeaders/ceruleancity.asm -- first header, last word is pointer to second header
		// https://github.com/pret/pokered/blob/674b4dcc4aabde8b5556c0ed32383c32b11a4f0e/data/mapObjects/ceruleancity.asm -- second header, warp list is first after border block byte
		// https://github.com/pret/pokered/blob/master/macros/data_macros.asm
		
		
	}
}

module.exports = { Gen1Reader };

// https://github.com/pret/pokered/blob/master/charmap.asm
function populateCharMap(c) {
	c[0x4A] = 'PkMn'; //'πµ';
	//c[0x50] = String Terminator
	c[0x52] = "{PLAYERNAME}";
	c[0x53] = "{RIVALNAME}";
	c[0x54] = '#';
	// c[0x54] = "POKé";
	c[0x59] = "{TARGET}";
	c[0x5A] = "{USER}";
	// c[0x5B] = "PC";
	// c[0x5C] = "TM";
	// c[0x5D] = "TRAINER";
	// c[0x5E] = "ROCKET";
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
	c[0xBA] = 'é';
	c[0xBB] = "'d";
	c[0xBC] = "'l";
	c[0xBD] = "'s";
	c[0xBE] = "'t";
	c[0xBF] = "'v";
	// c[0xD1] = '|';
	// c[0xD2] = '~';
	// c[0xD3] = '%';
	// c[0xD4] = '&';
	// c[0xD5] = '}';
	
	c[0xE0] = "'";
	c[0xE1] = 'Pk'; //'π';
	c[0xE2] = 'Mn'; //'µ';
	c[0xE3] = '-';
	c[0xE4] = "'r";
	c[0xE5] = "'m";
	c[0xE6] = '?';
	c[0xE7] = '!';
	c[0xE8] = '.';
	c[0xE9] = '+';
	
	// c[0xEB] = '→';
	c[0xEC] = '▷';
	c[0xED] = '▲';
	c[0xEE] = '▼';
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

