// maptool romread/base.js
// The base class for reading ROM information we care about (maps)

const fs = require('fs');
const ByteBuffer = require('bytebuffer');

class RomReader {
	constructor(romFile) {
		this.maps = [];
		this.areas = [];
		
		this.romFile = romFile;
		this.data = null;
		/** This ROM'S character map. */
		this.CHARMAP = [];
		/** This ROM's string terminator character. */
		this.STR_TERM = 0x50;
	}
	getMap(id, bank=0) {
		return this.maps.filter(m=> m.id===id && m.bank===bank)[0];
	}
	getAreaName(id) {
		return this.areas[id];
	}
	
	load() {
		this.data = ByteBuffer.wrap(fs.readFileSync(this.romFile));
		this.data.LE(); //switch to Little Endian
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
}

class GBReader extends RomReader {
	constructor(romFile) {
		super(romFile);
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
		limit = limit || this.data.limit - offset;
		if (offset >= this.data.limit || limit === 0) return '';
		
		let str = [];
		for (let i = offset; i < this.data.limit; i++) {
			if (i >= this.data.limit) break;
			let char = this.readUint8(i);
			if (char === this.STR_TERM) break;
			str.push(this.CHARMAP[char] || ' ');
		}
		//Note: .length before join, because CHARMAP might not have 1 character long result
		if (advance) this.data.skip(str.length);
		return str.join('');
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

class DSReader extends RomReader {
	constructor(romFile) {
		super(romFile);
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

module.exports = { RomReader, GBReader, DSReader, }
