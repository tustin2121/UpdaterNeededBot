// maptool romread/base.js
// The base class for reading ROM information we care about (maps)

const fs = require('fs');
const ByteBuffer = require('bytebuffer');

class RomReader {
	constructor(romFile) {
		this.maps = [];
		this.areas = [];
		
		this.romFile = romFile;
	}
	getMap(id, bank=0) {
		return this.maps.filter(m=> m.id===id && m.bank===bank)[0];
	}
	getAreaName(id) {
		return this.areas[id];
	}
}

class GBReader extends RomReader {
	constructor(romFile) {
		super(romFile);
		this.data = null;
		
		/** This ROM'S character map. */
		this.CHARMAP = [];
		/** This ROM's string terminator character. */
		this.STR_TERM = 0x50;
	}
	
	load() {
		this.data = ByteBuffer.wrap(fs.readFileSync(this.romFile));
		this.data.LE(); //switch to Little Endian
		return this;
	}
	
	get buffer() { return this.data.buffer; }
	get length() { return this.data.limit; }
	
	get offset() { return this.data.offset; }
	set offset(val) {
		if (val === undefined) throw new TypeError('Offset is being set to undefined!');
		if (typeof val !== 'number') throw new TypeError(`Illegal value for offset: ${val}!`);
		this.data.offset = val;
	}
	
	readFloat(offset) { return this.data.readFloat32(offset); }
	readFloat32(offset) { return this.data.readFloat32(offset); }
	
	readInt8(offset) { return this.data.readInt8(offset); }
	readInt16(offset) { return this.data.readInt16(offset); }
	readInt32(offset) { return this.data.readInt32(offset); }
	
	readUint8(offset) { return this.data.readUint8(offset); }
	readUint16(offset) { return this.data.readUint16(offset); }
	readUint32(offset) { return this.data.readUint32(offset); }
	
	skip(len=1) { this.data.skip(len); }
	
	skipPadding() {
		while((this.data.offset & 0xF) != 0) this.data.offset++;
		if (!this.data.noAssert) {
			if (this.data.offset > this.data.buffer.length)
				throw RangeError(`Skipped past end of data!`);
		}
	}
	
	readBytes(len) {
		return this.data.copy(this.data.offset, this.data.offset+len);
	}
	
	readStridedData(offset, stride, len=0, lenIsMax=false) {
		let choppedData = [];
		for (let i = 0; (i < len || len <= 0) && (offset + (stride * (i+1))) <= this.data.limit; i++) {
			let chunk = this.data.copy(offset + (stride * i), offset + (stride * (i+1)));
			if ((len <= 0 || lenIsMax) && chunk.readByte(0) == -1) {
				break;
			}
			choppedData.push(chunk);
		}
		return choppedData;
	}
	readText(offset, limit) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		limit = Math.min(offset+limit, this.data.limit) || this.data.limit;
		if (offset >= this.data.limit || limit === 0) return '';
		
