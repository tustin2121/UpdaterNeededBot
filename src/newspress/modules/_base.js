// newspress/modules/_base.js
// The base classes for the module and ledger system

class ReportingModule {
	constructor(config, memory) {
		this.initConfig = config;
		this.memory = memory;
	}
	
	/**
	 * The first pass of this module. This pass takes in the API and Chat and outputs
	 * simple ledger items into the passed ledger.
	 */
	firstPass(ledger, { prev_api, curr_api, curr_chat }) {}
	
	/**
	 * The second pass of this module. This pass goes through transformation rules
	 * defined by this module and transforms the ledger.
	 */
	secondPass(ledger) {}
}

////////////////////////////////////////////////////////////////////////////////

const LOGGER = getLogger('Rule');

/** The static rule that will be applied on the second passes. */
class Rule {
	constructor(name) {
		// The name of this rule, for debugging purposes
		this.name = name;
		// The conditions that are tested against the ledger, selecting the ledger items they match
		this.conditions = [];
		// The results to be run on the items selected.
		this.resultBlocks = [];
	}
	apply(ledger) {
		let inst = new RuleInstance(this, ledger);
		LOGGER.trace(`Testing rule "${this.name}"`);
		for (let cond of this.conditions) {
			let res = cond(inst);
			if (inst.getResult() !== true)
			 	if (res !== true) return; //No match, go no further
		}
		LOGGER.debug(`Applying rule "${this.name}"`);
		for (let res of this.resultBlocks) {
			res(inst);
		}
		ledger.log.ruleApplied(inst);
	}
	/** Returns this object, for readable chaining. */
	get and() { return this; }
	/** Adds a condition to this rule, and returns this object for chaining. */
	when(condition) {
		this.conditions.push(condition);
		return this;
	}
	/** Adds a result block to this rule, and returns this object for chaining. */
	then(result) {
		this.resultBlocks.push(result);
		return this;
	}
}
/** The currently running instance of a rule that is being applied on the second pass. */
class RuleInstance {
	constructor(rule, ledger) {
		this.rule = rule;
		this.ledger = ledger;
		this.matchedItems = [];
		
		this.workingList = null;
		this.lastResult = null;
	}
	/** Not to be used outside of this file. Resets the working set of this instance. */
	getResult() {
		let res = this.lastResult;
		if (this.workingList && this.workingList.length) {
			this.matchedItems.push(this.workingList);
		}
		this.lastResult = null;
		this.workingList = null;
		return res;
	}
	
	/** Returns this object, for readable chaining. */
	get and() { return this; }
	/** Checks the ledger for one or more items with the given name. */
	has(itemName) {
		if (this.lastResult === false) return; //do nothing
		this.workingList = this.ledger.findAllItemsWithName(itemName);
		this.lastResult = (this.workingList.length > 0);
		return this;
	}
	/** Filters a previously found list of items to ones with the given property set to the given value. */
	with(prop, val) {
		if (this.lastResult === false) return; //do nothing
		if (!this.workingList || !this.workingList.length) {
			this.lastResult = false;
			return;
		}
		let list = this.workingList;
		this.workingList = [];
		for (let item of list) {
			if (item[prop] !== val) continue;
			this.workingList.push(item);
		}
		this.lastResult = (this.workingList.length > 0);
		return this;
	}
	/** Gets a previously found item. */
	get(idx) {
		return this.matchedItems[idx];
	}
	/** Gets a previously found item, and removes it from the ledger. */
	getAndRemove(idx) {
		let items = this.matchedItems[idx];
		if (items) {
			items.forEach((i)=>this.ledger.removeItem(i));
		}
		return items;
	}
	/** Adds a new item to the ledger. */
	add(item) {
		this.ledger.addItem(item);
	}
}
RuleInstance.prototype.remove = RuleInstance.prototype.getAndRemove;

/*
new Rule("Pokeballs lost in battle are thrown at the opponent")
	.when((ledger)=> ledger.has('LostItem').with('type', 'ball'))
	.when((ledger)=> ledger.has('InBattle'))
	.then((ledger)=>{
		let items = ledger.getAndRemove(0);
		items.forEach((i)=> ledger.add(new UsedBallInBattle(i)) );
	});
*/

module.exports = { ReportingModule, Rule };