// newspress/modules/PC.js
// The PC reporting module

const { ReportingModule, Rule } = require('./_base');

const RULES = [];

/**   ** PC Module **
 * Responsible for keeping track of PC activities beyond those involving pokemon
 * or items. For example: PC Box name changes, and Active PC box changes.
 */
class PCModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
	}
	
	firstPass(ledger, { prev_api:prev, curr_api:curr }) {
		
	}
}

module.exports = PCModule;
