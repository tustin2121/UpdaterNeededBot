// maptool main.js
// Maptool main file

const fs = require('fs');

let currFile = null;
let currData = null;
let loadedROM = null;

let currMap = null;

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
		$('#newDialog [name=genRadio]').show(hasROM);
		$('#newDialog [name=typeRadio]').show(!hasROM);
	});
	
	
	
	resize();
});

function resize() {
	let canvas = $('#map')[0];
	canvas.width = $('body').innerWidth() - $('#sidebar').outerWidth();
	canvas.height = $('#sidebar').outerHeight()
	$('#map').css({
		left: $('#sidebar').outerWidth(),
	});
}

function selectTemplate(data, $lbl) {
	currMap = { type:'template', data, };
}
function selectMap(data, $lbl) {
	currMap = { type:'map', data, };
}

function drawMap() {
	if (!currMap || currMap.type !== 'map') return;
	
	let map = currMap.data;
	let g = $('#map')[0].getContext('2d');
	const CX = $('#map').innerWidth() / 2;
	const CY = $('#map').innerHeight() / 2;
	
}

function updatePropertyList() {
	let $list = $('#proppane');
	
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
				const $bli = $(`<li>`);
				const $blbl = $(`<span class='bank closed'>Bank ${bank}</span>`);
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
			typeDefaults: {
				center: { indoors:true, heal:true },
			},
			nodes: null,
		};
		if (romFile) {
			let reader, idType;
			switch ($('#newDialog [name=idtype]:checked').val()) {
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
			data.nodes = reader.readMaps();
		} else {
			data.idType = $('#newDialog [name=idtype]:checked').val();
			data.nodes = {};
		}
		fs.writeFileSync(file, JSON.stringify(data, null, '\t'));
		loadRegion(file);
	} catch (e) {
		
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
						let data = fs.readFileSync(file);
						data = JSON.parse(data);
						//TODO validate
						currFile = file;
						load(data);
					} catch (e) {
						console.log('Error!', e);
					}
				});
				chooser.trigger('click');
			}
	 	}));
		submenu.append(new nw.MenuItem({ type:'separator' }));
		submenu.append(new nw.MenuItem({ label:'Save',
			click:saveRegion,
			key:'s', modifiers:'ctrl',
		}));
		
		menu.append(new nw.MenuItem({ label:'File', submenu }));
	}
	nw.Window.get().menu = menu;
}
