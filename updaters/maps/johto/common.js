// Johto (GSC)
// Common Mapping Functions

const { Node } = require("../map.js");

// Defaults for this particular region
const Center = function(mapids, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
	if (!Array.isArray(mapids)) mapids = [mapids];
	let me = new Node({ name:"Pokémon Center", mapids, attrs:Object.assign({
		"indoors": true,
		"healing": "pokecenter",
		announce, the, noteworthy: true,
	}, attrs), locOf:Object.assign({
		"pc": ["9,2"],
	}, locOf) });
	me.addConnection(...connections);
	// me.addConnection("Union Room");
	me._typename = "Center";
	me.getName = function() {
		if (this.parent) return `${this.parent.getName()} ${this.name}`;
		return this.name;
	};
	return me;
};
const PokeCenter = Center;

// Helper functions
const id = ()=>{
	let currBank = 0;
	let currArea = 0;
	return function id( mapbank, mapid, areaid, set=true ) {
		if (areaid===undefined && mapid===undefined) {
			return `${currArea}:${currBank}.${mapbank}`;
		}
		if (areaid===undefined) {
			return `${currArea}:${mapbank}.${mapid}`;
		}
		if (set) {
			currBank = mapbank;
			currArea = areaid;
		}
		return `${areaid}:${mapbank}.${mapid}`;
	}
}();
function ref(mapbank, mapid, areaid) {
	return `${areaid}:${mapbank}.${mapid}`;
}
function r(num) { return `Route ${num}`; }
function firstTime(key, phrase) {
	return (loc, reporter)=>{
		if (reporter.isFirstTime(key)) {
			return phrase,
		}
		return null;
	},
}
// function gameSpecific(black, white) {
// 	if (global.game == "Pyrite") return black;
// 	return white;
// }


module.exports = Object.assign({},
	require("../map.js"),
	require('../../../data-format').Location,
	Center, PokeCenter,
	id, ref, r, firstTime,
);