// newspress/ledger/base.js
// Base ledger item classes

class LedgerItem {
	constructor(imp=1, { helps=null, flavor=null }={}) {
		// The importance level of this item. Ranges from 0 to 2.
		this.importance = imp;
		// When the bot is helping, this identifies ledger items which are posted while doing so.
		// Can be 'catches','shopping','items','level', or null
		this.helptype = helps;
		// The "flavor" of a ledger item provides more context for the Typesetter for when it is
		// translating this item into English.
		this.flavor = flavor;
	}
	
	get name() { return this.constructor.name; }
	
	toXml(hkey) {
		let xml = `<LedgerItem `;
		if (hkey) xml += `key="${hkey}" `;
		xml += `name="${this.name}" imp="${this.importance}" `;
		if (this.helptype) xml += `helps="${this.helptype}" `;
		if (this.flavor) xml += `flavor="${this.flavor}" `;
		xml += `>`;
		for (let key in this){
			if (key === 'importance') continue;
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
}

module.exports = { LedgerItem };