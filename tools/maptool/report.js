// maptool report.js
//

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
	opt: {},
	setOpt(key,val){ this.opt[key] = val; },
	runOpts(id){ return this.opt[id] || false; },
};

const { MapNode } = require('./mapnode');
const { TypeSetter, formatFor } = require('../../src/newspress/typesetter');
const { LocationChanged } = require('../../src/newspress/ledger');
window.App = global.App;
/* global window, App */

let otherNode = new MapNode({ name:'[Outside]' });

App.on('map-selected', (node)=> mapChange(node));
App.on('map-changed', (args)=>{
	mapChange(App.currData.resolve(args));
});

function mapChange(node) {
	let ts = new TypeSetter();
	{
		let phrase = ts.typesetItems([ new LocationChanged(otherNode, node), ]);
		$('.update.enter p').html('0d 0h 0m [Bot] '+(phrase));
	}{
		let phrase = ts.typesetItems([ new LocationChanged(node, otherNode), ]);
		$('.update.exit p') .html('0d 0h 0m [Bot] '+(phrase));
	}
}

