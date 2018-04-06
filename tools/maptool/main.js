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

/* global App, window, document */
window.App = global.App;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Main Map Panel

class MapPanel {
	constructor() {
		this.selectedData = null;
		this.parentData = null;
		this.editingTransit = null;
		
		App.on('load', ()=> this.updateTree());
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
			this.parentData = App.currData.types[data.type];
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
		App.emit('map-selected', this.selectedData);
	}
	updatePropLists() {
		this.updatePropList($('#mapprops'), this.selectedData);
		this.updatePropList($('#parentprops'), this.parentData);
		this.updateTransitList();
	}
	
	/** Shows the context menu when clicking on a map type. */
	showTypeMenu({ e, type, typeId }) {
		let self = this;
		
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({ label:`New Type`,
			click() {
				let id = window.prompt("Name of new type:");
				if (!id) return;
				App.currData.types[id] = new MapType({ name:id });
				self.updateTree();
			}
		}));
		if (typeId && type) {
			menu.append(new nw.MenuItem({ label:`Delete type ${type}`,
				click() {
					if (!window.confirm(`Delete map "${type.name}"?`)) return;
					delete App.currData.types[typeId];
					self.updateTree();
				}
			}));
			menu.append(new nw.MenuItem({ type:'separator' }));
			menu.append(new nw.MenuItem({ label:`Add area`,
				click() {
					type.addArea();
					self.updateTree();
				}
			}));
		}
		e.preventDefault();
		menu.popup(e.pageX, e.pageY);
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
		e.preventDefault();
		menu.popup(e.pageX, e.pageY);
	}
	/** Shows the context menu when clicking on a map. */
	showMapMenu({ e, map, bankId, mapId }) {
		let self = this;
		
		let menu = new nw.Menu();
		if (!map) {
			menu.append(new nw.MenuItem({ label:`New Map`,
				click() {
					App.currData.createMap(bankId, mapId);
					self.updateTree();
				}
			}));
			menu.append(new nw.MenuItem({ type:'separator' }));
		}
		menu.append(new nw.MenuItem({ label:`Insert slot above (shift down)`,
			click() {
				App.currData.insertMapSlot(bankId, mapId-1);
				self.updateTree();
			}
		}));
		menu.append(new nw.MenuItem({ label:`Insert new map above (shift down)`,
			click() {
				App.currData.insertMapSlot(bankId, mapId-1);
				App.currData.createMap(bankId, mapId-1);
				self.updateTree();
			}
		}));
		menu.append(new nw.MenuItem({ label:`Insert new map below (shift down)`,
			click() {
				App.currData.insertMapSlot(bankId, mapId+1);
				App.currData.createMap(bankId, mapId+1);
				self.updateTree();
			}
		}));
		menu.append(new nw.MenuItem({ type:'separator' }));
		if (map) {
			menu.append(new nw.MenuItem({ label:`Delete map`,
				click() {
					if (!window.confirm(`Delete map "${map.name}"?`)) return;
					App.currData.deleteMap(bankId, mapId);
					self.updateTree();
				}
			}));
			menu.append(new nw.MenuItem({ label:`Delete map (shift up)`,
				click() {
					if (!window.confirm(`Delete map "${map.name}"?`)) return;
					App.currData.deleteMapSlot(bankId, mapId);
					self.updateTree();
				}
			}));
			menu.append(new nw.MenuItem({ type:'separator' }));
			menu.append(new nw.MenuItem({ label:`Add area`,
				click() {
					map.addArea();
					self.updateTree();
				}
			}));
		} else {
			menu.append(new nw.MenuItem({ label:`Delete map slot (shift up)`,
				click() {
					if (!window.confirm(`Delete map slot?`)) return;
					App.currData.deleteMapSlot(bankId, mapId);
					self.updateTree();
				}
			}));
		}
		e.preventDefault();
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
					let newarea = App.currData.types[typeId].areas[areaId].serialize();
					let map = App.currData.nodes[bankId][mapId];
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
		e.preventDefault();
		menu.popup(e.pageX, e.pageY);
	}
	
	toggleSub($li) {
		$tli.toggleClass('closed');
		this.renumber();
	}
	
	/** Refreshes the tree view. */
	updateTree() {
		const $tree = $('#maptree');
		$tree.empty();
		const ARROW = ($l, cls='')=>{
			return $(`<span class='arrow ${cls}'>`)
			.on('click', (e)=>{
				$l.toggleClass('closed');
				this.renumber();
				e.stopImmediatePropagation();
			});
		};
		
		let data = App.currData;
		{
			const $tli = $(`<li>`).appendTo($tree);
			const $tlbl = $(`<span class='bank'>Map Types</span>`).prepend(ARROW($tli)).appendTo($tli);
			const $tsub = $(`<ul>`).appendTo($tli);
			$tlbl.on('contextmenu', (e)=>this.showTypeMenu({ e }));
			
			for (let type in data.types) {
				const $li = $(`<li>`).appendTo($tsub);
				const $lbl = $(`<span class='type'>Type "${type}"</span>`).prepend(ARROW($li)).appendTo($li);
				const $sub = $(`<ul>`).appendTo($li);
				let d = data.types[type];
				if (d === this.selectedData) $lbl.addClass('selected');
				$lbl.on('click', ()=>this.select(d, $lbl));
				$lbl.on('contextmenu', (e)=>this.showTypeMenu({ e, type:d, typeId:type }));
				
				for (let area = 0; area < d.areas.length; area++) {
					let a = d.areas[area];
					const $ali = $(`<li>`).appendTo($sub);
					const $albl = $(`<span class='area'>Area ${area}: "${a.name}"</span>`).prepend(ARROW($ali, 'leaf')).appendTo($ali);
					if (a === this.selectedData) $albl.addClass('selected');
					$albl.on('click', ()=>this.select(a, $albl));
					$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:a, typeId:type, areaId:area }));
				}
			}
		}
		for (let bank = 0; bank < data.nodes.length; bank++) {
			// const $bli = $(`<li class='closed'>`);
			const $bli = $(`<li>`).appendTo($tree);
			const $blbl = $(`<span class='bank'>Bank ${bank}</span>`).prepend(ARROW($bli)).appendTo($bli);
			const $sub = $(`<ul>`).appendTo($bli);
			$blbl.on('contextmenu', (e)=>this.showBankMenu({ e, bank:data.nodes[bank], bankId:bank }));
			if (!data.nodes[bank]) {
				$blbl.addClass('emptyslot');
				continue; //move on to the next bank
			}
			
			for (let map = 0; map < data.nodes[bank].length; map++) {
				let d = data.nodes[bank][map];
				const $mli = $(`<li>`).appendTo($sub);
				const $mlbl = $(`<span class='map'>`).appendTo($mli);
				const $msub = $(`<ul>`).appendTo($mli);
				if (!d) {
					$mlbl.addClass('emptyslot');
					$mlbl.text(`Map ${map}`).prepend(ARROW($mli));
					$mlbl.on('contextmenu', (e)=>this.showMapMenu({ e, map:d, bankId:bank, mapId:map }));
					continue; //move on to the next map
				}
				$mlbl.text(`Map ${map}: "${d.name}"`).prepend(ARROW($mli));
				$mlbl.on('contextmenu', (e)=>this.showMapMenu({ e, map:d, bankId:bank, mapId:map }));
				if (d === this.selectedData) $mlbl.addClass('selected');
				$mlbl.on('click', ()=>this.select(d, $mlbl));
				
				let type = data.types[d.type] || data.types['default'];
				for (let area = 0; area < d.areas.length || area < type.areas.length; area++) {
					let a = d.areas[area];
					if (a) {
						const $ali = $(`<li>`).appendTo($msub);
						const $albl = $(`<span class='area'>Area ${area}: "${a.name}"</span>`).prepend(ARROW($ali, 'leaf')).appendTo($ali);
						if (a === this.selectedData) $albl.addClass('selected');
						$albl.on('click', ()=>this.select(a, $albl));
						$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:a, bankId:bank, mapId:map, areaId:area }));
					} else {
						a = type.areas[area];
						const $ali = $(`<li>`).appendTo($msub);
						const $albl = $(`<span class='area template'>Area ${area}: "${a.name}"</span>`).prepend(ARROW($ali, 'leaf')).appendTo($ali);
						// $albl.on('click', ()=>this.select(a, $albl));
						$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:null, bankId:bank, mapId:map, areaId:area, typeId:d.type, }));
					}
				}
			}
		}
		$tree.find('ul:empty').parent().addClass('leaf');
		this.renumber();
	}
	
	updatePropList($list, data) {
		$list.empty();
		if (!data) return;
		$(`<header>${data.constructor.name} Properties</header>`).appendTo($list);
		for (let key of data.constructor.PROPS){
			let $lbl = $(`<label>`);
			$(`<span class="key">${key}</span>`).appendTo($lbl);
			let $val = createValue(key, data);
			if (!$val) continue; //skip
			if (key === 'name') $val.on('change', ()=>this.updateTree());
			$val.appendTo($lbl);
			$lbl.appendTo($list);
		}
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
					return $(`<input class='val' type='text' disabled />`)
						.val(val);
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
			$sel.addClass('val');
			for (let t in App.currData.types) {
				const $opt = $(`<option class='${t}'>${t}</span>`);
				$opt.appendTo($sel);
			}
			return $sel;
		}
	}
	
	/** Refreshes the translit list. */
	updateTransitList() {
		const $list = $('#transprops');
		$list.empty();
		
		const enterReports = App.currData.reports.filter(x=>x.to === this.selectedData);
		const exitReports = App.currData.reports.filter(x=>x.from === this.selectedData);
		
		$(`<header>Enter Reports</header>`).appendTo($list);
		for (let report of enterReports) {
			let $report = $(`<div>`).addClass('report').appendTo($list);
			$(`<button class=''>${report.from || 'anywhere'}</button>`).appendTo($report)
				.wrap(`<span class='from'>`);
			$(`<input class='timeout' type='number'>`).appendTo($report)
				.val(report.timeout)
				.on('change', function(){ report.timeout = $(this).val(); });
			$(`<textarea spellcheck='true'>`).appendTo($report)
				.val(report.text)
				.on('change', function(){ report.text = $(this).val(); });
		}
		{
			$(`<button>`).appendTo($list).wrap('<div class="newReport">')
				.text('New Entrance Report')
				.on('click', ()=>{
					App.currData.addEnterReport(this.selectedData);
					this.updateTransitList();
				});
		}
		$(`<header>Exit Reports</header>`).appendTo($list);
		for (let report of exitReports) {
			let $report = $(`<div>`).addClass('report').appendTo($list);
			$(`<button class=''>${report.to || 'anywhere'}</button>`).appendTo($report)
				.wrap(`<span class='to'>`);
			$(`<input class='timeout' type='number'>`).appendTo($report)
				.val(report.timeout)
				.on('change', function(){ report.timeout = $(this).val(); });
			$(`<textarea spellcheck='true'>`).appendTo($report)
				.val(report.text)
				.on('change', function(){ report.text = $(this).val(); });
		}
		{
			$(`<button>`).appendTo($list).wrap('<div class="newReport">')
				.text('New Exit Report')
				.on('click', ()=>{
					App.currData.addExitReport(this.selectedData);
					this.updateTransitList();
				});
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
		let file = this.$dialog.find('[name=savePath]').val();
		let name = this.$dialog.find('[name=name]').val();
		let romFile = this.$dialog.find('[name=romPath]').val();
		if (!file) { window.alert('Please provide a file path!'); return; }
		if (!name) { window.alert('Please name the region!'); return; }
		let romReader = ((gen)=>{
			switch (gen) {
				case '1': return require('./romread').Gen1Reader;
				case '2': return require('./romread').Gen2Reader;
				// case '3': return require('./romread').Gen3Reader;
				// case '4': return require('./romread').Gen4Reader;
				// case '5': return require('./romread').Gen5Reader;
				// case '6': return require('./romread').Gen6Reader;
				// case '7': return require('./romread').Gen7Reader;
				default: throw new Error('Unsupported generation!');
			}
		})(this.$dialog.find('[name=gen]:checked').val());
		romReader = new romReader(romFile);
		App.newRegion({ file, name, romReader });
		this.$dialog.hide();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Main

let mapPanel, newRegionDialog;

makeMenubar();

$(()=>{
	mapPanel = new MapPanel();
	newRegionDialog = new NewRegionDialog();
	
	const TITLE = 'Maptool';
	App.on('dirty', (dirty)=>{
		let file = '';
		if (App.currData) {
			file = ` | ${App.currData.name}`;
		}
		document.title = (dirty?'*':'') + TITLE + file;
	});
});


///////////////////////////////////////////////////////////////////////////////////////////////////
// Other Functions

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
			key:'o', modifiers:'ctrl',
			click() {
				let chooser = $('#openPath');
				chooser.unbind('change').on('change', ()=>{
					try {
						let file = chooser.val();
						App.loadRegion(file);
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
			click() { App.saveRegion(); },
		}));
		
		menu.append(new nw.MenuItem({ label:'File', submenu }));
	}{
		let submenu = new nw.Menu();
		submenu.append(new nw.MenuItem({ label:'Open Map Window',
			key:'m', modifiers:'ctrl',
			click() { App.openMapWindow(); }
		}));
		menu.append(new nw.MenuItem({ label:'View', submenu }));
	}
	nw.Window.get().menu = menu;
}

function deleteArrayIndex(arr, index) {
	delete arr[index];
	// shrink away empty space at the end of an array
	while (!(arr.length-1 in arr) && arr.length > 0) { arr.length--; }
}
