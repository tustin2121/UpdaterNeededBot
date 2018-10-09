// maptool romread/gen3.js
// The Generation 3 Rom Reader

const { MapNode } = require('../mapnode');
const { GBReader } = require('./base');

const MAP_TYPES = ['default','town','city','route','underground','underwater','default','default','indoor','secretbase'];

class Gen3Reader extends GBReader {
	constructor(romFile) {
		super(romFile);
		/** This ROM's string terminator character. */
		this.STR_TERM = 0x50; //?????????
		populateCharMap(this.CHARMAP);
		this._OFFSETS = {};
		this._LENGTHS = {};
		
	}
	
	load() {
		super.load();
		switch (this.romCode) {
			case 0x21A29A69: //Emerald
				this._OFFSETS = {
					MapBankPointers:0x00486578, //pointer to gMapGroups
					AreaNames:		0x005a147c, //pointer to gRegionMapEntries
					Pokecenter1Map: 0x00426f48, //pointer to PokemonCenter_1F_Layout
					Pokecenter2Map:	0x00427080, //pointer to PokemonCenter_2F_Layout
					MartMap: 		0x00427150, //pointer to Mart_Layout
				};
				this._MUSICS = {
					GYM: [364, 487],
					CENTER: [256, 400, 515],
				};
				this._LENGTHS = {
					NumMapBanks: 33,
					MapHeaderBytes: 9,
					MapBankSentinal: 0xF7F7F7F7,
				};
				break;
		}
	}
	
