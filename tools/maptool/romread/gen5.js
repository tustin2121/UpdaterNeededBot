// maptool romread/gen5.js
// The Generation 5 Rom Reader

const { DSReader } = require('./base');

class Gen5Reader extends DSReader {
	constructor(romFile) {
		super(romFile);
	}
	
	load() {
		super.load();
		this.offset = 0xC;
		this.gameName = (()=>{
			let gameId = this.readUint32();
			switch (gameId) { //Note: we only support USA versions
				case 0x4F425249: return 'Black';
				case 0x4F415249: return 'White';
				case 0x4F455249: return 'Black 2';
				case 0x4F445249: return 'White 2';
				default: throw new ReferenceError('Unsupported game ', gameId.toString(16));
			}
		})();
		return this;
	}
}

module.exports = { Gen5Reader };
