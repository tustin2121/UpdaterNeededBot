// maptool romread/gen4.js
// The Generation 4 Rom Reader

const { DSReader } = require('./base');

const fs = require('fs');
const path = require('path');
const ByteBuffer = require('bytebuffer');

class Gen4Reader extends DSReader {
	constructor(romFile) {
		super(romFile);
		populateCharMap(this.CHARMAP);
		
		// Because DS Roms are all compressed and crap, it's better to just open up a pre-decompressed
		// version that is helpfully provided by SDSME (as that's how it accesses the files itself).
		// So make sure that directory is present.
		let p = path.parse(romFile);
		this.baseDir = path.join(p.dir, `${p.name}_SDSME`);
		if (!fs.statSync(this.baseDir).isDirectory()) {
			throw new ReferenceError('Please decompress the ROM using SDSME first!');
		}
	}
	
	load() {
		let gameId;
		let mainROM = fs.openSync(this.romFile, 'r');
		try {
			let bb = ByteBuffer.allocate(4).LE();
			fs.readSync(mainROM, bb.buffer, 0xC, 4);
			gameId = bb.readUint32();
		} finally {
			fs.closeSync(mainROM);
		}
		switch (gameId) { //Note: we only support USA versions
			case 0x45414441:
				this.gameInfo = { gameId,  name: 'Diamond', subGen: 1, };
				break;
			case 0x45415041:
				this.gameInfo = { gameId,  name: 'Pearl', subGen: 1, };
				break;
			case 0x45555043:
				this.gameInfo = { gameId,  name: 'Platinum', subGen: 2, };
				break;
			case 0x454B5049:
				this.gameInfo = { gameId,  name: 'HeartGold', subGen: 3, };
				break;
			case 0x45475049:
				this.gameInfo = { gameId,  name: 'SoulSilver', subGen: 3, };
				break;
			default: throw new ReferenceError('Unsupported game ', gameId.toString(16));
		}
		return this;
	}
	
	resolveFileForGame({ file, file1, file2, file3 }) {
		switch (this.gameInfo.subGen) {
			case 1: return path.join(this.baseDir, file1 || file);
			case 2: return path.join(this.baseDir, file2 || file);
			case 3: return path.join(this.baseDir, file3 || file);
		}
	}
	
	getFileForGame(opts={}) {
		return ByteBuffer.wrap(fs.readFileSync(this.resolveFileForGame(opts)));
	}
	
	/**
	 * @param{ByteBuffer} data - Data to read strings from.
	 */
	readNames(data) {
		// https://github.com/Skareeg/SDSME/blob/master/Source/Map_Editor/Form1%20Main%20Window.cs#L3390
		const strCount = data.readUint16();
		const initialKey = data.readUint16();
		let key1 = (initialKey * 0x2FD) & 0xFFFF;
		let key2 = 0;
		let realKey = 0;
		let specialCharON = false;
		let currInfo = new Array(strCount);
		for (let i = 0; i < strCount; i++) {
			key2 = (key1 * (i+1)) & 0xFFFF;
			realKey = key2 | (key2 << 16);
			currInfo[i] = {
				offset: (data.readUint32() ^ realKey),
				size: (data.readUint32() ^ realKey),
				text: null,
			};
		}
		for (let i = 0; i < strCount; i++) {
			key1 = (0x91BD3 * (i+1)) & 0xFFFF;
			data.offset = currInfo[i].offset;
			let text = '';
			for (let j = 0; j < currInfo[i].size; j++) {
				const ch = data.readUint16() ^ key1;
				switch (ch) {
					case 0xE000: text += '\n'; break;
					case 0x25BC: text += '\r'; break;
					case 0x25BD: text += '\f'; break;
					case 0xFFFE: text += '\v'; specialCharON = true; break;
					case 0xFFFF: text += ''; break;
					default: {
						if (specialCharON) {
							text += ch.toString(16);
							specialCharON = false;
						}
						else {
							text += (this.CHARMAP[ch] || String.fromCharCode(ch));
						}
					} break;
				}
				key1 += 0x493D;
				key1 &= 0xFFFF;
			}
			currInfo[i].text = text;
		}
		return currInfo.map(x=>x.text);
	}
	
