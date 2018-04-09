// maptool map.js
// Maptool map scripts

const { MapNode, MapArea } = require('./mapnode.js');

/* global App, window, document */
window.App = global.App;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Type Defaults Dialog

class MapPanel {
	constructor() {
		this.currMap = null;
		this.zoomLevel = 8;
		App.on('map-selected', (node)=> this.select(node));
		App.on('map-changed', (args)=>{
			this.select(App.currData.resolve(args));
		});
		// $('#map')[0].onwheel = ()=>{  };
	}
	resize() {
		let canvas = $('#map')[0];
		canvas.width = $('body').innerWidth();
		canvas.height = $('body').innerHeight()
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
	
	select(data) {
		if (data instanceof MapArea) data = data.__parent__;
		if (!(data instanceof MapNode)) data = null; // Can't draw what's not a Map
		this.currMap = data;
		this.repaint();
	}
	repaint() {
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
			let data = this.currMap.gamedata;
			// Draw connections:
			for (let dir in data.conns) {
				let conn = data.conns[dir];
				let off = { x:-map.width/2, y:-map.height/2 };
				// console.log(`offset:`,off);
				try {
					let om = App.getMap(conn);
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
			for (let en = 0; data.events && en < data.events.length; en++) {
				drawEvent.call(this, g, data.events[en], {
					map, BLOCK, index:en,
				});
			}
			// Draw warps
			for (let wn = 0; data.warps && wn < data.warps.length; wn++) {
				let warp = data.warps[wn];
				if (!warp) continue;
				try {
					let om = App.getMap(warp);
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
// Draw Events

const EVENT_TYPES = {};
function drawEvent(g, event, context) {
	if (!event) return;
	g.save();
	try {
		EVENT_TYPES[event.type].call(this, g, event, context);
	} catch (e) {
		console.error(e);
	}
	g.restore();
}

EVENT_TYPES['g2:coord'] =
function (g, event, { BLOCK, map, index }){
	g.fillStyle = `#00A7CC`;
	g.strokeStyle = `#007D99`;
	
	let r = {
		x: (-(map.width/2)+event.x) * BLOCK,
		y: (-(map.height/2)+event.y) * BLOCK,
		w: BLOCK,
		h: BLOCK,
	};
	g.fillRect  (r.x, r.y, r.w, r.h);
	g.strokeRect(r.x, r.y, r.w, r.h);
	
	// TODO add event.sceneId printing?
	
	let tx = g.measureText(index.toString(16));
	g.font = `${this.zoomLevel-2}pt monospace`;
	g.fillStyle = `#005366`;
	g.fillText(index.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
};

EVENT_TYPES['g2:bg'] =
function (g, event, { BLOCK, map, index }){
	// TODO Replace the generic handling below
	g.fillStyle = `#00CC7A`;
	g.strokeStyle = `#00995C`;
	
	let r = {
		x: (-(map.width/2)+event.x) * BLOCK,
		y: (-(map.height/2)+event.y) * BLOCK,
		w: BLOCK,
		h: BLOCK,
	};
	g.fillRect  (r.x, r.y, r.w, r.h);
	g.strokeRect(r.x, r.y, r.w, r.h);
	
	//TODO:
	switch (event.bgType) {
		case 'UP': //Only read event if facing this direction
		case 'DOWN':
		case 'LEFT':
		case 'RIGHT':
			//TODO
			break;
		case 'READ': //Read event regardless of direction
			//TODO
			break;
		case 'ITEM': //hidden item
			//TODO
			break;
		case 'COPY':
		case 'IFSET':
		case 'IFNOTSET': //begin scenes in various ways
			break;
	}
	
	let tx = g.measureText(index.toString(16));
	g.font = `${this.zoomLevel-2}pt monospace`;
	g.fillStyle = `#00663D`;
	g.fillText(index.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
};

EVENT_TYPES['g2:object'] =
function (g, event, { BLOCK, map, index }){
	// TODO Replace the generic handling below
	g.fillStyle = `#A000CC`;
	g.strokeStyle = `#780099`;
	
	let r = {
		x: (-(map.width/2)+event.x) * BLOCK,
		y: (-(map.height/2)+event.y) * BLOCK,
		w: BLOCK,
		h: BLOCK,
	};
	g.fillRect  (r.x, r.y, r.w, r.h);
	g.strokeRect(r.x, r.y, r.w, r.h);
	
	//TODO clean up based on MoveFn probably
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
	
	
	let tx = g.measureText(index.toString(16));
	g.font = `${this.zoomLevel-2}pt monospace`;
	g.fillStyle = `#500066`;
	g.fillText(index.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Main

let mapPanel;

makeMenu();

$(()=>{
	mapPanel = new MapPanel();
	
	window.onresize = resize;
	resize();
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// Other Functions

function resize() {
	mapPanel.resize();
}

function makeMenu() {
	let menu = new nw.Menu({type: 'menubar'});
	{
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
