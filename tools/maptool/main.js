// maptool main.js
// Maptool main file

// Constant values
const fs = require('fs');
const {
	MapNode, MapArea, MapType, TransitReport,
	generateDefaultMapTypes, ATTRS,
} = require('./mapnode.js');

//////////////////////////////////////////////////////////////////////////////////////
// TODO
// Rework this dialog so that the main dialog is just the list of banks/maps/areas in
// heierarchy order, and next to it the list of map properties and attributes. Add in
// the transit reports relevant to the currently selected bank/map/area.
//
// Split the drawn map out into its own popup that updates if it is open.
// At the bottom of the main window, add a preview typesetter window, where it shows
// the transit reports for the selected area.




// Global values
let currFile = null;
let currData = null;
let loadedROM = null;


///////////////////////////////////////////////////////////////////////////////////////////////////
// Main Map Panel

class MapPanel {
	constructor() {
		this.currMap = null;
		this.zoomLevel = 8;
		
	}
	resize() {
		let left = $('#mapprops').outerWidth() + $('#mapprops').offset().left;
		let canvas = $('#map')[0];
		canvas.width = $('body').innerWidth() - left;
		canvas.height = $('#mapprops').outerHeight()
		$('#map').css({ left });
		this.repaint();
	}
	
	zoomReset() {
		this.zoomLevel = 8;
		this.repaint();
	}
	zoomIn() {
		this.zoomLevel++;
		this.repaint();
	}
	zoomOut() {
		this.zoomLevel--;
		if (this.zoomLevel <= 0) this.zoomLevel = 1;
		this.repaint();
	}
	