	readMaps() {
		let oldOff = this.offset;
		let mapData = [];
		const OFFSETS = this._OFFSETS;
		const TILESETS = this._TILESETS;
		const MUSICS = this._MUSICS;
		const LENGTHS = this._LENGTHS;
		
		const AREA_NAMES = LENGTHS.NumAreaNames; //TODO: find this
		let areaNames = []; //TODO
		this.offset = OFFSETS.AreaNames;
		for (let i = 0; i < NUM_AREA_NAMES; i++) {
			this.skip(4); //skip region map info we don't care about
			areaNames.push(this.readText().trim());
		}
		// https://github.com/pret/pokeemerald/blob/60dff848aace7226f903eb6759273c4b52ea1813/src/data/region_map/region_map_entries.h
		// https://github.com/pret/pokeemerald/blob/8defc345f09a53ecb501f1597b1b264d69992cdc/include/constants/region_map_sections.h
		
		const MAP_HEADER_BYTES = LENGTHS.MapHeaderBytes;
		const MAP_BANKS = LENGTHS.NumMapBanks;
		// https://github.com/pret/pokeemerald/blob/efebc51972b23ddffa2700b1dd6895d4728646a3/data/maps/groups.inc
		let bankTable = this.readStridedData(OFFSETS.MapHeaders, 4, MAP_BANKS)
			.map(bankPtr => bankPtr.readUint32(0) & 0x00FFFFFF );
		
		// Then, go through each bank and read the map header pointers
		for (let b = 0; b < bankTable.length; b++) {
			let ptr = bankTable[b];
			let bankData = [];
			let mapHeaders = [];
			this.offset = ptr;
			for (let i = 0; i < 100; i++) {
				let mapPtr = this.readUint32() & 0x00FFFFFF;
				if (mapPtr == 0 || mapPtr == LENGTHS.MapBankSentinal) break;
				let header = this.readBytes(MAP_HEADER_BYTES, mapPtr);
				mapHeaders.push(header);
			}
			
			for (let m = 0; m < mapHeaders.length; m++) 
			try {
				let data = mapHeaders[m];
				let layoutPtr = data.readUint32() & 0x00FFFFFF;
				let eventPtr = data.readUint32() & 0x00FFFFFF;
				let scriptPtr = data.readUint32() & 0x00FFFFFF;
				let mapConnsPtr = data.readUint32() & 0x00FFFFFF;
				let music = data.readUint16();
				data.skip(2);
				let areaId = data.readUint8();
				data.skip(1);
				let weather = data.readUint8();
				let mapType = data.readUint8();
				data.skip(3);
				let battleScene = data.readUint8();
				
				let layout = readLayout(layoutPtr);
				let gamedata = Object.assign({},
					readEvents(eventPtr), readConnections(mapConnsPtr),
				);
				
				let info = new MapNode(null, {
					bank: b+1, map: m+1,
					width: layout.width, height:layout.height,
					areaId, areaName: areaNames[areaId],
					mapType: MAP_TYPES[mapType],
					name: areaNames[areaId],
					gamedata: {},
				});
				
				// Refine map types
				if (info.mapType === 'indoor') {
					switch (battleScene) {
						case 0x01: info.mapType = 'gym'; break;
						case 0x04: info.attrs.e4 = 'e1'; break;
						case 0x05: info.attrs.e4 = 'e2'; break;
						case 0x06: info.attrs.e4 = 'e3'; break;
						case 0x07: info.attrs.e4 = 'e4'; break;
					}
					if (layoutPtr === OFFSETS.Pokecenter1Map) {
						info.mapType = 'center';
					} else if (layoutPtr === OFFSETS.Pokecenter2Map) {
						info.mapType = 'center2';
					} else if (layoutPtr === OFFSETS.MartMap) {
						info.mapType = 'mart';
					}
				}
				
				switch (info.mapType) {
					case 'gym': info.name += ' Gym'; break;
					case 'center': info.name += ' Pokémon Center'; break;
					case 'center2': info.name += ' Trading Center'; break;
					case 'mart': info.name += ' PokéMart'; break;
				}
				
				bankData[m+1] = info;
				//TODO https://github.com/pret/pokeemerald/tree/24f6484643ed3d7115fd4ebd92f254f224f1ca97/data/maps/PetalburgCity
				// https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/data/maps/PetalburgCity/header.inc
				// https://github.com/pret/pokeemerald/blob/efebc51972b23ddffa2700b1dd6895d4728646a3/data/layouts/PetalburgCity/layout.inc
			} catch (e) {
				console.error(`Error reading map, skipping! Bank ${b+1}, Map ${m+1}: `, e);
				bankData[m+1] = { bank:b+1, map:m+1, error:'Invalid map data' };
				continue;
			}
			
			mapData[b+1] = bankData;
		}
		
		this.maps = mapData;
		this.offset = oldOff;
		return { mapData };
		
		function readLayout(ptr) {
			let oldOff = this.offset;
			try {
				this.offset = ptr;
				return {
					width: this.readUint32(),
					height: this.readUint32(),
					borderPtr: this.readUint32(),
					blockDataPtr: this.readUint32(),
					tileset1: this.readUint32(),
					tileset2: this.readUint32(),
				};
			} finally {	
				this.offset = oldOff;
			}
		}
		function readEvents(ptr) {
			let oldOff = this.offset;
			try {
				let out = { events:[], warps:[] };
				this.offset = ptr;
				let nNpcs = this.readUint8();
				let nWarps = this.readUint8();
				let nCoord = this.readUint8();
				let nSigns = this.readUint8();
				
				let pNpcs = this.readUint32() & 0x00FFFFFF;
				let pWarps = this.readUint32() & 0x00FFFFFF;
				let pCoord = this.readUint32() & 0x00FFFFFF;
				let pSigns = this.readUint32() & 0x00FFFFFF;
				
				this.offset = pNpcs;
				for (let i = 0; i < nNpcs; i++) {
					//https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/asm/macros/map.inc#L17
					let npc = {
						id: this.readUint8(),
						type: 'g3:npc',
					};
					this.skip(3);
					npc.x = this.readUint16();
					npc.y = this.readUint16();
					npc.z = this.readUint8();
					npc.moveFn = this.readUint8();
					let rad = this.readUint8();
					npc.radius_y = (rad >> 4) & 0x0F;
					npc.radius_x = (rad) & 0x0F;
					this.skip(1+4+4+4);
					out.events.push(npc);
				}
				
				this.offset = pWarps;
				for (let i = 0; i < nWarps; i++) {
					//TODO https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/asm/macros/map.inc#L17
					let x = this.readUint16();
					let y = this.readUint16();
					let b = this.readUint8();
					let warp = this.readUint8();
					let id = this.readUint8();
					let bank = this.readUint8();
					out.warps[i] = {
						wn:i, type: 'g3:warp',
						x, y, warpType: warp, b, 
						id, bank,
					};
				}
				this.offset = pCoord;
				for (let i = 0; i < nCoord; i++) {
					out.events.push(readEvent());
				}
				this.offset = pSigns;
				for (let i = 0; i < nSigns; i++) {
					out.events.push(readEvent());
				}
				return out;
			} finally {	
				this.offset = oldOff;
			}
		}
		function readConnections(ptr) {
			let oldOff = this.offset;
			try {
				let out = { conns:{} };
				this.offset = ptr;
				let conns = this.readUint32();
				for (let i = 0; i < conns; i++) {
					let dir = this.readUint32();
					let off = this.readUint32();
					let bank = this.readUint8();
					let id = this.readUint8();
					this.skip(2);
					let x = 0, y = 0;
					switch (dir) {
						case 1: dir = 's'; x = off; break;
						case 2: dir = 'n'; x = off; break;
						case 3: dir = 'w'; y = off; break;
						case 4: dir = 'e'; y = off; break;
						case 5: dir = 'd'; break; //down / dive
						case 6: dir = 'u'; break; //up / emerge
					}
					out.conns[dir] = {
						dir, x, y, bank, id,
					}
				}
				return out;
			} finally {	
				this.offset = oldOff;
			}
		}
		function readEvent() {
			//TODO https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/asm/macros/map.inc#L17
			let evt = {
				id: i, type:'g3:coord',
				x: this.readUint16(),
				y: this.readUint16(),
				z: this.readUint8(),
				bgkind: this.readUint8(), //0 = trigger, 7 = hidden item, 8 = secret base event
				trigger: this.readUint16(), //trigger could be a weather id, 0 = bg event
			};
			if (evt.bgkind === 8) { //secret base event
				evt.baseid = this.readUint16(); 
				// https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/include/constants/secret_bases.h
			} else {
				evt.idx = this.readUint16(); //only valid for non-weather events
			}
			this.skip(2); //0
			this.skip(4); //script ptr
			return evt;
		}
	}
}