		let str = [];
		for (let i = offset; i < limit; i++) {
			if (i >= this.data.limit) break;
			let char = this.readUint8(i);
			if (char === this.STR_TERM) break;
			str.push(this.CHARMAP[char] || ' ');
		}
		//Note: .length before join, because CHARMAP might not have 1 character long result
		if (advance) this.data.skip(str.length);
		return str.join('');
	}
	
	readRGBA(offset) {
		let le = this.data.littleEndian;
		let val;
		try {
			val = this.data.order(false).readUint32(offset);
		} finally {
			this.data.order(le);
		}
		return val;
	}
	
	static linearAddrToRomBank(linear) {
		let bank = linear >> 14;
		let addr = (linear % 0x4000) | (bank ? 0x4000 : 0);
		return { bank, addr };
	}
	static romBankAddrToLinear(bank, addr) {
		return (bank << 14) | (addr & 0x3FFF);
	}
	static sameBankPtrToLinear(baseAddr, ptr) {
		let addr = GBReader.linearAddrToRomBank(baseAddr);
		return GBReader.romBankAddrToLinear(addr.bank, ptr);
	}
	
	static convertText(text) {
		if (!text) return "";
		if (typeof text === 'string') return text;
		
		let charArray;
		if (text instanceof Buffer || text instanceof ByteBuffer) {
			charArray = [];
			for (let i = 0; i < text.length; i++) charArray.push(text[i]);
		} else if (Array.isArray(text)) {
			charArray = text;
		} else return "";
		
		let i = charArray.indexOf(this.STR_TERM);
		if (i >= 0) charArray.splice(i);
		return charArray.map(c=> this.CHARMAP[c]||' ').join('');
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Represents a NARC Archive in the DS Rom.
 */
class NarcArchive {
	// https://github.com/Dabomstew/universal-pokemon-randomizer/blob/master/src/com/dabomstew/pkrandom/newnds/NARCArchive.java
	// Note: This class uses the reverse strings for in-file magic numbers than the above class because it makes more sense to me.
	/**
	 * @param{ByteBuffer} data - the file to decompress
	 */
	constructor(data) {
		this.filenames = [];
		this.files = [];
		this.hasFilenames = false;
		
		let frames = {};
		let frameCount = data.LE().readUint16(0x0E);
		data.offset = 0x10;
		for (let i = 0; i < frameCount; i++) {
			let magicNum = String.fromCharCode(data.readUint8(), data.readUint8(), data.readUint8(), data.readUint8());
			let frameSize = data.readUint32();
			// Patch for BB/VW and other DS which don't update the size of their expanded NARCs correctly
			if (i === frameCount-1 && data.offset + frameSize < data.limit) {
				frameSize = data.remaining();
			}
			let frame = data.copy(data.offset, data.offset+frameSize);
			frames[magicNum] = frame;
			data.skip(frameSize);
		}
		
		if (!frames['BTAF'] || !frames['BTNF'] || !frames['GMIF']) {
			throw new ReferenceError('Invalid NARC file passed to NarcArchive!');
		}
		
		frames['BTNF'].offset = 0; // File names
		frames['BTAF'].offset = 0; // File contents
		let fileCount = frames['BTAF'].readUint32();
		this.hasFilenames = (frames['BTNF'].readUint32() === 8);
		for (let i = 0; i < fileCount; i++) {
			let startOff = frames['BTAF'].readUint32();
			let endOff = frames['BTAF'].readUint32();
			this.files.push(frames['GMIF'].copy(startOff, endOff));
			
			if (this.hasFilenames) {
				let nlen = frames['BTNF'].readUint8();
				this.filenames.push(frames['BTNF'].readString(nlen));
			} else {
				this.filenames.push(null);
			}
		}
	}
	
	getFile(filename) {
		
	}
}

const BLOCK_POWER = 12; //2^12 = 4KB
const BLOCK_MASK = ~((0xFFFFFFFF >> BLOCK_POWER) << BLOCK_POWER);
class DSReader extends RomReader {
	constructor(romFile) {
		super(romFile);
		/** @type{UInt32} */
		this.romCode = 0;
		
		/** @type{ByteBuffer} File Allocation Table */
		this.ARM9 = null;
		/** @type{ByteBuffer} File Allocation Table */
		this.FAT = null;
		/** @type{Map<string, NDSFile>} File list by file name */
		this.filesByPath = null;
		/** @type{Map<int, NDSFile>} File list by ID. */
		this.filesById = null;
		
		/** @type{Array<Arm9Overlay>} Array of arm9 overlays */
		this.arm9Overlays = null;
		/** @type{Map<int, Arm9Overlay>}  */
		this.arm9OverlaysByFileId = null;
		
		this._romHandle = null;
		this._stats = null;
		this._offset = 0;
		
		this._loadedBlockOffset = null;
		this._loadedBlockData = null;
	}
	
	//https://github.com/Dabomstew/universal-pokemon-randomizer/blob/master/src/com/dabomstew/pkrandom/newnds/NDSRom.java#L101
	load() {
		const path = require('path').posix;
		
		this._romHandle = fs.openSync(this.romFile, 'r');
		this._stats = fs.fstatSync(this.romFile);
		
		// Read the ROM code
		this.romCode = this.readUint32(0x0C);
		
		// Read in the FAT table
		this.offset = 0x40;
		let fntOff = this.readUint32(); //file name table
		let fntLen = this.readUint32();
		let fatOff = this.readUint32(); //file allocation table
		let farLen = this.readUint32();
		
		this.offset = fatOff;
		this.FAT = this.readBytes(farLen);
		
		this.offset = fntOff;
		let dirPaths = new Map();
		dirPaths[0xF000] = '';
		let dirCount = this.readUint16(fntOff + 0x06);
		this.files = new Map();
		this.filesById = new Map();
		
		// Read FNT table
		let fntTable = new Array(dirCount);
		for (let i = 0; i < dirCount && i < 0x1000; i++) {
			fntTable[i] = {
				subTableOff: this.readUint32() + fntOff,
				firstFileId: this.readUint16(),
				parentDirId: this.readUint16(),
				dirName: null,
			};
		}
		
		// Get directory names
		let fileNames = new Map(); //int => string
		let fileDirs = new Map(); //int => int
		firstPass:
		for (let dir = 0; dir < fntTable.length && dir < 0x1000; dir++) {
			const { subTableOff, firstFileId } = fntTable[dir];
			
			this.offset = subTableOff;
			while (true) {
				let ctrl = this.readUint8();
				if (ctrl == 0x00) break; //done
				
				let nameLen = ctrl & 0x7F;
				let name = this.readString(nameLen);
				if ((ctrl & 0x80) > 0x00) {
					// sub directory
					let subDirId = this.readUint16();
					fntTable[subDirId - 0xF000].dirName = name;
				} else {
					let fileId = firstFileId++;
					fileNames.set(fileId, name);
					fileDirs.set(fileId, dir);
				}
			}
		}
		
		// Construct full directory names
		for (let i = 0; i < dirCount && i < 0x1000; i++) {
			let { dirName } = fntTable[i];
			if (dirName !== null) {
				let fullDirName = '';
				let currDir = i;
				while (dirName) {
					fullDirName = path.join(dirName, fullDirName);
					let { parentDirId } = fntTable[currDir];
					if (parentDirId >= 0xF001 && parentDirId <= 0xFFFF) {
						currDir = parentDirId - 0xF000;
						({ dirName } = fntTable[currDir]);
					} else {
						break;
					}
				}
				this.dirPaths.set(i+0xF000, fullDirName);
			} else {
				this.dirPaths.set(i+0xF000, '');
			}
		}
		
		// Parse files
		for (const [fileId, filename] of fileNames) {
			const dir = fileDirs.get(fileId);
			const dirPath = this.dirPaths.get(dir + 0xF000);
			let nf = {
				fileId,
				fullPath: path.join(dirPath, filename),
				start: this.FAT.readUint32((fileId*8)+0),
				end:   this.FAT.readUint32((fileId*8)+4),
			};
			this.filesByPath.set(nf.fullPath, nf);
			this.filesById.set(fileId, nf);
		}
		
		// ARM9 Overlays
		const arm9_ovltableOff = this.readUint32(0x50);
		const arm9_ovltableSize = this.readUint32(0x54);
		const arm9_ovlCount = arm9_ovltableSize >> 5; // /32
		this.arm9Overlays = new Array(arm9_ovlCount);
		this.arm9OverlaysByFileId = new Map();
		this.offset = arm9_ovltableOff;
		
		for (let i = 0; i < arm9_ovlCount; i++) {
			this.skip(4);
			let overlay = {
				overlayId : i,
				ramAddress: this.readUint32(),
				ramSize: this.readUint32(),
				bssSize: this.readUint32(),
				staticStart: this.readUint32(),
				staticEnd: this.readUint32(),
				fileID: this.readUint32(),
			};
			let size = this.readUint32();
			overlay.compressedSize = (size & 0x00FFFFFF);
			overlay.compressFlag = (size & 0xFF000000) >>> 24;
			overlay.start = this.FAT.readUint32((overlay.fileId*8)+0);
			overlay.end   = this.FAT.readUint32((overlay.fileId*8)+4);
			this.arm9Overlays[i] = overlay;
			this.arm9OverlaysByFileId.set(i, overlay);
		}
		return this;
	}
	
	loadArm9() {
		if (this.ARM9) return this.ARM9;
		let arm9Off = this.readUint32(0x20);
		let arm9Size = this.readUint32(0x2C);
		let arm9 = this.readBytes(arm9Size, arm9Off);
		this.offset = arm9Off + arm9Size;
		
		let arm9Footer = [];
		let nitroCode = this.readUint32();
		if (nitroCode === 0xDEC00621) { //Found a footer
			this.offset -= 4;
			arm9Footer.push(this.readBytes(12));
		}
		
		// Any extras?
		while(_arm9_has_extras()) {
			// Append the extras from the end of the arm9 into the footer
			let foot = arm9.copy(arm9.limit - 12);
			arm9.limit -= 12;
			arm9Footer.unshift(foot);
		}
		
		// Compression?
		let arm9compressed = false;
		let flag = arm9.readUint8(arm9.limit-5);
		if (flag >= 0x08 && flag <= 0x0B) {
			let compressedSize = arm9.readUint32(arm9.limit - 8) & 0x00FFFFFF;
			if (compressedSize > (arm9.limit * 9/10) && compressedSize < (arm9.limit * 11/10)) {
				arm9compressed = true;
				// let foundOffsets = _search_for_compLen(arm9.limit);
				// if (foundOffsets.length === 1) {
				// 	//https://github.com/Dabomstew/universal-pokemon-randomizer/blob/master/src/com/dabomstew/pkrandom/newnds/NDSRom.java#L520
				// }
			}
		}
		
		//TODO https://github.com/Dabomstew/universal-pokemon-randomizer/blob/master/src/com/dabomstew/pkrandom/newnds/NDSRom.java#L481
		
		return (this.ARM9 = arm9);
		
		function _arm9_has_extras() {
			let _off = arm9.offset;
			arm9.offset = arm9.limit-12;
			const a = arm9.readUint32();
			const b = arm9.readUint32();
			const c = arm9.readUint32();
			arm9.offset = _off;
			return (c === 0) && (b === 0) && (a === 0 || a === 0xDEC00621);
		}
		
		// function _search_for_compLen(compLen) {
		// 	let needle = new Buffer([ // littleEndian
		// 		(compLen >>> 16) & 0xFF,
		// 		(compLen >>>  8) & 0xFF,
		// 		(compLen       ) & 0xFF,
		// 	]);
		// 	let res = [];
		// 	let BUF = arm9.buffer;
        //
		// 	for (let i = 0; i < arm9.limit; i++) {
		// 		if (BUF[ i ] !== needle[0]) continue;
		// 		if (BUF[i+1] !== needle[1]) continue;
		// 		if (BUF[i+2] !== needle[2]) continue;
		// 		res.push(i);
		// 	}
		// 	return res;
		// }
	}
	
	getFile(filename) {
		let file = this.filesByPath.get(filename);
		if (!file) return null;
		const { start, end } = file;
		return this.readBytes(end-start, start);
	}
	
	readNarc(entry) {
		return new NarcArchive(this.getFile(entry));
	}
	
	get buffer() { throw new TypeError('No buffer to get!'); }
	get length() { return this._stats.size; }
	
	get offset() { return this._offset; }
	set offset(val) {
		if (val === undefined) throw new TypeError('Offset is being set to undefined!');
		if (typeof val !== 'number') throw new TypeError(`Illegal value for offset: ${val}!`);
		this._offset = val;
	}
	
	
	_checkLoadBlock(offset, advance=0) {
		if (typeof offset !== 'number') {
			offset = this._offset;
			this._offset += advance;
		}
		let f_offset = (offset >> BLOCK_POWER) << BLOCK_POWER;
		if (!this._loadedBlockData) {
			this._loadedBlockData = ByteBuffer.allocate(Math.pow(2, BLOCK_POWER)+4, true);
		}
		if (this._loadedBlockOffset !== f_offset) {
			fs.readSync(this._romHandle, this._loadedBlockData.buffer, 0, this._loadedBlockData.limit, f_offset);
			this._loadedBlockOffset = f_offset;
		}
		return offset & BLOCK_MASK;
	}
	
	readFloat(offset) {
		offset = this._checkLoadBlock(offset, 4);
		return this._loadedBlockOffset.readFloat32(offset);
	}
	readFloat32(offset) {
		offset = this._checkLoadBlock(offset, 4);
		return this._loadedBlockOffset.readFloat32(offset);
	}
	
	readInt8(offset) {
		offset = this._checkLoadBlock(offset, 1);
		return this._loadedBlockOffset.readInt8(offset);
	}
	readInt16(offset) {
		offset = this._checkLoadBlock(offset, 2);
		return this._loadedBlockOffset.readInt16(offset);
	}
	readInt32(offset) {
		offset = this._checkLoadBlock(offset, 4);
		return this._loadedBlockOffset.readInt32(offset);
	}
	
	readUint8(offset) {
		offset = this._checkLoadBlock(offset, 1);
		return this._loadedBlockOffset.readUint8(offset);
	}
	readUint16(offset) {
		offset = this._checkLoadBlock(offset, 2);
		return this._loadedBlockOffset.readUint16(offset);
	}
	readUint32(offset) {
		offset = this._checkLoadBlock(offset, 4);
		return this._loadedBlockOffset.readUint32(offset);
	}
	
	readString(len, offset) {
		if (typeof len != 'number') throw new TypeError('Length required!');
		if (typeof offset !== 'number') {
			offset = this._offset;
			this._offset += len;
		}
		let start = (offset >> BLOCK_POWER) << BLOCK_POWER;
		let end = ((offset+len) >> BLOCK_POWER) << BLOCK_POWER;
		if (start == end) {
			offset = this._checkLoadBlock(offset, len);
			return this._loadedBlockOffset.readString(len, ByteBuffer.METRICS_CHARS, offset);
		} else {
			this.readBytes(len, offset).readString(len, 0);
		}
	}
	
	skip(len=1) {
		this.offset += len;
	}
	
	readBytes(len, offset) {
		if (typeof len != 'number') throw new TypeError('Length required!');
		if (typeof offset !== 'number') {
			offset = this._offset;
			this._offset += len;
		}
		let buf = ByteBuffer.allocate(len, true);
		fs.readSync(this._romHandle, buf.buffer, 0, buf.limit, offset);
		return buf;
	}
	
	/*
	readVector2(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let vec = new Vector2(
			this.data.readFloat32(offset),
			this.data.readFloat32(offset+4)
		);
		if (advance) this.data.skip(4*2);
		return vec;
	}
	readVector3(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let vec = new Vector3(
			this.data.readFloat32(offset),
			this.data.readFloat32(offset+4),
			this.data.readFloat32(offset+8)
		);
		if (advance) this.data.skip(4*3);
		return vec;
	}
	readVector4(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let vec = new Vector4(
			this.data.readFloat32(offset),
			this.data.readFloat32(offset+4),
			this.data.readFloat32(offset+8),
			this.data.readFloat32(offset+12)
		);
		if (advance) this.data.skip(4*4);
		return vec;
	}
	readQuaternion(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let vec = new Quaternion(
			this.data.readFloat32(offset),
			this.data.readFloat32(offset+4),
			this.data.readFloat32(offset+8),
			this.data.readFloat32(offset+12)
		);
		if (advance) this.data.skip(4*4);
		return vec;
	}
	
	readMatrix4(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let mat = new Matrix4();
		for (let i = 0; i < 16; i++) {
			mat.elements[i] = this.data.readFloat32(offset+(4*i));
		}
		if (advance) this.data.skip(4*16);
		return mat;
	}
	readMatrix3(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let mat = new Matrix3();
		for (let i = 0; i < 9; i++) {
			mat.elements[i] = this.data.readFloat32(offset+(4*i));
		}
		if (advance) this.data.skip(4*3);
		return mat;
	}
	readMatrix3x4(offset) {
		let advance = (offset === undefined);
		offset = offset || this.data.offset;
		let mat = new Matrix4();
		for (let i = 0; i < 12; i++) {
			mat.elements[i] = this.data.readFloat32(offset+(4*i));
		}
		if (advance) this.data.skip(4*12);
		return mat;
	}*/
}

// https://github.com/Dabomstew/universal-pokemon-randomizer/blob/master/src/cuecompressors/BLZCoder.java#L170
// function decodeBLZ(data) {
// 	if (!(data instanceof ByteBuffer)) throw new TypeError('data is not ByteBuffer');
//
// 	/** @type{ByteBuffer} packed and unpacked buffers */
// 	let pak_buffer, raw_buffer;
// 	let pak_len, raw_len, len, pos, inc_len, hdr_len, enc_len, dec_len;
// 	let flags = 0, mask = 0;
//
// 	pak_len = data.limit;
// 	pak_buffer = data.resize(data.limit + 3);
//
//
// 	inc_len = data.readUint32(pak_len - 4);
// 	if (inc_len < 1) {
// 		// not a coded file!
// 		raw_len = dec_len = pak_len;
// 		enc_len = pak_len = 0;
// 	} else {
// 		if (pak_len < 8) throw new ReferenceError('File has bad header!');
// 		hdr_len = pak_buffer.readUint8(pak_len - 5);
// 		if (hdr_len < 0x8 || hdr_len > 0xB) throw new ReferenceError('Bad header length!');
// 		if (pak_len <= hdr_len) throw new ReferenceError('Bad length!');
// 		enc_len = data.readUint32(pak_len - 8) & 0x00FFFFFF;
// 		dec_len = pak_len - enc_len;
// 		pak_len = enc_len - hdr_len;
// 		raw_len = dec_len + enc_len + inc_len;
// 		if (raw_len > 0x00FFFFFF) throw new ReferenceError('Bad decoder length!');
// 	}
// 	raw_buffer = ByteBuffer.allocate(raw_len);
// 	pak_end = dec_len + pak_len;
// 	raw_end = raw_len;
//
// 	pak_buffer.copyTo(raw_buffer, 0, 0, dec_len);
// 	pak_buffer.offset = dec_len;
// 	BLZInvert(pak_buffer, dec_len, pak_len);
//
// 	while (raw_buffer.remaining()) {
// 		if ((mask = (mask >>> 1)) === 0) {
// 			if (!pak_buffer.remaining()) break;
// 			flags = pak_buffer.readUint8();
// 			mask = 0x80;
// 		}
// 		if ((flags & mask) === 0) {
// 			if (!pak_buffer.remaining()) break;
// 			pos = pak_buffer.readUint16();
// 			len = (pos >>> 12) + 3; // BLZ_THRESHOLD + 1
// 			if (raw_buffer.offset + len > raw_buffer.limit) {
// 				throw new ReferenceError('Wrong decoded length!');
// 			}
// 			pos = (pos & 0xFFF) + 3;
//
//
// 		}
// 	}
//
// 	return;
//
// 	function BLZInvert(buf, off, len) {
// 		buf = buf.buffer;
// 		let bottom = off + len - 1;
// 		let ch;
// 		while(off < bottom) {
// 			ch = buf[off];
// 			buf[off++] = buf[bottom];
// 			buf[bottom--] = ch;
// 		}
// 	}
// }

module.exports = {
	RomReader, GBReader, DSReader,
	NarcArchive,
};
