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

const { MapNode, MapArea, ATTRS } = require('./mapnode');
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
	$(`<button>Mark Flyspot/Spawn Point</button>`).appendTo(btns)
		.on('click', ()=>{
			currNode.setSpawnPoint(currPos.x, currPos.y);
		});
	$(`<button>Mark Vending Machine</button>`).appendTo(btns)
		.on('click', ()=>{
			currNode.addArea({ x:currPos.x, y:currPos.y, name:"Vending Machine", attrs:{ vending:true, } });
		});
	{
		const txt = $(`<input type='text' class='leader' />`).appendTo(btns);
		$(`<button>Mark Gym Leader</button>`).appendTo(btns)
			.on('click', ()=>{
				currNode.addArea({ x:currPos.x, y:currPos.y, name:"Leader", attrs:{ leader:txt.val(), } });
				txt.val('');
			});
	}{
		const txt = $(`<input type='text' class='legendary' />`).appendTo(btns);
		$(`<button>Mark Legendary Mon</button>`).appendTo(btns)
			.on('click', ()=>{
				currNode.addArea({ x:currPos.x, y:currPos.y, name:"Legendary", attrs:{ legendary:txt.val(), } });
				txt.val('');
			});
	}
	$(`<button>Mark Field Healing</button>`).appendTo(btns)
		.on('click', ()=>{
			currNode.addArea({ x:currPos.x, y:currPos.y, name:"Field Healing", attrs:{ healing:'doctor', } })
		});
	$(`<button>Mark Vendor</button>`).appendTo(btns)
		.on('click', ()=>{
			currNode.addArea({ x:currPos.x, y:currPos.y, name:"Vendor", attrs:{ shopping:true, } })
		});
	
	$(`<button>Mark PC</button>`).appendTo(btns)
		.on('click', ()=>{
			currNode.addArea({ x:currPos.x, y:currPos.y, name:"PC", attrs:{ pc:true, } })
		});
	
});

function posChanged(args) {
	currPos = args;
	currNode = App.currData.resolve(args);
	
	{
		$('.summary [name=areaname]').text('');
		let mapNode = currNode;
		if (mapNode instanceof MapArea) {
			$('.summary [name=areaname]').text(currNode.name);
			mapNode = mapNode.parent;
		}
		$('.summary [name=prep]').text(mapNode.is('preposition')||'');
		$('.summary [name=the]').text(mapNode.is('the')||'');
		$('.summary [name=name]').text(mapNode.name||'');
	}
	$('.summary [name=x]').text(args.x||NaN);
	$('.summary [name=y]').text(args.y||NaN);
	$('.quickBtns .leader').val(currNode.is('leader')||'');
	$('.quickBtns .legendary').val(currNode.is('legendary')||'');
	for (let attr in ATTRS) {
		$(`.icons [name=${attr}]`).toggleClass('on', !!currNode.is(attr));
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

