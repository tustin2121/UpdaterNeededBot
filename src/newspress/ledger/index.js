// newspress/ledger/index.js
// The Ledger class, and exports of all ledger item classes

const { LedgerItem } = require('./base');

class Ledger {
	constructor() {
		this.list = [];
		this.debuglog = new DebugLogs();
	}
	get log(){ return this.debuglog; }
	get length() { return this.list.length; }
	
	findAllItemsWithName(name) {
		let res = [];
		for (let item of this.list) {
			if (item.name === name) {
				res.push(item);
			}
		}
		return res;
	}
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
