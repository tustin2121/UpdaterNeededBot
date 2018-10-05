// newspress/modules/PC.js
// The PC reporting module

const { ReportingModule, Rule } = require('./_base');
const {
	ApiDisturbance, PCBoxChanged, PCBoxNameChanged, PCBoxNowFull, PCBoxesAllFull,
} = require('../ledger');

const RULES = [];

/**   ** PC Module **
 * Responsible for keeping track of PC activities beyond those involving pokemon
 * or items. For example: PC Box name changes, and Active PC box changes.
 */
class PCModule extends ReportingModule {
	constructor(config, memory) {
		super(config, memory);
		
		this.memory.fullPC = (this.memory.fullPC || false);
	}
	
	firstPass(ledger, { prev_api, curr_api }) {
		// Test for the existance of the PC boxes stuff
		if ((!!curr_api.pcBoxes) !== (!!prev_api.pcBoxes)) {
			ledger.addItem(new ApiDisturbance({
				reason: 'Irregular presense of PC boxes.',
				code: ApiDisturbance.INVALID_DATA,
				score: 5,
			}));
			return; //Can't do anything
		}
		if (!curr_api.pcBoxes) return; //Can't do anything
		
		let currChanged = false;
		for (let i = 0; i < curr_api.pcBoxes.length; i++) {
			let curr = curr_api.pcBoxes[i];
			let prev = prev_api.pcBoxes[i];
			if (!curr || !prev) continue;
			
			if (curr.isCurrent !== prev.isCurrent) currChanged = true;
			
			if (curr.name !== prev.name) {
				ledger.addItem(new PCBoxNameChanged(curr.num, prev.name, curr.name));
			}
			if (curr.isFull && !prev.isFull) {
				ledger.addItem(new PCBoxNowFull(curr.num, curr.name, Bot.runOpts('pcBoxRollover')?null:'noCatch'));
			}
		}
		
		if (currChanged) {
			let curr = curr_api.pcBoxes.filter(x=>x.isCurrent)[0];
			let prev = prev_api.pcBoxes.filter(x=>x.isCurrent)[0];
			if (curr.bn !== prev.bn) { //double check
				ledger.addItem(new PCBoxChanged(prev, curr));
			}
		}
		
		let fullPC = (curr_api.pcBoxes.filter(x=>x.isFull).length === 0);
		if (fullPC && !this.memory.fullPC) {
			this.memory.fullPC = true;
			ledger.addItem(new PCBoxesAllFull());
		}
		else if (!fullPC && this.memory.fullPC) {
			this.memory.fullPC = false;
			// No notices about this, as releases will be pleanty of notice
		}
	}
	
	secondPass(ledger) {
		RULES.forEach(rule=> rule.apply(ledger, this) );
	}
}

module.exports = PCModule;