	readMaps() {
		let mapData = {};
		const mapTable = this.getFileForGame({
			file:'data/fielddata/maptable/mapname.bin'
		});
		const headerCount = mapTable.limit >> 4; //divide by 16
		const mapNames = this.readNames(this.getFileForGame({ file:'data/a/0/2/text/0279' }));
		
		this.data = this.getFileForGame({ file:'arm9.bin' }).LE();
		this.offset = 0xF6BE0;
		const mapHeaders = [];
		
		for (let i = 0; i < headerCount; i++) {
			let mapName = '';
			for (let n = 0; n < 16; n++) {
				mapName += String.fromCharCode(mapNames.readUint8());
			}
			mapName = mapName.trim();
			
			mapHeaders.push({
				id: i,
				internalName: mapName,
				wildMon: this.readUint8(),
				_UNK1: this.readUint8(),
				tex1: this.readUint8(),
				tex2: this.readUint8(),
				matrix: this.readUint16(),
				scripts: this.readUint16(),
				lvlScripts: this.readUint16(),
				texts: this.readUint16(),
				musicDay: this.readUint16(),
				musicNight: this.readUint16(),
				events: this.readUint16(),
				name: mapNames[this.readUint8()],
				nameStyle: this.readUint8(),
				weather: this.readUint8(),
				camera: this.readUint8(),
				followMode: this.readUint8(),
				flags: this.readUint8(),
			}};
		}
		
		for (let mh of mapHeaders) {
			//TODO loop through maps and get information like warps, width/height, etc.
			let info = new MapNode({
				id: mh.id,
				name: mh.name,
				areaName: mh.internalName,
			});
			info.internalName = mh.internalName;
			
			// Roughly determine map type
			switch (mh.matrix) {
				case '0': info.type = 'route'; break; // The overworld
				case '2': info.type = 'underground'; break; // The Underground
			}
			// determine caves by texture type, perhaps
			
			
			
			
			mapData[info.id] = info;
		}
		
		
		this.maps = mapData;
		this.data = null;
		return { mapData };
	}
}

module.exports = { Gen4Reader };


