// newspress/ledger/index.js
// The Ledger class, and exports of all ledger item classes

const hash = require('object-hash');
const util = require('util');

const LOGGER = getLogger('Ledger');

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
		if (!(item instanceof LedgerItem)) throw new TypeError('Added item must be a LedgerItem');
		let can = item.canPostpone();
		LOGGER.warn('Postponing item:', item, can);
		if (can) {
			if (can instanceof LedgerItem) {
				LOGGER.warn('Postponing is replacement.')
				this.postponeList.push(can);
			}
			else {
				LOGGER.warn('Postponing now.')
				this.removeItem(item);
				this.postponeList.push(item);
				item._postponeCount++;
			}
		}
	}
	/**
	 * Adds postponed items to this ledger. This operation goes through all postponed items,
	 * and determines if any items cancel each other out before adding them.
	 */
	addPostponedItems(ledger) {
		if (!ledger) return;
		let pItems = ledger.postponeList.slice();
		this.log.premergeState(this.list, pItems);
		for (let a = 0; a < this.list.length; a++) {
			for (let b = 0; b < pItems.length; b++) {
				let res = this.list[a].cancelsOut(pItems[b]);
				if (res) {
					if (res === this.list[a]) {
						// do nothing, coalesced
						this.log.merged('coalesced', this.list[a], pItems[b]);
					} else if (res instanceof LedgerItem) {
						let x = this.list.splice(a, 1, res); //replace
						this.log.merged('replaced', x[0], pItems[b], res);
					} else {
						let x = this.list.splice(a, 1); a--; //remove
						this.log.merged('removed', x[0], pItems[b]);
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
		this.log.ledgerState(this);
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
	
	saveToMemory(mem) {
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
		mem.items = save;
	}
	
	loadFromMemory(mem) {
		if (!mem.items) return;
		const LEDGER_ITEMS = module.exports;
		this.postponeList = [];
		for (let item of mem.items) {
			const ITEM = LEDGER_ITEMS[item.__name__];
			if (typeof ITEM.loadFromMemory === 'function') {
				this.postponeList.push(ITEM.loadFromMemory(item));
			} else {
				let x = new ITEM(item);
				delete item.__name__; //don't need this anymore
				delete item._marked; //this can cause trouble if overwritten
				x = Object.assign(x, item);
				this.postponeList.push(x);
			}
		}
	}
	
	[util.inspect.custom](depth, opts) {
		if (depth < 0) {
			return opts.stylize(`Ledger [${this.list.length}][${this.postponeList.length}]`, 'date');
		}
		const newOpts = Object.assign({}, opts, {
			depth: opts.depth === null ? null : opts.depth - 1
		});
		
		let sb = 'Ledger: [ items:\n';
		for (let item of this.list) {
			sb += `  ${util.inspect(item, newOpts)}\n`;
		}
		if (this.postponeList.length){
			sb += '][ postponed:\n';
			for (let item of this.postponeList) {
				sb += `  ${util.inspect(item, newOpts)}\n`;
			}
		}
		sb += ']';
		return sb;
	}
}
Ledger.prototype.add = Ledger.prototype.addItem;
Ledger.prototype.remove = Ledger.prototype.removeItem;

class DebugLogs {
	constructor() {
		this.uid = DebugLogs.generateId();
		this.apiNum = -1;
		this.modules = {};
		this.preledger = '';
		this.merges = [];
		this.rules = [];
		this.postledger = '';
		this.typesetter = [];
		this.update = '';
		
		this._currTypesetter = null;
	}
	
	static generateId() {
		let ts = Date.now().toString(36);
		let rand = Math.floor(Math.random()*0xFFFF).toString(36);
		return ts + rand;
	}
	
	getXml() {
		let xml = '';
		xml += `<api>${this.apiNum}</api>`;
		{
			let mods = [];
			for (let mod in this.modules) {
				mods.push(`<mod name="${mod}">${this.modules[mod].map(x=>`<p>${x}</p>`).join('')}</mod>`);
			}
			xml += `<modules>${mods.join('')}</modules>`;
		}
		xml += `<preledger>${this.preledger}</preledger>`;
		xml += `<merges>${this.merges.join('')}</merges>`;
		xml += `<rules>${this.rules.join('')}</rules>`;
		xml += `<postledger>${this.postledger}</postledger>`;
		xml += `<typesetter>${this.typesetter.join('')}</typesetter>`;
		xml += `<update>${this.update}</update>`;
		return `<state>${xml}</state>`;
	}
	
	apiIndex(num) {
		this.apiNum = num;
	}
	
	moduleRun(mod) {
		let modName = mod.constructor.name.slice(0, -6); //slice off Module
		this.modules[modName] = this.modules[modName] || [];
	}
	
	moduleLog(modName, ...str) {
		str = str.map(x=>String(x)).join(' ');
		this.modules[modName] = this.modules[modName] || [];
		this.modules[modName].push(str);
		return str;
	}
	
	ruleRound(num) {
		this.rules.push(`<marker>Round ${num}</marker>`);
	}
	
	/**
	 * Logs the application of a rule in this pass.
	 * @param {RuleInstance} ruleInst - The instance of the rule applied
	 */
	ruleApplied(ruleInst) {
		let matched = ruleInst.matchedItems.map((m, i)=>{
			let itemXml;
			if (Array.isArray(m)) itemXml = m.map(x=>x.toXml()).join('');
			else itemXml = `<matchObj index="${i}">${m}</matchObj>`;
			return `<match index="${i}">${itemXml}</match>`;
		}).join('');
		this.rules.push(`<rule name="${ruleInst.rule.name}">${matched}</rule>`);
	}
	
	premergeState(items, postItems) {
		this.preledger = `<items>${items.map(x=>x.toXml()).join('')}</items>`;
		if (postItems.length) this.preledger += `<post>${postItems.map(x=>x.toXml()).join('')}</post>`;
	}
	
	/**
	 * @param{string} type - one of 'coalesced','replaced','removed'
	 */
	merged(type, ...items) {
		this.merges.push(`<merge type="${type}">${items.map(x=>`<item>${x.name}</item>`).join('')}</merge>`);
	}
	
	ledgerState(ledger) {
		this.postledger = `<items>${ledger.list.map(x=>x.toXml()).join('')}</items>`;
		if (ledger.postponeList.length) this.postledger += `<post>${ledger.postponeList.map(x=>x.toXml()).join('')}</post>`;
	}
	
	typesetterInput(itemArray) {
		this._currTypesetter = [];
		this._currTypesetter.push(`<in num="${itemArray.length}" flavor="${itemArray[0].flavor||'default'}">${itemArray[0].name}</in>`);
	}
	typesetterFormat(format) {
		this._currTypesetter.push(`<format>${escapeHtml(format)}</format>`);
	}
	typesetterOutput(out) {
		this._currTypesetter.push(`<out>${escapeHtml(out)}</out>`);
		this.typesetter.push(`<item>${this._currTypesetter.join('')}</item>`);
		this._currTypesetter = null;
	}
	
	finalUpdate(update) {
		this.update = update;
	}
}

function escapeHtml(str) {
	if (!str) return str;
	return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

module.exports = Object.assign({
	Ledger,
}, ...[
	require('./base'),
	require('./ApiMonitoring'),
	require('./Battle'),
	require('./E4'),
	require('./Item'),
	require('./Location'),
	require('./Others'),
	require('./Party'),
	require('./PC'),
	require('./Pokemon'),
]);
