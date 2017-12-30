// newspress/ledger/base.js
// Base ledger item classes

class LedgerItem {
	constructor(imp=1, { helps=null, flavor=null, sort=0 }={}) {
		// The importance level of this item. Ranges from 0 to 2.
		this.importance = imp;
		// When the bot is helping, this identifies ledger items which are posted while doing so.
		// Can be 'catches','shopping','items','level', or null
		this.helptype = helps;
		// The "flavor" of a ledger item provides more context for the Typesetter for when it is
		// translating this item into English.
		this.flavor = flavor;
		// The sorting order of this item, beyond importance
		this._sort = sort;
	}
	
	get name() { return this.constructor.name; }
	
	toXml(hkey) {
		let xml = `<LedgerItem `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `name="${this.name}" imp="${this.importance}" `;
		if (this.helptype) xml += `helps="${this.helptype}" `;
		if (this.flavor) xml += `flavor="${this.flavor}" `;
		xml += `sort="${this._sort}">`;
		for (let key in this){
			if (key === 'importance') continue;
			if (key === 'helptype') continue;
			if (key === 'flavor') continue;
			if (key === '_sort') continue;
			let val = this[key];
			if (val === undefined) continue;
			
			if (val.toXml) {
				xml += val.toXml(key);
			} else {
				xml += `<${typeof val} key="${key}">${val}</${typeof val}>`;
			}
		}
		xml += `</LedgerItem>`;
		return xml;
	}
	
	static compare(a, b) {
		if (!(a instanceof LedgerItem) || !(b instanceof LedgerItem))
			throw new TypeError('Must compare LedgerItems to each other!');
		
		let res = (b.importance - a.importance);
		if (res === 0) {
			res = (b._sort - a._sort);
		}
		return res;
	}
}

module.exports = { LedgerItem };