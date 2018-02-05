// newspress/ledger/index.js
// The Ledger class, and exports of all ledger item classes

const hash = require('object-hash');

const { LedgerItem } = require('./base');

class Ledger {
	constructor(clone=null) {
		if (clone instanceof Ledger) {
			this.list = clone.list.slice(); //make a new list of the same ledger items
			this.debuglog = clone.debuglog; //copy the reference of the debug log
			this.postponeList = [];
		} else {
			this.list = [];
			this.debuglog = new DebugLogs();
			this.postponeList = [];
		}
	}
	get log(){ return this.debuglog; }
	get length() { return this.list.length; }
	
	hash() { return hash(this.list); }
	
	/** Adds an item to the ledger. */
	addItem(item) {
		if (!(item instanceof LedgerItem))
			throw new TypeError('Added item must be a LedgerItem');
		this.list.push(item);
	}
	/** Removes an item from the ledger. */
	removeItem(item) {
		let i = this.list.indexOf(item);
		if (i > -1) return this.list.splice(i, 1);
		return null;
	}
	/** Removes an item from the ledger, and adds it to a list to be put in the next ledger. */
	postponeItem(item) {
		if (!(item instanceof LedgerItem))
			throw new TypeError('Added item must be a LedgerItem');
		this.removeItem(item);
		this.postponeList.push(item);
	}
	/**
	 * Adds postponed items to this ledger. This operation goes through all postponed items,
	 * and determines if any items cancel each other out before adding them.
	 */
	addPostponedItems(ledger) {
		if (!ledger) return;
		let pItems = ledger.postponeList.slice();
		for (let a = 0; a < this.list.length; a++) {
			for (let b = 0; b < pItems.length; b++) {
				let res = this.list[a].cancelsOut(pItems[b]);
				if (res) {
					if (res === this.list[a]) {
						// do nothing, coalesced
					} else if (res instanceof LedgerItem) {
						this.list.splice(a, 1, res); //replace
					} else {
						this.list.splice(a, 1); a--; //remove
					}
					pItems.splice(b, 1); b--; //remove
				}
			}
		}
		this.list.push(...pItems);
	}
	
	/** Finds all items with the given name. */
	findAllItemsWithName(name) {
		return this.list.filter(item => item.name === name);
	}
	
	getNumberOfImportantItems() {
		let i = 0;
		for (let item of this.list) {
			if (item.important >= 1) i++;
		}
		return i;
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
	
	/** Trims out all ledger items that are not helpful for the given help options. */
	trimToHelpfulItems(helpOpts={}) {
		// Make a new list of items that will be our ledger list when we're done.
		let list = [];
		for (let item of this.list) {
			// Check if the item's helptype is one of the help options we've been given
			if (helpOpts[item.helptype]) {
				list.push(item);
			}
		}
		this.list = list;
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
	
	saveToMemory() {
		let save = [];
		for (let item of this.postponeList) {
			let x = { __name__: item.name, };
			if (typeof item.saveToMemory === 'function') {
				x = item.saveToMemory(x) || x;
			} else {
				x = Object.assign(x, item);
			}
			save.push(x);
		}
		return save;
	}
	
	loadFromMemory(save) {
		const LEDGER_ITEMS = module.exports;
		this.postponeList = [];
		for (let item of save) {
			const ITEM = LEDGER_ITEMS[item.__name__];
			if (typeof ITEM.loadFromMemory === 'function') {
				this.postponeList.push(ITEM.loadFromMemory(item));
			} else {
				let x = new ITEM(item);
				x = Object.assign(x, item);
				this.postponeList.push(x);
			}
		}
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
	require('./ApiMonitoring'),
	require('./Pokemon'),
	require('./Party'),
	require('./Location'),
	require('./Options'),
	require('./Battle'),
]);
