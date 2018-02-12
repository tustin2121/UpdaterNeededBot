// newspress/ledger/PC.js
// Various ledger items related to the PC

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

/** Indicates that the current box of the PC has changed. */
class PCBoxChanged extends LedgerItem {
	constructor(prev, curr) {
		super(1);
		this.prev = prev;
		this.curr = curr;
	}
}

/** Indicates that a PC's box has had its name changed. */
class PCBoxNameChanged extends LedgerItem {
	constructor(bn, prev, curr) {
		super(1);
		this.boxNum = bn;
		this.prev = prev;
		this.curr = curr;
	}
}

/** Indicates that a PC's box is now full. */
class PCBoxNowFull extends LedgerItem {
	constructor(bn, boxName, flavor) {
		super(1, {flavor});
		this.boxNum = bn;
		this.boxName = boxName;
	}
}

/** Indicates the PC is now completely full. */
class PCBoxesAllFull extends LedgerItem {
	constructor() {
		super(2);
	}
}

/////////////////// Advanced Items ///////////////////


module.exports = {
	PCBoxChanged, PCBoxNameChanged, PCBoxNowFull, PCBoxesAllFull,
};