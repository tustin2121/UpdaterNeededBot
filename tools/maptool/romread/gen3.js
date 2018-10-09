// maptool romread/gen3.js
// The Generation 3 Rom Reader

const { MapNode } = require('../mapnode');
const { GBReader } = require('./base');

class Gen3Reader extends GBReader {
	constructor(romFile) {
		super(romFile);
		populateCharMap(this.CHARMAP);
		this._OFFSETS = {};
		this._LENGTHS = {};
	}
	
	load() {
		super.load();
		switch (this.romCode) {
			case 0x21A29A69: //Emerald
				this._OFFSETS = {
					MapBankPointers: 0x00486578,
				};
				this._TILESETS = {
					// Pokecenter: 0x07,
					// Mart: 0x0C,
				};
				this._MUSICS = {
					// MUSIC_GYM: 0x1B,
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
			let mapHeaders = [];
			this.offset = ptr;
			for (let i = 0; i < 100; i++) {
				let mapPtr = this.readUint32() & 0x00FFFFFF;
				if (mapPtr == 0 || mapPtr == LENGTHS.MapBankSentinal) break;
				let header = this.readBytes(MAP_HEADER_BYTES, mapPtr);
				mapHeaders.push(header);
			}
			
			for (let m = 0; m < mapHeaders.length; m++) {
				//TODO https://github.com/pret/pokeemerald/tree/24f6484643ed3d7115fd4ebd92f254f224f1ca97/data/maps/PetalburgCity
				// https://github.com/pret/pokeemerald/blob/24f6484643ed3d7115fd4ebd92f254f224f1ca97/data/maps/PetalburgCity/header.inc
				// https://github.com/pret/pokeemerald/blob/efebc51972b23ddffa2700b1dd6895d4728646a3/data/layouts/PetalburgCity/layout.inc
			}
		}
	}
}

module.exports = { Gen3Reader };