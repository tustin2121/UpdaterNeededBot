// newspress/typesetter/PC.js
// The phrasebook for PC-related LedgerItems

module.exports = {
	PCBoxChanged: {
		// prev = Data on the previous box
		// curr = Data on the current box
		default: [
			`We change the current PC box to box #{{@curr}}.`,
		],
	},
	PCBoxNameChanged: {
		// boxNum = The number of the box
		// prev = The previous name of the box
		// curr = The current name of the box
		default: [
			`We rename Box #{{@boxNum}} to \`{{@curr}}\``,
		],
	},
	PCBoxNowFull: {
		// boxNum = The number of the box
		// boxName = The name of the box
		default: [
			`That catch fills up PC box {{@boxNum}}.`,
		],
		noCatch: [
			`<b>That catch fills up our current PC box!</b> We won't be able to catch any more pokemon until we change it.`,
		],
	},
	PCBoxesAllFull: {
		default: [
			`<b>That catch fills up our ENTIRE PC!</b>`,
		],
	},
};