module.exports = { Gen3Reader };

// https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/charmap.txt
function populateCharMap(c) {
c[0x00] = ' ';
c[0x01] = 'À';
c[0x02] = 'Á';
c[0x03] = 'Â';
c[0x04] = 'Ç';
c[0x05] = 'È';
c[0x06] = 'É';
c[0x07] = 'Ê';
c[0x08] = 'Ë';
c[0x09] = 'Ì';
c[0x0B] = 'Î';
c[0x0C] = 'Ï';
c[0x0D] = 'Ò';
c[0x0E] = 'Ó';
c[0x0F] = 'Ô';
c[0x10] = 'Œ';
c[0x11] = 'Ù';
c[0x12] = 'Ú';
c[0x13] = 'Û';
c[0x14] = 'Ñ';
c[0x15] = 'ß';
c[0x16] = 'à';
c[0x17] = 'á';
c[0x19] = 'ç';
c[0x1A] = 'è';
c[0x1B] = 'é';
c[0x1C] = 'ê';
c[0x1D] = 'ë';
c[0x1E] = 'ì';
c[0x20] = 'î';
c[0x21] = 'ï';
c[0x22] = 'ò';
c[0x23] = 'ó';
c[0x24] = 'ô';
c[0x25] = 'œ';
c[0x26] = 'ù';
c[0x27] = 'ú';
c[0x28] = 'û';
c[0x29] = 'ñ';
c[0x2A] = 'º';
c[0x2B] = 'ª';
c[0x2C] = SUPER_ER ;
c[0x2D] = '&';
c[0x2E] = '+';
c[0x34] = 'Lv';
c[0x35] = '=';
c[0x51] = '¿';
c[0x52] = '¡';
c[0x53] = 'Pk';
c[0x54] = 'Mn';
//c[0x55 56 57 58 59] = POKEBLOCK ;
c[0x5A] = 'Í';
c[0x5B] = '%';
c[0x5C] = '(';
c[0x5D] = ')';
c[0x68] = 'â';
c[0x6F] = 'í';
c[0x79] = UP_ARROW ;
c[0x7A] = DOWN_ARROW ;
c[0x7B] = LEFT_ARROW ;
c[0x7C] = RIGHT_ARROW;
c[0xA1] = '0';
c[0xA2] = '1';
c[0xA3] = '2';
c[0xA4] = '3';
c[0xA5] = '4';
c[0xA6] = '5';
c[0xA7] = '6';
c[0xA8] = '7';
c[0xA9] = '8';
c[0xAA] = '9';
c[0xAB] = '!';
c[0xAC] = '?';
c[0xAD] = '.';
c[0xAE] = '-';
c[0xAF] = '·';
c[0xB0] = '…';
c[0xB1] = '“';
c[0xB2] = '”';
c[0xB3] = '‘';
c[0xB4] = '’';
c[0xB5] = '♂';
c[0xB6] = '♀';
c[0xB7] = '¥';
c[0xB8] = ',';
c[0xB9] = '×';
c[0xBA] = '/';
c[0xBB] = 'A';
c[0xBC] = 'B';
c[0xBD] = 'C';
c[0xBE] = 'D';
c[0xBF] = 'E';
c[0xC0] = 'F';
c[0xC1] = 'G';
c[0xC2] = 'H';
c[0xC3] = 'I';
c[0xC4] = 'J';
c[0xC5] = 'K';
c[0xC6] = 'L';
c[0xC7] = 'M';
c[0xC8] = 'N';
c[0xC9] = 'O';
c[0xCA] = 'P';
c[0xCB] = 'Q';
c[0xCC] = 'R';
c[0xCD] = 'S';
c[0xCE] = 'T';
c[0xCF] = 'U';
c[0xD0] = 'V';
c[0xD1] = 'W';
c[0xD2] = 'X';
c[0xD3] = 'Y';
c[0xD4] = 'Z';
c[0xD5] = 'a';
c[0xD6] = 'b';
c[0xD7] = 'c';
c[0xD8] = 'd';
c[0xD9] = 'e';
c[0xDA] = 'f';
c[0xDB] = 'g';
c[0xDC] = 'h';
c[0xDD] = 'i';
c[0xDE] = 'j';
c[0xDF] = 'k';
c[0xE0] = 'l';
c[0xE1] = 'm';
c[0xE2] = 'n';
c[0xE3] = 'o';
c[0xE4] = 'p';
c[0xE5] = 'q';
c[0xE6] = 'r';
c[0xE7] = 's';
c[0xE8] = 't';
c[0xE9] = 'u';
c[0xEA] = 'v';
c[0xEB] = 'w';
c[0xEC] = 'x';
c[0xED] = 'y';
c[0xEE] = 'z';
c[0xEF] = '▶';
c[0xF0] = ':';
c[0xF1] = 'Ä';
c[0xF2] = 'Ö';
c[0xF3] = 'Ü';
c[0xF4] = 'ä';
c[0xF5] = 'ö';
c[0xF6] = 'ü';
c[0xFC] = ''; //tall plus
c[0xFF] = '$';

c[0xFD] = [];
c[0xFD][0x01] = '{{player}}';
c[0xFD][0x06] = '{{rival}}';
c[0xFD][0x07] = 'Emerald';
c[0xFD][0x08] = 'Aqua';
c[0xFD][0x09] = 'Magma';
c[0xFD][0x0A] = 'Archie';
c[0xFD][0x0B] = 'Maxie';
c[0xFD][0x0C] = 'Kyogre';
c[0xFD][0x0D] = 'Groudon';
}
