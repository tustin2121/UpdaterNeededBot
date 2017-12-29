// newspress/ledger/base.js
// Base ledger item classes

// const PRIMES = [
// 	7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
// 	71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137,
// 	139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199,
// ];
// function hashValue(val) {
// 	switch(typeof val) {
// 		case 'number':
// 			if (Number.isInteger(val)) {
// 				return val * 19;
// 			} else {
// 				return hashStr(val.toFixed(6));
// 			}
// 		case 'string': return hashStr(val);
// 		case 'boolean': return (val)?7:11;
// 		case 'undefined': return 2;
// 	}
// 	if (val === null) return 3;
// 	if (typeof val !== 'object') return 31;
// 	let h = 5;
// 	for (let k in val) {
// 		h = (h << 5) - h + hashStr(k)
// 		h = (h << 5) - h + hashValue(val[k]);
// 	}
// 	return h;
//
// 	function hashStr(str){
// 		let h = 0;
// 		for (let i = 0; i < str.length; i++) {
// 			h = (h << 5) - h + (str[i] | 0);
// 		}
// 		return h;
// 	}
// }


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
	
	// get hash() {
	// 	let hash = hashStr(this.constructor.name);
	// 	hash |= hashStr(this.flavor) * 17;
	// 	for (let key in this) {
	// 		 hashValue(this[key])
	//
	// 		if (key === 'importance') continue;
	// 		if (key === 'helptype') continue;
	// 		if (key === 'flavor') continue;
	// 		if (key === '_sort') continue;
	// 		let val = this[key];
	// 		switch(typeof val) {
	// 		}
	// 	}
	// 	return hash;
	//
	// 	function hashStr(str){
	// 		let h = 0;
	// 		for (let i = 0; i < str.length; i++) {
	// 			h = (h << 5) - h + str[i] | 0;
	// 		}
	// 		return h;
	// 	}
	// }
	
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