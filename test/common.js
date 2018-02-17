// test/common.js
// Common mock items

const should = require('should');
const sinon = require('sinon');
require('should-sinon');

global.getLogger = function() {
	return {
		log : ()=>{},
		logRaw: ()=>{},
		debug: ()=>{},
		note: ()=>{},
		trace: ()=>{},
		info: ()=>{},
		warn: ()=>{},
		error: ()=>{},
		fatal: ()=>{},
		mark: ()=>{},
		l4js : {},
	};
}

global.Bot = {
	runOpts(){ return false; }
}

module.exports = { should, sinon };