// newspress/ledger/Others.js
// Various ledger items that don't number enough to have their own file

const { LedgerItem } = require('./base');

/////////////////// Basic Items ///////////////////

///////////////////
// Options

/** Indicates that options in the game have changed */
class OptionsChanged extends LedgerItem {
	constructor(changes) {
		super(1);
		this.changes = changes;
		if (changes) {
			// For debugging purposes
			Object.defineProperties(changes, {
				toString: {
					value: function(){ return `{${Object.keys(this).join(',')}}`; },
				},
			});
		}
	}
}

///////////////////
// Real Time

/** Indicates that the time of day in the game has changed. */
class TimeChanged extends LedgerItem {
	constructor(changes) {
		super(0.8);
		this.changes = changes;
	}
}

///////////////////
// Real Time
const getContactInfo = (name)=>{
	let infodir = Bot.runOpts('contactInfo');
	let obj;
	if (infodir){ 
		obj = require(`../../../data/extdata/${infodir}`)[name];
	} else {
		obj = { name, location:false };
	}
	if (!obj[name]) obj[name] = name;
	Object.defineProperties(obj, {
		toString: { value: function(){ return this.name; }, },
	});
	return obj;
};

/** Indicates that a contact has been added to our phonebook. */
class PhonebookAdd extends LedgerItem {
	constructor(contact) {
		super(1);
		this.contact = getContactInfo(contact);
	}
}
class PhonebookRemove extends LedgerItem {
	constructor(contact) {
		super(1);
		this.contact = getContactInfo(contact);
	}
}


/////////////////// Advanced Items ///////////////////


module.exports = {
	OptionsChanged,
	TimeChanged,
	PhonebookAdd, PhonebookRemove,
};