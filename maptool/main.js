// maptool main.js
// Maptool main file

const fs = require('fs');

let currFile = null;
let currData = null;
let loadedROM = null;

let currMap = null;
let zoomLevel = 8;

const TYPE_DEFAULTS = {
	unknown:	{},
	town: 		{ town:true, },
	route:		{},
	indoor:		{ indoors:true, },
	cave:		{ indoors:true, },
	gate:		{ indoors:true, },
	dungeon:	{ indoors:true, },
	center:		{ indoors:true, healing:true, checkpoint:true, },
	mart:		{ indoors:true, shopping:true, },
	gym:		{ indoors:true, gym:true, },
};
const MAP_ATTRS = {
	the: {
		tooltip: `If the location name should use an article when printing the name.\nTrue=definite "the" | string=supplied article`,
		allowString: true,
	},
	inconsequential: { //TODO also add enter and exit strings
		tooltip: `If the location is not worthy of noting. A location change will not be reported when this room is arrived to or left from.`,
	},
	indoors: {
		tooltip: `If the location is inside (cannot fly)`,
	},
	town: {
		tooltip: `If the location is in a town (not the wild)`,
	},
	checkpoint: {
		tooltip: `If the location sets a checkpoint upon arriving (or when healing in gen 1). This points to one of the spawn points.`,
		// This is also used to check for blackouts: if we arrive back at our previously marked checkpoint
		allowSpawnpoint: true,
		// If this value is set, it is set to a spawn point index.
	},
	healing: {
		tooltip: `If the location offers healing.`,
		values: [false,'pokecenter','doctor','nurse','house','partner'],
	},
	shopping: {
		tooltip: `If the location offers vendors.`,
	},
	gym: {
		tooltip: `If the location is a gym (badge/TM getting, attempt counting).`,
	},
	e4: {
		tooltip: `If the location is part of the E4 (Run counting). If the E4 are linear, use e1-3 to mark them in order.`,
		values: [false,'lobby','e1','e2','e3','e4','champ','hallOfFame'],
	},
	dungeon: {
		tooltip: `If the location is a dungeon or cave.`,
	},
	legendary: { //TODO allow multiple legendary pokemon in one map
		tooltip: `The name of the legendary pokemon in this location.`,
		allowString: true,
	},
	entralink: {
		tooltip: `If this location is an entralink map (special reporting)`,
	},
};
const MAP_LOCOF = {
	spawnPoint: {
		tooltip: `If this location is a spawning map, the location of the spawn point. (Also fly spot)`,
	},
	vending: {
		tooltip: `List of locations of vending machines on this map.`,
		multi: true,
	},
	healing: {
		tooltip: `List of locations of field healing (doctors/nurses).`,
		multi: true,
	},
	pc: {
		tooltip: `List of locations of PCs.`,
		multi: true,
	},
	legendary: { //TODO allow multiple legendary pokemon in one map
		tooltip: `If this location has a legenday, its location.`,
	},
	leader: { //TODO split off into leader section which also has leader name and badge
		tooltip: `If this location is a gym, the location of the leader.`,
	},
};

makeMenu();
window.onresize = resize;

$(()=>{
	$('#newDialog [name=okBtn]').on('click', createNewRegion);
	
	$('#newDialog [name=cancelBtn]').on('click', ()=>{
		$('#newDialog').hide();
		$('#newDialog [name=savePath]').val('');
		$('#newDialog [name=name]').val('');
		$('#newDialog [name=romPath]').val('');
	});
	
	$('#newDialog [name=romPath]').on('change', ()=>{
		let hasROM = !!$('#newDialog [name=romPath]').val();
		$('#newDialog [name=genRadio]').toggle(hasROM);
		$('#newDialog [name=typeRadio]').toggle(!hasROM);
	});
	
	// $('#mapZoomIn').on('click', ()=>{ zoomLevel++; drawMap(); });
	// $('#mapZoomOut').on('click', ()=>{ zoomLevel++; drawMap(); });
	
	resize();
	drawMap();
	updateMapPropertyList();
});

