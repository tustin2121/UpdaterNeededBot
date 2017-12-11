// reporter/modules/base.js
// The base classes for the module and ledger system

class ReportingModule {
	constructor() {
		
	}
	firstPass() {}
	secondPass() {}
}

class LedgerItem {
	constructor(name) {
		this.name = name;
	}
}

module.exports = { ReportingModule, LedgerItem };