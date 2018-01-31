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
	center:		{ indoors:true, healing:true, },
	mart:		{ indoors:true, shopping:true, },
	gym:		{ indoors:true, gym:true, },
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
	updatePropertyList();
});

function resize() {
	let canvas = $('#map')[0];
	canvas.width = $('body').innerWidth() - $('#sidebar').outerWidth();
	canvas.height = $('#sidebar').outerHeight()
	$('#map').css({
		left: $('#sidebar').outerWidth(),
	});
	drawMap();
}

function selectTemplate(data, $lbl) {
	currMap = { type:'template', data, };
	drawMap();
	updatePropertyList();
}
function selectMap(data, $lbl) {
	currMap = { type:'map', data, };
	drawMap();
	updatePropertyList();
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
		for (let wn = 0; wn < currMap.data.warps.length; wn++) {
			let warp = currMap.data.warps[wn];
			if (!warp) continue;
			try {
				let om = currData.nodes[warp.bank][warp.id];
				// console.log(`Warp ${wn}:`, warp, om);
				g.fillStyle = `#00CC00`;
				g.strokeStyle = `#009900`;
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
				g.fillStyle = `#006600`;
				g.fillText(wn.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
			} catch (e) {
				
			}
		}
	}
	
	g.restore();
}

function updatePropertyList() {
	let $list = $('#proppane');
	$list.empty();
	if (!currMap) return;
	if (currMap.type === 'template') {
		
	} else if (currMap.type === 'map') {
		for (let key in currMap.data){
			let $lbl = $(`<label>`);
			$(`<span>${key}</span>`).appendTo($lbl);
			let $val = createValue(key, currMap.data[key]);
			if (!$val) continue; //skip
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
	}
	return;
	
	function createValue(key, val) {
		switch (key) {
			case 'warps': return null;
			case 'conns': return null;
			case 'mapType':
				return $(`<select>`);
		}
		switch (typeof val) {
			case 'number':
				return $(`<input type='number' />`).val(val);
			case 'string':
				return $(`<input type='text' />`).val(val);
		}
	}
}

function updateMapList() {
	let $tree = $('#maptree');
	$tree.empty();
	{
		let $li = $(`<li>`);
		let $lbl = $(`<span class='types'>Map Type Defaults</span>`);
		let $sub = $('<ul>');
		$lbl.on('click', (e)=>{
			$li.toggleClass('closed');
			renumberMapList();
		});
		$li.append($lbl).append($sub).appendTo($tree);
		_populateTemplates($sub);
	}{
		let $li = $(`<li>`);
		let $lbl = $(`<span class='types'>Maps</span>`);
		let $sub = $('<ul>');
		$lbl.on('click', (e)=>{
			$li.toggleClass('closed');
			renumberMapList();
		});
		$li.append($lbl).append($sub).appendTo($tree);
		_populateMaps($sub);
	}
	renumberMapList();
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
	function _populateMaps($ls) {
		if (currData.idType === 'banked') {
			for (let bank in currData.nodes) {
				const $bli = $(`<li class='closed'>`);
				const $blbl = $(`<span class='bank'>Bank ${bank}</span>`);
				const $sub = $(`<ul>`);
				$blbl.on('click', (e)=>{
					$bli.toggleClass('closed');
					renumberMapList();
				});
				$bli.append($blbl).append($sub).appendTo($ls);
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
				$li.append($lbl).appendTo($ls);
			}
		} else {
			console.error('Invalid idType!');
		}
	}
}

function renumberMapList() {
	$('#maptree li:visible').each((i,e)=>{
		$(e).removeClass('n0 n1').addClass('n'+(i%2));
	});
}

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
			data.idType = idType;
			data.nodes = reader.readMaps();
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
				zoomLevel++; drawMap();
			}
		}));
		submenu.append(new nw.MenuItem({ label:'Zoom Out',
			key:'-', modifiers:'ctrl',
			click() {
				zoomLevel--; drawMap();
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
