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
		if ($lbl) { $lbl.addClass('selected'); }
		else { this.updateTree(); }
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
				App.currData.types[id] = new MapType({ type:id });
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
	/** Shows the context menu when clicking on a transit report. */
	showTransitMenu({ e, report, node:otherNode, }) {
		let self = this;
		let thisType  = (report.from === otherNode)?'enter':'exit';
		let otherType = (report.from === otherNode)?'exit':'enter';
		
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({ label:`Select other map`,
			enabled: !!otherNode,
			click() {
				self.select(otherNode);
			}
		}));
		menu.append(new nw.MenuItem({ label:`Switch to ${otherType} report`,
			click() {
				let x = report.from;
				report.from = report.to;
				report.to = x;
				self.updateTransitList();
			}
		}));
		menu.append(new nw.MenuItem({ type:'separator' }));
		menu.append(new nw.MenuItem({ label:`Delete transit report`,
			click() {
				App.currData.deleteReport(report);
				self.updateTransitList();
			}
		}));
		e.preventDefault();
		menu.popup(e.pageX, e.pageY);
	}
	/** Shows the context menu when clicking on an attribute. */
	showAttributeMenu({ e, fnDel }) {
		let self = this;
		
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({ label:`Delete override`,
			click : fnDel,
		}));
		e.preventDefault();
		menu.popup(e.pageX, e.pageY);
	}
	
	
	/** Refreshes the tree view. */
	updateTree($tree, { clickCallback=null, selected, includeTypes=true, startClosed=false, }={}) {
		$tree = $tree || $('#maptree');
		selected = selected || this.selectedData;
		$tree.empty();
		const ARROW = ($l, cls='')=>{
			let $a = $(`<span class='arrow ${cls}'>`)
			.on('click', (e)=>{
				$l.toggleClass('closed');
				this.renumber();
				e.stopImmediatePropagation();
			});
			if (startClosed) $l.addClass('closed');
			return $a;
		};
		
		let data = App.currData;
		if (includeTypes) {
			const $tli = $(`<li>`).appendTo($tree);
			const $tlbl = $(`<span class='bank'>Map Types</span>`).prepend(ARROW($tli)).appendTo($tli);
			const $tsub = $(`<ul>`).appendTo($tli);
			if (!clickCallback) {
				$tlbl.on('contextmenu', (e)=>this.showTypeMenu({ e }));
			}
			
			for (let type in data.types) {
				const $li = $(`<li>`).appendTo($tsub);
				const $lbl = $(`<span class='type'>Type "${type}"</span>`).prepend(ARROW($li)).appendTo($li);
				const $sub = $(`<ul>`).appendTo($li);
				let d = data.types[type];
				if (d === selected) $lbl.addClass('selected');
				if (!clickCallback) {
					$lbl.on('click', ()=>this.select(d, $lbl));
					$lbl.on('contextmenu', (e)=>this.showTypeMenu({ e, type:d, typeId:type }));
				}
				else { $lbl.on('click', (e)=> clickCallback({ e, node:d, typeId:type })); }
				
				for (let area = 0; area < d.areas.length; area++) {
					let a = d.areas[area];
					const $ali = $(`<li>`).appendTo($sub);
					const $albl = $(`<span class='area'>Area ${area}: "${a.name}"</span>`).prepend(ARROW($ali, 'leaf')).appendTo($ali);
					if (a === selected) $albl.addClass('selected');
					if (!clickCallback) {
						$albl.on('click', ()=>this.select(a, $albl));
						$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:a, typeId:type, areaId:area }));
					}
					else { $albl.on('click', (e)=> clickCallback({ e, node:a, typeId:type, areaId:area })); }
				}
			}
		}
		for (let bank = 0; bank < data.nodes.length; bank++) {
			// const $bli = $(`<li class='closed'>`);
			const $bli = $(`<li>`).appendTo($tree);
			const $blbl = $(`<span class='bank'>Bank ${bank}</span>`).prepend(ARROW($bli)).appendTo($bli);
			const $sub = $(`<ul>`).appendTo($bli);
			if (!clickCallback) {
				$blbl.on('contextmenu', (e)=>this.showBankMenu({ e, bank:data.nodes[bank], bankId:bank }));
			}
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
					if (!clickCallback) {
						$mlbl.on('contextmenu', (e)=>this.showMapMenu({ e, map:d, bankId:bank, mapId:map }));
					}
					continue; //move on to the next map
				}
				$mlbl.text(`Map ${map}: "${d.name}"`).prepend(ARROW($mli));
				if (d === selected) $mlbl.addClass('selected');
				if (!clickCallback) {
					$mlbl.on('click', ()=>this.select(d, $mlbl));
					$mlbl.on('contextmenu', (e)=>this.showMapMenu({ e, map:d, bankId:bank, mapId:map }));
				}
				else { $mlbl.on('click', (e)=> clickCallback({ e, node:d, bankId:bank, mapId:map })); }
				
				let type = data.types[d.type] || data.types['default'];
				for (let area = 0; area < d.areas.length || area < type.areas.length; area++) {
					let a = d.areas[area];
					if (a) {
						const $ali = $(`<li>`).appendTo($msub);
						const $albl = $(`<span class='area'>Area ${area}: "${a.name}"</span>`).prepend(ARROW($ali, 'leaf')).appendTo($ali);
						if (a === selected) $albl.addClass('selected');
						if (!clickCallback) {
							$albl.on('click', ()=>this.select(a, $albl));
							$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:a, bankId:bank, mapId:map, areaId:area }));
						}
						else { $albl.on('click', (e)=> clickCallback({ e, node:a, bankId:bank, mapId:map, areaId:area })); }
					} else {
						a = type.areas[area];
						const $ali = $(`<li>`).appendTo($msub);
						const $albl = $(`<span class='area template'>Area ${area}: "${a.name}"</span>`).prepend(ARROW($ali, 'leaf')).appendTo($ali);
						if (!clickCallback) {
							// $albl.on('click', ()=>this.select(a, $albl));
							$albl.on('contextmenu', (e)=>this.showAreaMenu({ e, area:null, bankId:bank, mapId:map, areaId:area, typeId:d.type, }));
						}
						// else { $albl.on('click', (e)=> clickCallback({ e, node:null, bankId:bank, mapId:map, areaId:area, typeId:d.type, })); }
					}
				}
			}
		}
		$tree.find('ul:empty').parent().addClass('leaf');
		if (startClosed) $tree.find('.selected').parents('.closed').removeClass('closed');
		this.renumber();
	}
	
	updatePropList($list, data) {
		$list.empty();
		if (!data) return;
		let self = this;
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
			createAttr(key, data.attrs).appendTo($list);
		}
		return;
		
		function createValue(key, obj) {
			if (key.indexOf('/') > 0) { // (X,Y) properties stored separately
				let [x, y] = key.split('/');
				let $pair = $(`<span class='valpair'>`);
				$(`<input class='val' type='number' />`).val(obj[x]).appendTo($pair)
					.on('change', function(){
						obj[x] = $(this).val();
						App.notifyChange('prop-change', data);
					});
				$(`<input class='val' type='number' />`).val(obj[y]).appendTo($pair)
					.on('change', function(){
						obj[y] = $(this).val();
						App.notifyChange('prop-change', data);
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
							App.notifyChange('prop-change', data);
						});
			}
			switch (typeof val) {
				case 'number':
					return $(`<input class='val' type='number' />`).val(val)
						.on('change', function(){
							obj[key] = $(this).val();
							App.notifyChange('prop-change', data);
						});
				case 'string':
					return $(`<input class='val' type='text' />`).val(val)
						.on('change', function(){
							obj[key] = $(this).val();
							App.notifyChange('prop-change', data);
						});
			}
		}
		
		function createAttr(key, obj) {
			let $lbl = $(`<label>`);
			let $key = $(`<span class='key'>${key}</span>`).attr('title', ATTRS[key].tooltip).appendTo($lbl);
			let $val = $(`<span class='val'>`).appendTo($lbl);
			let info = ATTRS[key];
			
			let fnDel;
			
			// let $checkThis = $(`<input type='checkbox'/>`).prop({ checked:(key in obj) }).appendTo($val);
			$lbl.toggleClass('overridden', key in obj);
			
			if (info.allowOther) {
				let $other = $(`<input type='text' name='pother'/>`);
				info.values.forEach(x=>{
					if (x === false) x = '--';
					if (x === '') x = '_';
					$(`<label class='radio'><input type='radio' value='${x}'/> ${x}</label>`).appendTo($val);
				});
				$(`<label class='radio'><input type='radio' value='other'/> </label>`).append($other).appendTo($val);
				if (info.values.indexOf(obj[key]) > -1) {
					let val = obj[key];
					if (val === false) val = '--';
					if (val === '') val = '_';
					$val.find(`input[type=radio][value=${val}]`).prop({ checked:true });
				} else if (obj[key] !== undefined) {
					$other.val(obj[key]);
					$val.find(`input[type=radio][value=other]`).prop({ checked:true });
				}
				
				$val.find('input[type=radio]').on('change', function(){
					if (this.value === 'other') {
						$other.prop({ disabled:false });
					} else {
						$other.prop({ disabled:true }).val('');
					}
					let val = this.value;
					if (val == '--') val = false;
					if (val == '_') val = '';
					if (val == 'other') val = $other.val();
					obj[key] = val;
					$lbl.addClass('overridden');
					App.notifyChange('prop-change', data);
				});
				$other.on('change', function(){
					obj[key] = $other.val();
					$lbl.addClass('overridden');
					App.notifyChange('prop-change', data);
				});
				fnDel = ()=>{
					$val.find('input[type=radio]').prop({ checked:false });
					$other.val('');
					delete obj[key];
					$lbl.removeClass('overridden');
					App.notifyChange('prop-change', data);
				};
			} else if (info.values) {
				let $sel = $('<select>').appendTo($val);
				$sel.append(info.values.map(x=>{
					if (x === false) x = '--';
					return $(`<option>${x}</option>`)
				}));
				$sel.on('change', function(){
					let val = $sel.val();
					if (val === '--') val = false;
					obj[key] = val;
					$lbl.addClass('overridden');
					App.notifyChange('prop-change', data);
				});
				if (obj[key]) {
					$sel.val(obj[key]);
				} else {
					$sel.val('--');
				}
				fnDel = ()=>{
					$sel.val('--');
					delete obj[key];
					$lbl.removeClass('overridden');
					App.notifyChange('prop-change', data);
				};
			} else if (info.stringValue) {
				let $str = $(`<input type='text'/>`).appendTo($val)
					.on('change', function(){
						obj[key] = $(this).val();
						$lbl.addClass('overridden');
						App.notifyChange('prop-change', data);
					});
				if (obj[key]) {
					$str.val(obj[key]);
				} else {
					$str.val('');
				}
				fnDel = ()=>{
					$str.val('');
					delete obj[key];
					$lbl.removeClass('overridden');
					App.notifyChange('prop-change', data);
				};
			} else {
				let $check = $(`<input type='checkbox'/>`).appendTo($val);
				if (key in obj) {
					$check.prop({ checked:obj[key] });
				} else {
					$check.prop({ checked:false, indeterminate:true });
				}
				$check.on('change', function(){
					obj[key] = !!$(this).prop('checked');
					$lbl.addClass('overridden');
					App.notifyChange('prop-change', data);
				});
				fnDel = ()=>{
					$check.prop({ indeterminate:true });
					delete obj[key];
					$lbl.removeClass('overridden');
					App.notifyChange('prop-change', data);
				};
			}
			
			if (info.areasOnly && !(data instanceof MapArea)) {
				$lbl.addClass('disabled');
				$val.find('input,select').prop('disabled', true);
			}
			
			$lbl.on('contextmenu', (e)=> self.showAttributeMenu({ e, fnDel }));
			
			return $lbl;
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
			$(`<button class=''>${toStr(report.from || 'anywhere')}</button>`).appendTo($report)
				.wrap(`<span class='from'>`)
				.on('click', function(){
					selectMapDialog.show(report.from).then((node)=>{
						if (node === undefined) return; //cancled
						report.from = node;
						$(this).text(toStr(report.from || 'anywhere'));
						App.notifyChange('prop-change', report);
					});
				});
			$(`<input class='timeout' type='number'>`).appendTo($report)
				.val(report.timeout / (60*1000))
				.on('change', function(){
					report.timeout = $(this).val() * (60*1000);
					App.notifyChange('prop-change', report);
				});
			$(`<textarea spellcheck='true'>`).appendTo($report)
				.val(report.text)
				.on('change', function(){
					report.text = $(this).val();
					App.notifyChange('prop-change', report);
				});
			$report.on('contextmenu', (e)=>this.showTransitMenu({ e, report, node:report.from }));
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
			$(`<button class=''>${toStr(report.to || 'anywhere')}</button>`).appendTo($report)
				.wrap(`<span class='to'>`)
				.on('click', function(){
					selectMapDialog.show(report.to).then((node)=>{
						if (node === undefined) return; //cancled
						report.to = node;
						$(this).text(toStr(report.to || 'anywhere'));
						App.notifyChange('prop-change', report);
					});
				});
			$(`<input class='timeout' type='number'>`).appendTo($report)
				.val(report.timeout / (60*1000))
				.on('change', function(){
					report.timeout = $(this).val() * (60*1000);
					App.notifyChange('prop-change', report);
				});
			$(`<textarea spellcheck='true'>`).appendTo($report)
				.val(report.text)
				.on('change', function(){
					report.text = $(this).val();
					App.notifyChange('prop-change', report);
				});
			$report.on('contextmenu', (e)=>this.showTransitMenu({ e, report, node:report.to }));
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
	
	renumber() {
		// $('#maptree li:visible').each((i,e)=>{
		$('.treepane').each(function(){
			$(this).find('li:visible').each((i,e)=>{
				$(e).removeClass('n0 n1').addClass('n'+(i%2));
			});
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
				case 'rom1': return require('./romread').Gen1Reader;
				case 'rom2': return require('./romread').Gen2Reader;
				// case 'rom3': return require('./romread').Gen3Reader;
				// case 'rom4': return require('./romread').Gen4Reader;
				// case 'rom5': return require('./romread').Gen5Reader;
				// case 'rom6': return require('./romread').Gen6Reader;
				// case 'rom7': return require('./romread').Gen7Reader;
				// case 'tab1': return require('./romread').Gen1TableReader;
				// case 'tab2': return require('./romread').Gen2TableReader;
				// case 'tab3': return require('./romread').Gen3TableReader;
				case 'tab4': return require('./romread').Gen4TableReader;
				// case 'tab5': return require('./romread').Gen5TableReader;
				// case 'tab6': return require('./romread').Gen6TableReader;
				// case 'tab7': return require('./romread').Gen7TableReader;
				default: throw new Error('Unsupported generation!');
			}
		})(this.$dialog.find('[name=gen]:checked').val());
		romReader = new romReader(romFile);
		App.newRegion({ file, name, romReader });
		this.$dialog.hide();
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// New Dialog

class SelectMapDialog {
	constructor() {
		this.$dialog = $('#selectMapDialog');
		this.$dialog.find('[name=closeBtn]').on('click', ()=>{
			if (this._resolve) this._resolve(undefined);
			this.hide();
		});
		this.$dialog.find('[name=anyBtn]').on('click', ()=>{
			if (this._resolve) this._resolve(null);
			this.hide();
		});
		this.$tree = this.$dialog.find('.treepane');
	}
	
	show(node) {
		return new Promise((resolve, reject)=>{
			this._resolve = resolve;
			this._reject = reject;
			mapPanel.updateTree(this.$tree, {
				selected: node,
				startClosed: true,
				clickCallback:(args)=>{
					resolve(args.node);
					this.hide();
				},
			});
			this.$dialog.show();
			mapPanel.renumber();
		});
	}
	hide() {
		this.$dialog.hide();
		this._resolve = null;
		this._reject = null;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Main

let mapPanel, newRegionDialog, selectMapDialog;

makeMenubar();

$(()=>{
	mapPanel = new MapPanel();
	newRegionDialog = new NewRegionDialog();
	selectMapDialog = new SelectMapDialog();
	
	const TITLE = 'Maptool';
	App.on('dirty', (dirty)=>{
		let file = '';
		if (App.currData) {
			file = ` | ${App.currData.name}`;
		}
		document.title = (dirty?'*':'') + TITLE + file;
	});
	App.on('map-changed', (args)=>{
		mapPanel.select(App.currData.resolve(args));
	});
	App.on('update-maptree', ()=> mapPanel.updateTree());
});


///////////////////////////////////////////////////////////////////////////////////////////////////
// Other Functions

function makeMenubar() {
	let menu = new nw.Menu({type: 'menubar'});
	{
		let submenu = new nw.Menu();
		submenu.append(new nw.MenuItem({ label:'New Map',
			click() {
				if (App.isDirty && !window.confirm('There are unsaved changes. Continue?')) return;
				$('#newDialog').show();
			}
		}));
		submenu.append(new nw.MenuItem({ label:'Open Map',
			key:'o', modifiers:'ctrl',
			click() {
				if (App.isDirty && !window.confirm('There are unsaved changes. Continue?')) return;
				let chooser = $('#openPath');
				chooser.unbind('change').val('').on('change', ()=>{
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
		submenu.append(new nw.MenuItem({ label:'Revert Map',
			click() {
				if (App.isDirty && !window.confirm('Are you sure you want to revert?')) return;
				App.loadRegion(App.currFile);
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
		submenu.append(new nw.MenuItem({ label:'Open Report Window',
			key:'r', modifiers:'ctrl',
			click() { App.openReportWindow(); }
		}));
		menu.append(new nw.MenuItem({ label:'View', submenu }));
	}
	nw.Window.get().menu = menu;
}

function toStr(node) {
	if (node === null) return 'null';
	if (node === undefined) return 'undefined';
	if (typeof node === 'string') return node;
	switch (node.constructor.name) {
		case 'MapNode': return `Map [${node.locId}] "${node.name}"`;
		case 'MapType': return `Type [${node.name}]`;
		case 'MapArea': return `Area [${node.locId}] "${node.name}"`;
	}
	return node.toString();
}

function deleteArrayIndex(arr, index) {
	delete arr[index];
	// shrink away empty space at the end of an array
	while (!(arr.length-1 in arr) && arr.length > 0) { arr.length--; }
}
