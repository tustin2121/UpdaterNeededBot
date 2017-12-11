// reporter/modules/base.js
// The base classes for the module and ledger system

class ReportingModule {
	constructor(config, memory) {
		this.initConfig = config;
		this.memory = memory;
	}
	
	firstPass() {}
	secondPass() {}
}

module.exports = { ReportingModule };