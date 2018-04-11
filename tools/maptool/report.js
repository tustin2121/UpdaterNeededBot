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

const { MapNode, ATTRS } = require('./mapnode');
const { TypeSetter, formatFor } = require('../../src/newspress/typesetter');
const { LocationChanged } = require('../../src/newspress/ledger');
window.App = global.App;
/* global window, App */

let currPos = {};
let currNode = null;
let otherNode = new MapNode({ name:'[Outside]' });

// App.on('map-selected', (node)=> mapChange(node));
// App.on('map-changed', (args)=>{
// 	currNode = App.currData.resolve(args);
// 	mapChange(currNode);
// });
App.on('pos-changed', (args)=>posChanged(args));

$(()=>{
	let btns = $('.quickBtns');
	$(`<button>Add Spawn Point Here</button>`).appendTo(btns)
		.on('click', ()=>currNode.setSpawnPoint(currPos.x, currPos.y));
	
});

function posChanged(args) {
	currPos = args;
	currNode = App.currData.resolve(args);
	
	for (let attr in ATTRS) {
		$(`.info [name=${attr}]`).toggleClass('on', currNode.is(attr));
	}
}

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