function populateCharMap(c) {
	c[0x0000] = '\u0000';
	c[0x0001] = '\u0001';
	
	c[0x00A2] = '０';
	c[0x00A3] = '１';
	c[0x00A4] = '２';
	c[0x00A5] = '３';
	c[0x00A6] = '４';
	c[0x00A7] = '５';
	c[0x00A8] = '６';
	c[0x00A9] = '７';
	c[0x00AA] = '８';
	c[0x00AB] = '９';
	c[0x00AC] = 'Ａ';
	c[0x00AD] = 'Ｂ';
	c[0x00AE] = 'Ｃ';
	c[0x00AF] = 'Ｄ';
	c[0x00B0] = 'Ｅ';
	c[0x00B1] = 'Ｆ';
	c[0x00B2] = 'Ｇ';
	c[0x00B3] = 'Ｈ';
	c[0x00B4] = 'Ｉ';
	c[0x00B5] = 'Ｊ';
	c[0x00B6] = 'Ｋ';
	c[0x00B7] = 'Ｌ';
	c[0x00B8] = 'Ｍ';
	c[0x00B9] = 'Ｎ';
	c[0x00BA] = 'Ｏ';
	c[0x00BB] = 'Ｐ';
	c[0x00BC] = 'Ｑ';
	c[0x00BD] = 'Ｒ';
	c[0x00BE] = 'Ｓ';
	c[0x00BF] = 'Ｔ';
	c[0x00C0] = 'Ｕ';
	c[0x00C1] = 'Ｖ';
	c[0x00C2] = 'Ｗ';
	c[0x00C3] = 'Ｘ';
	c[0x00C4] = 'Ｙ';
	c[0x00C5] = 'Ｚ';
	c[0x00C6] = 'ａ';
	c[0x00C7] = 'ｂ';
	c[0x00C8] = 'ｃ';
	c[0x00C9] = 'ｄ';
	c[0x00CA] = 'ｅ';
	c[0x00CB] = 'ｆ';
	c[0x00CC] = 'ｇ';
	c[0x00CD] = 'ｈ';
	c[0x00CE] = 'ｉ';
	c[0x00CF] = 'ｊ';
	c[0x00D0] = 'ｋ';
	c[0x00D1] = 'ｌ';
	c[0x00D2] = 'ｍ';
	c[0x00D3] = 'ｎ';
	c[0x00D4] = 'ｏ';
	c[0x00D5] = 'ｐ';
	c[0x00D6] = 'ｑ';
	c[0x00D7] = 'ｒ';
	c[0x00D8] = 'ｓ';
	c[0x00D9] = 'ｔ';
	c[0x00DA] = 'ｕ';
	c[0x00DB] = 'ｖ';
	c[0x00DC] = 'ｗ';
	c[0x00DD] = 'ｘ';
	c[0x00DE] = 'ｙ';
	c[0x00DF] = 'ｚ';
	c[0x00E1] = '！';
	c[0x00E2] = '？';
	c[0x00E3] = '、';
	c[0x00E4] = '。';
	c[0x00E5] = '⋯';
	c[0x00E6] = '・';
	c[0x00E7] = '／';
	c[0x00E8] = '「';
	c[0x00E9] = '」';
	c[0x00EA] = '『';
	c[0x00EB] = '』';
	c[0x00EC] = '（';
	c[0x00ED] = '）';
	c[0x00EE] = '㊚';
	c[0x00EF] = '㊛';
	c[0x00F0] = '＋';
	c[0x00F1] = '－';
	c[0x00F2] = '⊗';
	c[0x00F3] = '⊘';
	c[0x00F4] = '＝';
	c[0x00F5] = 'ｚ';
	c[0x00F6] = '：';
	c[0x00F7] = '；';
	c[0x00F8] = '．';
	c[0x00F9] = '，';
	c[0x00FA] = '♤';
	c[0x00FB] = '♧';
	c[0x00FC] = '♡';
	c[0x00FD] = '♢';
	c[0x00FE] = '☆';
	c[0x00FF] = '◎';
	c[0x0100] = '○';
	c[0x0101] = '□';
	c[0x0102] = '△';
	c[0x0103] = '◇';
	c[0x0104] = '＠';
	c[0x0105] = '♫';
	c[0x0106] = '％';
	c[0x0107] = '☼';
	c[0x0108] = '☔';
	c[0x0109] = '☰';
	c[0x010A] = '❄';
	c[0x010B] = '☋';
	c[0x010C] = '♔';
	c[0x010D] = '♕';
	c[0x010E] = '☊';
	c[0x010F] = '⇗';
	c[0x0110] = '⇘';
	c[0x0111] = '☾';
	c[0x0112] = '¥';
	
	c[0x011B] = '←';
	c[0x011C] = '↑';
	c[0x011D] = '↓';
	c[0x011E] = '→';
	c[0x011F] = '‣';
	c[0x0120] = '＆';
	c[0x0121] = '0';
	c[0x0122] = '1';
	c[0x0123] = '2';
	c[0x0124] = '3';
	c[0x0125] = '4';
	c[0x0126] = '5';
	c[0x0127] = '6';
	c[0x0128] = '7';
	c[0x0129] = '8';
	c[0x012A] = '9';
	c[0x012B] = 'A';
	c[0x012C] = 'B';
	c[0x012D] = 'C';
	c[0x012E] = 'D';
	c[0x012F] = 'E';
	c[0x0130] = 'F';
	c[0x0131] = 'G';
	c[0x0132] = 'H';
	c[0x0133] = 'I';
	c[0x0134] = 'J';
	c[0x0135] = 'K';
	c[0x0136] = 'L';
	c[0x0137] = 'M';
	c[0x0138] = 'N';
	c[0x0139] = 'O';
	c[0x013A] = 'P';
	c[0x013B] = 'Q';
	c[0x013C] = 'R';
	c[0x013D] = 'S';
	c[0x013E] = 'T';
	c[0x013F] = 'U';
	c[0x0140] = 'V';
	c[0x0141] = 'W';
	c[0x0142] = 'X';
	c[0x0143] = 'Y';
	c[0x0144] = 'Z';
	c[0x0145] = 'a';
	c[0x0146] = 'b';
	c[0x0147] = 'c';
	c[0x0148] = 'd';
	c[0x0149] = 'e';
	c[0x014A] = 'f';
	c[0x014B] = 'g';
	c[0x014C] = 'h';
	c[0x014D] = 'i';
	c[0x014E] = 'j';
	c[0x014F] = 'k';
	c[0x0150] = 'l';
	c[0x0151] = 'm';
	c[0x0152] = 'n';
	c[0x0153] = 'o';
	c[0x0154] = 'p';
	c[0x0155] = 'q';
	c[0x0156] = 'r';
	c[0x0157] = 's';
	c[0x0158] = 't';
	c[0x0159] = 'u';
	c[0x015A] = 'v';
	c[0x015B] = 'w';
	c[0x015C] = 'x';
	c[0x015D] = 'y';
	c[0x015E] = 'z';
	c[0x015F] = 'À';
	c[0x0160] = 'Á';
	c[0x0161] = 'Â';
	c[0x0162] = 'Ã';
	c[0x0163] = 'Ä';
	c[0x0164] = 'Å';
	c[0x0165] = 'Æ';
	c[0x0166] = 'Ç';
	c[0x0167] = 'È';
	c[0x0168] = 'É';
	c[0x0169] = 'Ê';
	c[0x016A] = 'Ë';
	c[0x016B] = 'Ì';
	c[0x016C] = 'Í';
	c[0x016D] = 'Î';
	c[0x016E] = 'Ï';
	c[0x016F] = 'Ð';
	c[0x0170] = 'Ñ';
	c[0x0171] = 'Ò';
	c[0x0172] = 'Ó';
	c[0x0173] = 'Ô';
	c[0x0174] = 'Õ';
	c[0x0175] = 'Ö';
	c[0x0176] = '×';
	c[0x0177] = 'Ø';
	c[0x0178] = 'Ù';
	c[0x0179] = 'Ú';
	c[0x017A] = 'Û';
	c[0x017B] = 'Ü';
	c[0x017C] = 'Ý';
	c[0x017D] = 'Þ';
	c[0x017E] = 'ß';
	c[0x017F] = 'à';
	c[0x0180] = 'á';
	c[0x0181] = 'â';
	c[0x0182] = 'ã';
	c[0x0183] = 'ä';
	c[0x0184] = 'å';
	c[0x0185] = 'æ';
	c[0x0186] = 'ç';
	c[0x0187] = 'è';
	c[0x0188] = 'é';
	c[0x0189] = 'ê';
	c[0x018A] = 'ë';
	c[0x018B] = 'ì';
	c[0x018C] = 'í';
	c[0x018D] = 'î';
	c[0x018E] = 'ï';
	c[0x018F] = 'ð';
	c[0x0190] = 'ñ';
	c[0x0191] = 'ò';
	c[0x0192] = 'ó';
	c[0x0193] = 'ô';
	c[0x0194] = 'õ';
	c[0x0195] = 'ö';
	c[0x0196] = '÷';
	c[0x0197] = 'ø';
	c[0x0198] = 'ù';
	c[0x0199] = 'ú';
	c[0x019A] = 'û';
	c[0x019B] = 'ü';
	c[0x019C] = 'ý';
	c[0x019D] = 'þ';
	c[0x019E] = 'ÿ';
	c[0x019F] = 'Œ';
	c[0x01A0] = 'œ';
	c[0x01A1] = 'Ş';
	c[0x01A2] = 'ş';
	c[0x01A3] = 'ª';
	c[0x01A4] = 'º';
	c[0x01A5] = '¹';
	c[0x01A6] = '²';
	c[0x01A7] = '³';
	c[0x01A8] = '$';
	c[0x01A9] = '¡';
	c[0x01AA] = '¿';
	c[0x01AB] = '!';
	c[0x01AC] = '?';
	c[0x01AD] = ',';
	c[0x01AE] = '.';
	c[0x01AF] = '…';
	c[0x01B0] = '·';
	c[0x01B1] = '/';
	c[0x01B2] = '‘';
	c[0x01B3] = '’';
	c[0x01B4] = '“';
	c[0x01B5] = '”';
	c[0x01B6] = '„';
	c[0x01B7] = '《';
	c[0x01B8] = '》';
	c[0x01B9] = '(';
	c[0x01BA] = ')';
	c[0x01BB] = '♂';
	c[0x01BC] = '♀';
	c[0x01BD] = '+';
	c[0x01BE] = '-';
	c[0x01BF] = '*';
	c[0x01C0] = '#';
	c[0x01C1] = '=';
	c[0x01C2] = '&';
	c[0x01C3] = '~';
	c[0x01C4] = ':';
	c[0x01C5] = ';';
	c[0x01C6] = '♠';
	c[0x01C7] = '♣';
	c[0x01C8] = '♥';
	c[0x01C9] = '♦';
	c[0x01CA] = '★';
	c[0x01CB] = '◉';
	c[0x01CC] = '●';
	c[0x01CD] = '■';
	c[0x01CE] = '▲';
	c[0x01CF] = '◆';
	c[0x01D0] = '@';
	c[0x01D1] = '♪';
	c[0x01D2] = '%';
	c[0x01D3] = '☀';
	c[0x01D4] = '☁';
	c[0x01D5] = '☂';
	c[0x01D6] = '☃';
	c[0x01D7] = '☺';
	c[0x01D8] = '♚';
	c[0x01D9] = '♛';
	c[0x01DA] = '☹';
	c[0x01DB] = '↗';
	c[0x01DC] = '↘';
	c[0x01DD] = '☽';
	c[0x01DE] = ' ';
	c[0x01DF] = '⁴';
	c[0x01E0] = 'Pk';
	c[0x01E1] = 'Mn';
	c[0x01E8] = '°';
	c[0x01E9] = '_';
	c[0x01EA] = '＿';
}

