// maptool romread/tableread.js
// A reader which can read map tables copied from Spiky's DS Map Editor

const fs = require('fs');

class TableReaderGen4 {
	constructor(tableFile) {
		this.maps = [];
		
		this.tableFile = tableFile;
	}
	load() {
		let text = fs.readFileSync(this.tableFile);
		
	}
}

module.exports = { TableReaderGen4 };