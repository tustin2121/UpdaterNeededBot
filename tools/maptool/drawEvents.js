// maptool drawEvents.js
// Fucntions which will draw various types of map events to the map view

const EVENT_TYPES = {};

EVENT_TYPES['g2:coord'] = 
function (g, event, { BLOCK, map, }){
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
	
	let tx = g.measureText(en.toString(16));
	g.font = `${this.zoomLevel-2}pt monospace`;
	g.fillStyle = `#005366`;
	g.fillText(en.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
};


EVENT_TYPES['g2:bg'] = 
function (g, event, { BLOCK, map, }){
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
	
	let tx = g.measureText(en.toString(16));
	g.font = `${this.zoomLevel-2}pt monospace`;
	g.fillStyle = `#00663D`;
	g.fillText(en.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
};

EVENT_TYPES['g2:object'] = 
function (g, event, { BLOCK, map, }){
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
	
	
	let tx = g.measureText(en.toString(16));
	g.font = `${this.zoomLevel-2}pt monospace`;
	g.fillStyle = `#500066`;
	g.fillText(en.toString(16), r.x+(r.w/2)-(tx.width/2), r.y+(r.h*0.8));
};







module.exports = function drawEvent(g, event, context) {
	if (!event) return;
	g.save();
	try {
		EVENT_TYPES[event.type].call(this, g, event, context);
	} catch (e) {
		console.error(e);
	}
	g.restore();
};