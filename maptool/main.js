// maptool main.js
// Maptool main file

const fs = require('fs');

let currFile = null;
let currData = null;

makeMenu();





function load(data) {
	currData = data;
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
						
					}
				});
				chooser.trigger('click');
			}
	 	}));
		submenu.append(new nw.MenuItem({ type:'separator' }));
		submenu.append(new nw.MenuItem({ label:'Load Maps from ROM...',
			click() {
				
			}
	 	}));
		
		menu.append(new nw.MenuItem({ label:'File', submenu }));
	}
	nw.Window.get().menu = menu;
}
