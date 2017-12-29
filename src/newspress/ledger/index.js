// newspress/ledger/index.js
// The Ledger class, and exports of all ledger item classes

const hash = require('object-hash');

const { LedgerItem } = require('./base');

class Ledger {
	constructor(clone=null) {
		if (clone instanceof Ledger) {
			this.list = clone.list.slice(); //make a new list of the same ledger items
			this.debuglog = clone.debuglog; //copy the reference of the debug log
		} else {
			this.list = [];
			this.debuglog = new DebugLogs();
		}
	}
	get log(){ return this.debuglog; }
	get length() { return this.list.length; }
	
	hash() { return hash(this.list); }
	
	addItem(item) {
		if (!(item instanceof LedgerItem))
			throw new TypeError('Added item must be a LedgerItem');
		this.list.push(item);
	}
	removeItem(item) {
		let i = this.list.indexOf(item);
		if (i > -1) return this.list.splice(i, 1);
		return null;
	}
	
	/** Finds all items with the given name. */
	findAllItemsWithName(name) {
		let res = [];
		for (let item of this.list) {
			if (item.name === name) {
				res.push(item);
			}
		}
		return res;
	}
	
	/** Sorts the ledger and drops all items below 1 importance. */
	finalize() {
		this.list.sort(LedgerItem.compare);
		let i = 0;
		for (i = 0; i < this.list.length; i++) {
			if (this.list[i].importance < 1) break;
		}
		this.list.length = i;
	}
	
	toXml(hkey) {
		let xml = `<Ledger `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `>`;
		for (let item of this.list){
			xml += item.toXml();
		}
		xml += `</Ledger>`;
		return xml;
	}
}
Ledger.prototype.add = Ledger.prototype.addItem;
Ledger.prototype.remove = Ledger.prototype.removeItem;

class DebugLogs {
	constructor() {
		//TODO
	}
	
	/**
	 * Logs the application of a rule in this pass.
	 * @param {RuleInstance} ruleInst - The instance of the rule applied
	 */
	ruleApplied(ruleInst) {
		
	}
}

module.exports = Object.assign({
	Ledger,
}, ...[
	require('./base'),
	require('./Pokemon'),
]);