function resize() {
	let left = $('#proppane').outerWidth() + $('#proppane').offset().left;
	let canvas = $('#map')[0];
	canvas.width = $('body').innerWidth() - left;
	canvas.height = $('#proppane').outerHeight()
	$('#map').css({ left });
	drawMap();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Main Map Panel

class MapPanel {
	constructor() {
		this.currMap = null;
	}
	selectMap(data, $lbl) {} //TODO selectMap()
	updateList() {} //TODO updateMapList()
	updatePropList() {} //TODO updateMapPropertyList()
	
	renumber() {} //TODO renumberMapList
	repaint() {} //TODO drawMap()
}

function selectMap(data, $lbl) {
	currMap = { type:'map', data, };
	drawMap();
	updateMapPropertyList();
}

function drawMap() {
	const g = $('#map')[0].getContext('2d');
	g.clearRect(0, 0, $('#map').innerWidth(), $('#map').innerHeight());
	if (!currMap || currMap.type !== 'map') return;
	
	const BLOCK = zoomLevel;
	g.save();
	{
		const CX = $('#map').innerWidth() / 2;
		const CY = $('#map').innerHeight() / 2;
		g.translate(CX, CY);
		
		g.strokeStyle = `#DDDDDD`;
		g.beginPath();
		for (let x = 0; x < CX; x += BLOCK) { g.moveTo(x, -CY); g.lineTo(x, CY); }
		for (let x = 0; x >-CX; x -= BLOCK) { g.moveTo(x, -CY); g.lineTo(x, CY); }
		for (let y = 0; y < CY; y += BLOCK) { g.moveTo(-CX, y); g.lineTo(CX, y); }
		for (let y = 0; y >-CY; y -= BLOCK) { g.moveTo(-CX, y); g.lineTo(CX, y); }
		g.stroke();
	}{
		let map = currMap.data;
		// console.log(`Map:`, map);
		for (let dir in currMap.data.conns) {
			let conn = currMap.data.conns[dir];
			let off = { x:-map.width/2, y:-map.height/2 };
			// console.log(`offset:`,off);
			try {
				let om = currData.nodes[conn.bank][conn.id];
				// console.log(`Connection ${dir}:`, conn, om);
				switch (dir) {
					case 's': off.y += map.height; break;
					case 'e': off.x += map.width; break;
				}
				g.fillStyle = `#CCCCCC`;
				g.strokeStyle = `#999999`;
				let r = {
					x: (off.x-conn.x) * BLOCK,
					y: (off.y-conn.y) * BLOCK,
					w: om.width * BLOCK,
					h: om.height * BLOCK,
				};
				g.fillRect  (r.x, r.y, r.w, r.h);
				g.strokeRect(r.x, r.y, r.w, r.h);
				g.font = `16pt monospace`;
				g.fillStyle = `#444444`;
				g.fillText(dir, r.x+(r.w/2), r.y+(r.h/2));
			} catch (e) {
				g.save();
				console.error(`Error drawing ${dir} connection map.`,e);
				g.fillStyle = `#AA2222`;
				g.strokeStyle = `#660000`;
				g.lineWidth = BLOCK;
				let r = {
					x: (off.x-conn.x) * BLOCK,
					y: (off.y-conn.y) * BLOCK,
					w: 8 * BLOCK,
					h: 8 * BLOCK,
				};
				g.fillRect  (r.x, r.y, r.w, r.h);
				g.strokeRect(r.x, r.y, r.w, r.h);
				g.beginPath();
				g.moveTo(r.x, r.y); g.lineTo(r.x+r.w, r.y+r.h);
				g.moveTo(r.x+r.w, r.y); g.lineTo(r.x, r.y+r.h);
				g.stroke();
				g.font = `16pt monospace`;
				g.fillStyle = `#220000`;
				g.fillText(dir, r.x+(r.w/2), r.y+(r.h/2));
				g.restore();
			}
		}
		{
			g.fillStyle = `#AAAAAA`;
			g.strokeStyle = `#666666`;
			let r = {
				x: (-(map.width/2)) * BLOCK,
				y: (-(map.height/2)) * BLOCK,
				w: map.width * BLOCK,
				h: map.height * BLOCK,
			};
			g.fillRect  (r.x, r.y, r.w, r.h);
			g.strokeRect(r.x, r.y, r.w, r.h);
		}
		for (let en = 0; en < currMap.data.events.length; en++) {
			let event = currMap.data.events[en];
			if (!event) continue;
			try {
				let textColor = '';
				switch (event.type) {
					case 'coord':
						g.fillStyle = `#00A7CC`;
						g.strokeStyle = `#007D99`;
						textColor = `#005366`;
						break;
					case 'bg':
						g.fillStyle = `#00CC7A`;
						g.strokeStyle = `#00995C`;
						textColor = `#00663D`;
						break;
					case 'object':
						g.fillStyle = `#A000CC`;
						g.strokeStyle = `#780099`;
						textColor = `#500066`;
						break;
				}
				
				let r = {
					x: (-(map.width/2)+event.x) * BLOCK,
					y: (-(map.height/2)+event.y) * BLOCK,
					w: BLOCK,
					h: BLOCK,
				};
				g.fillRect  (r.x, r.y, r.w, r.h);
				g.strokeRect(r.x, r.y, r.w, r.h);
				
				if (event.radius_x || event.radius_y) {
					r = {
						x: (-(map.width/2)+event.x - event.radius_x) * BLOCK,
						y: (-(map.height/2)+event.y - event.radius_y) * BLOCK,
						w: BLOCK * event.radius_x * 2,
						h: BLOCK * event.radius_y * 2,
					};
					g.strokeRect(r.x, r.y, r.w, r.h);
					g.beginPath();
					g.moveTo(r.x, r.y+(r.h/2)); g.lineTo(r.x+r.w, r.y+(r.h/2));
					g.moveTo(r.x+(r.w/2), r.y); g.lineTo(r.x+(r.w/2), r.y+r.h);
					g.stroke();
				}
				if (event.sightRange) {
					let r = {
						x: (-(map.width/2)+event.x) * BLOCK,
						y: (-(map.height/2)+event.y) * BLOCK,
					};
					switch (event.moveFn) {
						case 'STANDING_DOWN':  r.d = true; break;
						case 'STANDING_UP':    r.u = true; break;
						case 'STANDING_LEFT':  r.l = true; break;
						case 'STANDING_RIGHT': r.r = true; break;
						case 'SPINRANDOM_SLOW':
						case 'SPINRANDOM_FAST':
							r.d = r.u = r.l = r.r = true; break;
					}
					g.beginPath();
					if (r.u) g.moveTo(r.x, r.y); g.lineTo(r.x, r.y-(event.sightRange*BLOCK));
					if (r.d) g.moveTo(r.x, r.y); g.lineTo(r.x, r.y+(event.sightRange*BLOCK));
					if (r.r) g.moveTo(r.x, r.y); g.lineTo(r.x-(event.sightRange*BLOCK), r.y);
					if (r.l) g.moveTo(r.x, r.y); g.lineTo(r.x+(event.sightRange*BLOCK), r.y);
					g.stroke();
				}
				
				let tx = g.measureText(en.toString(16));
				g.font = `${zoomLevel-2}pt monospace`;
				g.fillStyle = textColor;
				g.fillText(en.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
			} catch (e) {
				console.error(e);
			}
		}
		for (let wn = 0; wn < currMap.data.warps.length; wn++) {
			let warp = currMap.data.warps[wn];
			if (!warp) continue;
			try {
				let om = currData.nodes[warp.bank][warp.id];
				let textColor = '';
				if (om) {
					g.fillStyle = `#00CC00`;
					g.strokeStyle = `#009900`;
					textColor = `#006600`;
				} else {
					g.fillStyle = `#AA2222`;
					g.strokeStyle = `#660000`;
					textColor = `#660000`;
				}
				let r = {
					x: (-(map.width/2)+warp.x) * BLOCK,
					y: (-(map.height/2)+warp.y) * BLOCK,
					w: BLOCK,
					h: BLOCK,
				};
				g.fillRect  (r.x, r.y, r.w, r.h);
				g.strokeRect(r.x, r.y, r.w, r.h);
				let tx = g.measureText(wn.toString(16));
				g.font = `${zoomLevel-2}pt monospace`;
				g.fillStyle = textColor;
				g.fillText(wn.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
			} catch (e) {
				console.error(e);
			}
		}
	}
	
	g.restore();
}

function updateMapPropertyList() {
	let $list = $('#mapprops');
	$list.empty();
	if (!currMap) return;
	if (currMap.type === 'template') {
		
	} else if (currMap.type === 'map') {
		$(`<header>Map Properties</header>`).appendTo($list);
		for (let key in currMap.data){
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).appendTo($lbl);
			let $val = createValue(key, currMap.data);
			if (!$val) continue; //skip
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		$(`<header>Attributes</header>`).appendTo($list);
		for (let key in MAP_ATTRS) {
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).attr('title', MAP_ATTRS[key].tooltip).appendTo($lbl);
			let $val = createAttr(key, currMap.data.attrs, currData.typeDefaults[currMap.data.mapType]);
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		$(`<header>Location Of</header>`).appendTo($list);
		for (let key in MAP_LOCOF) {
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).attr('title', MAP_LOCOF[key].tooltip).appendTo($lbl);
			// let $val = createAttr(key, currMap.data.attrs, currData.typeDefaults[currMap.data.mapType]);
			// $val.appendTo($lbl);
			$lbl.appendTo($list);
		}
	}
	return;
	
	function createValue(key, obj) {
		let val = obj[key];
		switch (key) {
			case 'warps': return null;
			case 'conns': return null;
			case 'attrs': return null; //handled by attrs section
			case 'locOf': return null; //handled by locOf section
			case 'mapType':
				return makeMapTypeSelect()
					.val(val)
					.on('change', function(){
						obj[key] = $(this).val();
					});
		}
		switch (typeof val) {
			case 'number':
				return $(`<input class='val' type='number' />`).val(val)
					.on('change', function(){
						obj[key] = $(this).val();
					});
			case 'string':
				return $(`<input class='val' type='text' />`).val(val)
					.on('change', function(){
						obj[key] = $(this).val();
					});
		}
	}
	
	function createAttr(key, obj, def={}) {
		let info = MAP_ATTRS[key];
		let $val = $(`<span class='val'>`);
		let $checkDef = $(`<input type='checkbox'/>`).prop({ checked:def[key], disabled:true });
		let $checkThis = $(`<input type='checkbox'/>`).prop({ checked:obj[key] });
		$val.append($checkDef).append($checkThis);
		//TODO allowString, values, etc
		return $val;
	}
	
	function makeMapTypeSelect() {
		let $sel = $(`<select>`);
		for (let t in currData.typeDefaults) {
			const $opt = $(`<option class='${t}'>${t}</span>`);
			$opt.appendTo($sel);
		}
		return $sel;
	}
}

function updateMapList() {
	let $tree = $('#maptree');
	$tree.empty();
	
	if (currData.idType === 'banked') {
		for (let bank in currData.nodes) {
			const $bli = $(`<li class='closed'>`);
			const $blbl = $(`<span class='bank'>Bank ${bank}</span>`);
			const $sub = $(`<ul>`);
			$blbl.on('click', (e)=>{
				$bli.toggleClass('closed');
				renumberMapList();
			});
			$bli.append($blbl).append($sub).appendTo($tree);
			for (let map in currData.nodes[bank]) {
				const $li = $(`<li>`);
				const $lbl = $(`<span class='map'>Map ${map}</span>`);
				let d = currData.nodes[bank][map];
				$lbl.on('click', ()=>selectMap(d, $lbl));
				$li.append($lbl).appendTo($sub);
			}
		}
	} else if (currData.idType === 'single') {
		for (let map in currData.nodes) {
			const $li = $(`<li>`);
			const $lbl = $(`<span class='map'>Map ${map}</span>`);
			let d = currData.nodes[map];
			$lbl.on('click', ()=>selectMap(d));
			$li.append($lbl).appendTo($tree);
		}
	} else {
		console.error('Invalid idType!');
	}
	renumberMapList();
}

function renumberMapList() {
	$('#maptree li:visible').each((i,e)=>{
		$(e).removeClass('n0 n1').addClass('n'+(i%2));
	});
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Type Defaults Dialog

class TypesDialog {
	constructor() {
		
	}
	select() {} //TODO selectTemplate()
}

// function selectTemplate(data, $lbl) {
// 	currMap = { type:'template', data, };
// 	drawMap();
// 	updateMapPropertyList();
// }

function updateTypeDefaultsList() {
	let $tree = $('#maptree');
	$tree.empty();
	
	// let $li = $(`<li>`);
	// let $lbl = $(`<span class='types'>Map Type Defaults</span>`);
	// let $sub = $('<ul>');
	// $lbl.on('click', (e)=>{
	// 	$li.toggleClass('closed');
	// 	renumberMapList();
	// });
	// $li.append($lbl).append($sub).appendTo($tree);
	_populateTemplates($sub);
	return;
	
	function _populateTemplates($ls) {
		for (let t in currData.typeDefaults) {
			const $li = $(`<li>`);
			const $lbl = $(`<span class='maptype'>${t}</span>`);
			let d = currData.typeDefaults[t];
			$lbl.on('click', ()=>selectTemplate(d, $lbl));
			$li.append($lbl).appendTo($ls);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Save Load

///////////////////////////////////////////////////////////////////////////////////////////////////
// New Dialog

function loadRegion(filePath) {
	currFile = filePath;
	currData = JSON.parse(fs.readFileSync(filePath));
	
	updateMapList();
	drawMap();
}

function saveRegion() {
	fs.writeFileSync(currFile, JSON.stringify(currData, null, '\t'));
}

function createNewRegion() {
	try {
		let file = $('#newDialog [name=savePath]').val();
		let name = $('#newDialog [name=name]').val();
		let romFile = $('#newDialog [name=romPath]').val();
		if (!file) { window.alert('Please provide a file path!'); return; }
		if (!name) { window.alert('Please name the region!'); return; }
		
		let data = {
			name: name,
			idType: null,
			typeDefaults: TYPE_DEFAULTS,
			nodes: null,
		};
		if (romFile) {
			let reader, idType;
			switch ($('#newDialog [name=gen]:checked').val()) {
				case '1':
					reader = require('./romread').Gen1Reader;
					idType = 'single';
					break;
				case '2':
					reader = require('./romread').Gen2Reader;
					idType = 'banked';
					break;
				case '3':
					reader = null; //TODO
					idType = 'banked';
					break;
				case '4':
					reader = null; //TODO
					idType = 'single';
					break;
				case '5':
					reader = null; //TODO
					idType = 'single';
					break;
				case '6':
					reader = null; //TODO
					idType = 'single';
					break;
				case '7':
					reader = null; //TODO
					idType = 'single';
					break;
			}
			if (!reader) throw new Error('Unsupported generation!');
			reader = new reader(romFile).load();
			let mapData = reader.readMaps();
			data.idType = idType;
			data.nodes = mapData.mapData;
			console.log(reader, mapData);
		} else {
			data.idType = $('#newDialog [name=idtype]:checked').val();
			data.nodes = {};
		}
		fs.writeFileSync(file, JSON.stringify(data, null, '\t'));
		$('#newDialog').hide();
		loadRegion(file);
	} catch (e) {
		throw e;
	}
}

function makeMenu() {
	let menu = new nw.Menu({type: 'menubar'});
	{
		let submenu = new nw.Menu();
		submenu.append(new nw.MenuItem({ label:'New Map',
			click() {
				$('#newDialog').show();
			}
		}));
		submenu.append(new nw.MenuItem({ label:'Open Map',
			click() {
				let chooser = $('#openPath');
				chooser.unbind('change').on('change', ()=>{
					try {
						let file = chooser.val();
						loadRegion(file);
					} catch (e) {
						console.log('Error!', e);
					}
				});
				chooser.trigger('click');
			}
	 	}));
		submenu.append(new nw.MenuItem({ type:'separator' }));
		submenu.append(new nw.MenuItem({ label:'Save',
			key:'s', modifiers:'ctrl',
			click:saveRegion,
			
		}));
		
		menu.append(new nw.MenuItem({ label:'File', submenu }));
	}{
		let submenu = new nw.Menu();
		submenu.append(new nw.MenuItem({ label:'Zoom In',
			key:'=', modifiers:'ctrl',
			click() {
				zoomLevel++;
				drawMap();
			}
		}));
		submenu.append(new nw.MenuItem({ label:'Zoom Out',
			key:'-', modifiers:'ctrl',
			click() {
				zoomLevel--;
				if (zoomLevel <= 0) zoomLevel = 1;
				drawMap();
			}
		}));
		submenu.append(new nw.MenuItem({ label:'Reset Zoom',
			key:'0', modifiers:'ctrl',
			click() {
				zoomLevel = 8; drawMap();
			}
		}));
		menu.append(new nw.MenuItem({ label:'Map', submenu }));
	}
	nw.Window.get().menu = menu;
}