	select(data, $lbl) {  // select()
		this.currMap = data;
		this.repaint();
		this.updatePropList();
	}
	updateList() { // updateMapList()
		let $tree = $('#maptree');
		$tree.empty();
		
		if (currData.idType === 'banked') {
			for (let bank in currData.nodes) {
				const $bli = $(`<li class='closed'>`);
				const $blbl = $(`<span class='bank'>Bank ${bank}</span>`);
				const $sub = $(`<ul>`);
				$blbl.on('click', (e)=>{
					$bli.toggleClass('closed');
					this.renumber();
				});
				$bli.append($blbl).append($sub).appendTo($tree);
				for (let map in currData.nodes[bank]) {
					const $li = $(`<li>`);
					const $lbl = $(`<span class='map'>Map ${map}</span>`);
					let d = currData.nodes[bank][map];
					$lbl.on('click', ()=>this.select(d, $lbl));
					$li.append($lbl).appendTo($sub);
				}
			}
		} else if (currData.idType === 'single') {
			for (let map in currData.nodes) {
				const $li = $(`<li>`);
				const $lbl = $(`<span class='map'>Map ${map}</span>`);
				let d = currData.nodes[map];
				$lbl.on('click', ()=>this.select(d));
				$li.append($lbl).appendTo($tree);
			}
		} else {
			console.error('Invalid idType!');
		}
		this.renumber();
	}
	updatePropList() { // updateMapPropertyList()
		let $list = $('#mapprops');
		$list.empty();
		if (!this.currMap) return;
		$(`<header>Properties</header>`).appendTo($list);
		for (let key in this.currMap){
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).appendTo($lbl);
			let $val = createValue(key, this.currMap);
			if (!$val) continue; //skip
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		$(`<header>Attributes</header>`).appendTo($list);
		for (let key in ATTRS) {
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).attr('title', ATTRS[key].tooltip).appendTo($lbl);
			let $val = createAttr(key, this.currMap.attrs, currData.typeDefaults[this.currMap.mapType]);
			$val.appendTo($lbl);
			$lbl.appendTo($list);
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
			let info = ATTRS[key];
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
	
	renumber() { // this.renumber()
		$('#maptree li:visible').each((i,e)=>{
			$(e).removeClass('n0 n1').addClass('n'+(i%2));
		});
	}
	repaint() { // drawMap()
		const g = $('#map')[0].getContext('2d');
		g.clearRect(0, 0, $('#map').innerWidth(), $('#map').innerHeight());
		if (!this.currMap) return;
		
		const BLOCK = this.zoomLevel;
		g.save();
		{
			const CX = $('#map').innerWidth() / 2;
			const CY = $('#map').innerHeight() / 2;
			g.translate(CX, CY);
			
			// Draw grid
			g.strokeStyle = `#DDDDDD`;
			g.beginPath();
			for (let x = 0; x < CX; x += BLOCK) { g.moveTo(x, -CY); g.lineTo(x, CY); }
			for (let x = 0; x >-CX; x -= BLOCK) { g.moveTo(x, -CY); g.lineTo(x, CY); }
			for (let y = 0; y < CY; y += BLOCK) { g.moveTo(-CX, y); g.lineTo(CX, y); }
			for (let y = 0; y >-CY; y -= BLOCK) { g.moveTo(-CX, y); g.lineTo(CX, y); }
			g.stroke();
		}{
			let map = this.currMap;
			// Draw connections:
			for (let dir in this.currMap.conns) {
				let conn = this.currMap.conns[dir];
				let off = { x:-map.width/2, y:-map.height/2 };
				// console.log(`offset:`,off);
				try {
					let om = getMap(conn);
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
			// Draw current map
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
			// Draw events
			for (let en = 0; en < this.currMap.events.length; en++) {
				require('./drawEvents.js').call(this, g, this.currMap.events[en], {
					map, BLOCK,
				});
			}
			// Draw warps
			for (let wn = 0; wn < this.currMap.warps.length; wn++) {
				let warp = this.currMap.warps[wn];
				if (!warp) continue;
				try {
					let om = getMap(warp);
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
					g.font = `${this.zoomLevel-2}pt monospace`;
					g.fillStyle = textColor;
					g.fillText(wn.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
				} catch (e) {
					console.error(e);
				}
			}
		}
		
		g.restore();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// New Dialog

class NewRegionDialog {
	constructor() {
		this.$dialog = $('#newDialog');
		this.$dialog.find('[name=okBtn]').on('click', ()=>{ this.createNewRegion(); });
		this.$dialog.find('[name=cancelBtn]').on('click', ()=>{ this.hide() });
		this.$dialog.find('[name=romPath]').on('change', ()=>{
			let hasROM = !!this.$dialog.find('[name=romPath]').val();
			this.$dialog.find('[name=genRadio]').toggle(hasROM);
			this.$dialog.find('[name=typeRadio]').toggle(!hasROM);
		});
	}
	
	show() { this.$dialog.show(); }
	hide() {
		this.$dialog.hide();
		this.clear();
	}
	
	clear() {
		this.$dialog.find('[name=savePath]').val('');
		this.$dialog.find('[name=name]').val('');
		this.$dialog.find('[name=romPath]').val('');
	}
	
	createNewRegion() {
		try {
			let file = this.$dialog.find('[name=savePath]').val();
			let name = this.$dialog.find('[name=name]').val();
			let romFile = this.$dialog.find('[name=romPath]').val();
			if (!file) { window.alert('Please provide a file path!'); return; }
			if (!name) { window.alert('Please name the region!'); return; }
			
			let data = {
				name: name,
				idType: null,
				typeDefaults: generateDefaultMapTypes,
				nodes: null,
			};
			if (romFile) {
				let reader, idType;
				switch (this.$dialog.find('[name=gen]:checked').val()) {
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
				data.idType = this.$dialog.find('[name=idtype]:checked').val();
				data.nodes = {};
			}
			fs.writeFileSync(file, JSON.stringify(data, null, '\t'));
			this.$dialog.hide();
			loadRegion(file);
		} catch (e) {
			throw e;
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Type Defaults Dialog

class TypesDialog {
	constructor() {
		this.$dialog = $('#defaultsDialog');
		this.curr = null;
		
		this.$dialog.find('[name=closeBtn]').on('click', ()=>{ this.hide() });
	}
	
	show() {
		this.$dialog.show();
		this.updateList();
	}
	hide() { this.$dialog.hide(); }
	
	select(data, $lbl) {
		this.curr = data;
		this.updatePropList();
	}
	
	updateList() {
		let $tree = this.$dialog.find('.treepane');
		$tree.empty();
		
		for (let t in currData.typeDefaults) {
			const $li = $(`<li>`);
			const $lbl = $(`<span class='maptype'>${t}</span>`);
			let d = currData.typeDefaults[t];
			$lbl.on('click', ()=>this.select(d, $lbl));
			$li.append($lbl).appendTo($tree);
		}
		this.renumber();
	}
	
	updatePropList() {
		let $list = this.$dialog.find('.proppane');
		$list.empty();
		if (!this.curr) return;
		$(`<header>Attributes</header>`).appendTo($list);
		for (let key in ATTRS) {
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).attr('title', ATTRS[key].tooltip).appendTo($lbl);
			let $val = createAttr(key, this.curr.attrs);
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		$(`<header>Location Of</header>`).appendTo($list);
		for (let key in MAP_LOCOF) {
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).attr('title', MAP_LOCOF[key].tooltip).appendTo($lbl);
			// let $val = createAttr(key, this.curr.attrs);
			// $val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		return;
		
		function createAttr(key, obj) {
			let info = ATTRS[key];
			let $val = $(`<span class='val'>`);
			let $checkThis = $(`<input type='checkbox'/>`).prop({ checked:obj[key] });
			$val.append($checkThis);
			
			if (info.values) {
				let $sel = $('<select>');
				$sel.append(info.values.slice(1).map(x=>$(`<option>${x}</option>`)));
				$sel.on('change', function(){
					obj[key] = $sel.val();
				});
				$checkThis.on('change', function(){
					if ($(this).prop('checked')) {
						$sel.prop({ disabled:false });
						obj[key] = $sel.val();
					} else {
						$sel.prop({ disabled:true });
						obj[key] = false;
					}
				});
				if (obj[key]) {
					$sel.val(obj[key]);
					$checkThis.prop({ checked:true });
				} else {
					$checkThis.prop({ checked:false });
				}
				
			} else if (info.allowString) {
				let $str = $(`<input type='text'/>`).appendTo($val)
					.on('change', function(){
						obj[key] = $(this).val();
						$checkThis.prop({ indeterminate:true });
					});
				if (typeof obj[key] === 'string') {
					$str.val(obj[key]);
				}
				$checkThis.on('change', function(){
					$(this).prop({ indeterminate:false });
					$str.val('');
					obj[key] = !!$(this).prop('checked');
				});
				
			} else if (info.allowSpawnpoint) {
				//TODO
				
			} else {
				$checkThis.on('change', function(){
					obj[key] = $(this).prop('checked');
				});
			}
			
			//TODO allowString, values, etc
			return $val;
		}
	}
	
	renumber() { // this.renumber()
		this.$dialog.find('.treepane li:visible').each((i,e)=>{
			$(e).removeClass('n0 n1').addClass('n'+(i%2));
		});
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Main

let mapPanel, newRegionDialog, typesDialog;

makeMenu();

$(()=>{
	mapPanel = new MapPanel();
	newRegionDialog = new NewRegionDialog();
	typesDialog = new TypesDialog();
	
	window.onresize = resize;
	resize();
});


///////////////////////////////////////////////////////////////////////////////////////////////////
// Other Functions

function getMap({ bank, id }) {
	if (currData.idType === 'banked')
		return currData.nodes[bank][id];
	else
		return currData.nodes[id];
}

function resize() {
	mapPanel.resize();
}
function saveRegion() {
	fs.writeFileSync(currFile, JSON.stringify(currData, null, '\t'));
}

function loadRegion(filePath) {
	currFile = filePath;
	currData = JSON.parse(fs.readFileSync(filePath));
	
	mapPanel.updateList();
	// mapPanel.repaint();
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
		submenu.append(new nw.MenuItem({ label:'Type Defaults',
			click() { typesDialog.show(); }
		}));
		menu.append(new nw.MenuItem({ label:'Edit', submenu }));
	}{
		let submenu = new nw.Menu();
		submenu.append(new nw.MenuItem({ label:'Zoom In',
			key:'=', modifiers:'ctrl',
			click() { mapPanel.zoomIn(); }
		}));
		submenu.append(new nw.MenuItem({ label:'Zoom Out',
			key:'-', modifiers:'ctrl',
			click() { mapPanel.zoomOut(); }
		}));
		submenu.append(new nw.MenuItem({ label:'Reset Zoom',
			key:'0', modifiers:'ctrl',
			click() { mapPanel.zoomReset(); }
		}));
		menu.append(new nw.MenuItem({ label:'Map', submenu }));
	}
	nw.Window.get().menu = menu;
}
