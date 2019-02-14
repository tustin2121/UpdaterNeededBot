// newspress/ledger/BurningRed.js
// Various ledger items related to BurningRed

const LOGGER = getLogger('BurningRed');
const { LedgerItem } = require('./base');

/** Indicates that we're currently in Red */
class Gen1Context extends LedgerItem {
	constructor() {
		super(2, { helps:true });
	}
}

/** Indicates that we're currently in FireRed */
class Gen3Context extends LedgerItem {
	constructor() {
		super(2, { helps:true });
	}
}

/** Indicates that we're currently in the process of warping to Gen 1 */
class BurningDownContext extends LedgerItem {
	constructor() {
		super(0);
	}
}

/** Indicates that we're currently in the process of warping to Gen 3 */
class BurningUpContext extends LedgerItem {
	constructor() {
		super(0);
	}
}

class BurningReport extends LedgerItem {
	constructor(flavor) {
		super(1, { flavor });
	}
}

module.exports = {
	Gen1Context, Gen3Context, 
	BurningDownContext, BurningUpContext, BurningReport,
};