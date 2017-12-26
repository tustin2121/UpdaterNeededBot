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
		trace: ()=>{},
		info: ()=>{},
		warn: ()=>{},
		error: ()=>{},
		fatal: ()=>{},
		mark: ()=>{},
		l4js : {},
	};
}

module.exports = { should, sinon };