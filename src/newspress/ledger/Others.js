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
// Politics

class DemocracyContext extends LedgerItem {
	constructor() {
		super(2, { helps:true });
	}
}

class InputModeChanged extends LedgerItem {
	constructor(newMode) {
		super(1, { flavor:newMode });
	}
}

///////////////////
// Real Time

/** Indicates that the time of day in the game has changed. */
class TimeChanged extends LedgerItem {
	constructor(flavor) {
		super(0.8, { flavor });
		this.ttl = 20 * (60 / (Bot.runConfig.run.updatePeriod / 1000)); //time to live = 20 minutes
	}
	canPostpone() {
		if (this.ttl === 0) return false; //don't postpone
		this.ttl--;
		if (typeof this.flavor === 'string' && !this.flavor.endsWith('_exit')) this.flavor += '_exit';
		return true;
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

///////////////////
// Game Stats

/** A generic "game stat has changed" item for testing purposes. */
class GameStatChanged extends LedgerItem {
	constructor(stat, prev, curr) {
		super(0);
		this.stat = stat;
		this.prev = prev;
		this.curr = curr;
		this.delta = curr - prev;
	}
}

class GameSaved extends LedgerItem {
	constructor(flavor) {
		super(1, { flavor });
	}
}


///////////////////
// Memes
class MemeReport extends LedgerItem {
	constructor(flavor) {
		super(1, { flavor });
	}
}


/////////////////// Advanced Items ///////////////////


module.exports = {
	OptionsChanged,
	DemocracyContext, InputModeChanged,
	TimeChanged,
	PhonebookAdd, PhonebookRemove,
	GameStatChanged, GameSaved,
	MemeReport,
};