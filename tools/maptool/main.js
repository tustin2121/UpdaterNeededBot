// maptool main.js
// Maptool main window scripts

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

const APP = global.App;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Main Map Panel

class MapPanel {
	constructor() {
		this.selectedData = null;
		this.parentData = null;
		this.zoomLevel = 8;
		
	}
	deselect() {
		this.selectedData = null;
		this.parentData = null;
		$('#maptree .selected').removeClass('selected');
		this.updatePropLists();
	}
	select(data, $lbl) {
		this.selectedData = data;
		this.parentData = null;
		if (data instanceof MapNode) {
			this.parentData = APP.currData.types[data.type];
		}
		else if (data instanceof MapArea) {
			this.parentData = data.parent;
		}
		else if (data instanceof MapType) {
			this.parentData = null;
		}
		
		$('#maptree .selected').removeClass('selected');
		$lbl.addClass('selected');
		this.updatePropLists();
	}
	updatePropLists() {
		this.updatePropList($('#mapprops'), this.selectedData);
		this.updatePropList($('#parentprops'), this.parentData);
	}
	
	/** Shows the context menu when clicking on a bank. */
	showBankMenu({ e, bank, bankId }) {
		let self = this;
		
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({ label:`Nothing`,
			enabled: false,
		}));
		// menu.append(new nw.MenuItem({ label:`Add Map`,
		// 	click() {
		// 		let p = area.parent;
		// 		let i = p.areas.indexOf(area);
		// 		if (i === -1) return; //sanity check, should never happen
		// 		p.areas.splice(i, 1);
		// 		self.updateTree();
		// 	}
		// }));
		menu.popup(e.pageX, e.pageY);
	}
	/** Shows the context menu when clicking on a map. */
	showMapMenu({ e, map, bankId, mapId }) {
		let self = this;
		
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({ label:`Delete Map`,
			click() {
				let bank = APP.currData.nodes[bankId];
				let i = bank.indexOf(map);
				if (i === -1) return; //sanity check, should never happen
				deleteArrayIndex(bank, i);
				self.updateTree();
			}
		}));
		menu.popup(e.pageX, e.pageY);
	}
	/** Shows the context menu when clicking on an area. */
	showAreaMenu({ e, area, areaId, typeId, bankId, mapId }) {
		let self = this;
		let thing = 'Area';
		if (!area || !mapId) thing = 'Area Template';
		
		let menu = new nw.Menu();
		if (!area) { // No actualized area
			menu.append(new nw.MenuItem({ label:`Actualize ${thing}`,
				click() {
					let newarea = APP.currData.types[typeId].areas[areaId].serialize();
					let map = APP.currData.nodes[bankId][mapId];
					map.areas[areaId] = new MapArea(map, newarea);
					self.updateTree();
				}
			}));
		}
		else { // Actual area
			menu.append(new nw.MenuItem({ label:`Delete ${thing}`,
				click() {
					let p = area.parent;
					let i = p.areas.indexOf(area);
					if (i === -1) return; //sanity check, should never happen
					deleteArrayIndex(p.areas, i);
					self.updateTree();
				}
			}));
		}
		menu.popup(e.pageX, e.pageY);
	}
	
	/** Refreshes the tree view. */
	updateTree() {
		let $tree = $('#maptree');
		$tree.empty();
		let data = APP.currData;
		{
			const $tli = $(`<li>`);
			const $tlbl = $(`<span class='bank'>Map Types</span>`);
			const $sub = $(`<ul>`);
			// $tlbl.on('click', (e)=>{
			// 	$tli.toggleClass('closed');
			// 	this.renumber();
			// });
			$tli.append($tlbl).append($sub).appendTo($tree);
			for (let type in data.types) {
				const $li = $(`<li>`);
				const $lbl = $(`<span class='type'>Type "${type}"</span>`);
				let d = data.types[type];
				if (d === this.selectedData) $lbl.addClass('selected');
				$lbl.on('click', ()=>this.select(d, $lbl));
				$lbl.on('contextmenu', (ev)=>{
					
				});
				$li.append($lbl).appendTo($sub);
				for (let area = 0; area < d.areas.length; area++) {
					let a = d.area[area];
					const $ali = $(`<li>`);
					const $albl = $(`<span class='area'>Area ${area}: "${a.name}"</span>`);
					if (a === this.selectedData) $albl.addClass('selected');
					$albl.on('click', ()=>this.select(a, $albl));
					$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:a, typeId:type, areaId:area }));
					$ali.append($albl).appendTo($sub);
				}
			}
		}
		for (let bank of data.nodes) {
			// const $bli = $(`<li class='closed'>`);
			const $bli = $(`<li>`);
			const $blbl = $(`<span class='bank'>Bank ${bank}</span>`);
			const $sub = $(`<ul>`);
			// $blbl.on('click', (e)=>{
			// 	$bli.toggleClass('closed');
			// 	this.renumber();
			// });
			$bli.append($blbl).append($sub).appendTo($tree);
			if (!data.nodes[bank]) {
				$blbl.addClass('emptyslot');
				$blbl.on('contextmenu', (e)=>this.showBankMenu({ e, bank:data.nodes[bank], bankId:bank }));
				continue; //move on to the next bank
			}
			for (let map of data.nodes[bank]) {
				let d = data.nodes[bank][map];
				const $mli = $(`<li>`);
				const $mlbl = $(`<span class='map'>Map ${map}: "${d.name}"</span>`);
				const $msub = $(`<ul>`);
				$mli.append($mlbl).append($msub).appendTo($sub);
				if (!d) {
					$mlbl.addClass('emptyslot');
					$mlbl.on('contextmenu', (e)=>this.showMapMenu({ e, map:d, bankId:bank, mapId:map }));
					continue; //move on to the next map
				}
				if (d === this.selectedData) $mlbl.addClass('selected');
				$mlbl.on('click', ()=>this.select(d, $mlbl));
				
				let type = data.types[d.type];
				for (let area = 0; area < d.areas.length && area < type.areas.length; area++) {
					let a = d.area[area];
					if (a) {
						const $ali = $(`<li>`);
						const $albl = $(`<span class='area'>Area ${area}: "${a.name}"</span>`);
						if (a === this.selectedData) $albl.addClass('selected');
						$albl.on('click', ()=>this.select(a, $albl));
						$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:a, bankId:bank, mapId:map, areaId:area }));
						$ali.append($albl).appendTo($msub);
					} else {
						a = type.area[area];
						const $ali = $(`<li>`);
						const $albl = $(`<span class='area template'>Area ${area}: "${a.name}"</span>`);
						// $albl.on('click', ()=>this.select(a, $albl));
						$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:null, bankId:bank, mapId:map, areaId:area, typeId:d.type, }));
						$ali.append($albl).appendTo($msub);
					}
				}
			}
		}
		this.renumber();
	}
	
	updatePropList($list, data) {
		$list.empty();
		if (!data) return;
		$(`<header>Properties</header>`).appendTo($list);
		for (let key of data.prototype.PROPS){
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).appendTo($lbl);
			let $val = createValue(key, data);
			if (!$val) continue; //skip
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		// for (let key in data){
		// 	let $lbl = $(`<label>`);
		// 	$(`<span class="key">${key}</span>`).appendTo($lbl);
		// 	let $val = createValue(key, data);
		// 	if (!$val) continue; //skip
		// 	$val.appendTo($lbl);
		// 	$lbl.appendTo($list);
		// }
		$(`<header>Attributes</header>`).appendTo($list);
		for (let key in ATTRS) {
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).attr('title', ATTRS[key].tooltip).appendTo($lbl);
			let $val = createAttr(key, data.attrs);
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
		return;
		
		function createValue(key, obj) {
			if (key.indexOf('/') > 0) { // (X,Y) properties stored separately
				let [x, y] = key.split('/');
				let $pair = $(`<span class='valpair'>`);
				$(`<input class='val' type='number' />`).val(obj[x]).appendTo($pair)
					.on('change', function(){
						obj[x] = $(this).val();
					});
				$(`<input class='val' type='number' />`).val(obj[y]).appendTo($pair)
					.on('change', function(){
						obj[y] = $(this).val();
					});
				return $pair;
			}
			
			let val = obj[key];
			switch (key) {
				case 'locId':
					return $(`<input class='val' type='text' disabled />`);
				case 'type':
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
		
		function makeMapTypeSelect() {
			let $sel = $(`<select>`);
			for (let t in APP.currData.types) {
				const $opt = $(`<option class='${t}'>${t}</span>`);
				$opt.appendTo($sel);
			}
			return $sel;
		}
	}
	
	renumber() { // this.renumber()
		$('.treepane li:visible').each((i,e)=>{
			$(e).removeClass('n0 n1').addClass('n'+(i%2));
		});
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
/*
class TypesDialog {
	constructor() {
		this.$dialog = $('#defaultsDialog');
		this.curr = null;
		
		this.$dialog.find('[name=closeBtn]').on('click', ()=>{ this.hide() });
	}
	
	show() {
		this.$dialog.show();
		this.updateTree();
	}
	hide() { this.$dialog.hide(); }
	
	select(data, $lbl) {
		this.curr = data;
		this.updatePropList();
	}
	
	updateTree() {
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
*/

///////////////////////////////////////////////////////////////////////////////////////////////////
// Main

let mapPanel, newRegionDialog, typesDialog;

makeMenubar();

$(()=>{
	mapPanel = new MapPanel();
	newRegionDialog = new NewRegionDialog();
	typesDialog = new TypesDialog();
});


///////////////////////////////////////////////////////////////////////////////////////////////////
// Other Functions

function getMap({ bank, id }) {
	if (currData.idType === 'banked')
		return currData.nodes[bank][id];
	else
		return currData.nodes[id];
}

function saveRegion() {
	fs.writeFileSync(currFile, JSON.stringify(currData, null, '\t'));
}

function loadRegion(filePath) {
	currFile = filePath;
	currData = JSON.parse(fs.readFileSync(filePath));
	
	mapPanel.updateTree();
	// mapPanel.repaint();
}

function makeMenubar() {
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
	}
	nw.Window.get().menu = menu;
}

function deleteArrayIndex(arr, index) {
	delete arr[index];
	// shrink away empty space at the end of an array
	while (!(arr.length-1 in arr) && arr.length > 0) { arr.length--; }
}
