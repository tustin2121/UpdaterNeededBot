// test/common.js
// Common mock items

const SHOULD_LOG = false;
const should = require('should');
const sinon = require('sinon');
require('should-sinon');

if (SHOULD_LOG) {
	global.getLogger = function() {
		return {
			log : console.log,
			logRaw: console.log,
			debug: console.log,
			note: console.log,
			trace: console.log,
			info: console.log,
			warn: console.warn,
			error: console.error,
			fatal: console.error,
			mark: console.log,
			l4js : {},
		};
	};
} else {
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
	};
}

global.Bot = {
	_opt: {},
	_gameInfo: {},
	setOpt(key,val){ this._opt[key] = val; },
	runOpts(id){ return this._opt[id] || false; },
	gameInfo(){ return this._gameInfo; },
	on(){}, //do nohing
};

beforeEach(function(){
	Bot._opt = {};
	Bot._gameInfo = {};
});

module.exports = { should, sinon };