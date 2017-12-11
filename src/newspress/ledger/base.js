// newspress/ledger/base.js
// Base ledger item classes

class LedgerItem {
	constructor(imp=1) {
		this.importance = imp;
	}
	
	get name() { return this.constructor.name; }
	
	toDebugXml(hkey) {
		let xml = `<ledgeritem `;
		if (hkey) xml += `key=${hkey}`;
		xml += `name="${this.name}" importance="${this.importance}">`;
		for (let key in this){
			if (key === 'importance') continue;
			let val = this[key];
			if (val.toDebugXml) {
				xml += val.toDebugXml(key);
			} else {
				xml += `<${typeof val} key="${key}">${val}</${typeof val}>`;
			}
		}
		xml += `</ledgeritem>`;
		return xml;
	}
}

module.exports = { LedgerItem };