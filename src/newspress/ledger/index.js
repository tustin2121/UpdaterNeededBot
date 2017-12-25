// newspress/ledger/index.js
// The Ledger class, and exports of all ledger item classes

class Ledger {
	constructor() {
		this.list = [];
		this.debuglog = new DebugLogs();
	}
	get log(){ return this.debuglog; }
	
	findAllItemsWithName(name) {
		let res = [];
		for (let item of this.list) {
			if (item.name === name) {
				res.push(item);
			}
		}
		return res;
	}
	add(item) { this.list.push(item); }
	addItem(item) { this.list.push(item); }
	removeItem(item) {
		let i = this.list.indexOf(item);
		if (i > -1) this.list.splice(i, 1);
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
