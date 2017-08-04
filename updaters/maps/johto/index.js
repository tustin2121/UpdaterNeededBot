// Johto (GSC)
// Includes Gen 2 Kanto

const fs = require('fs');
const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
} = require("../map.js");


// // Defaults for this particular region
// const Center = function(mapids, { the=true, attrs={}, locOf={}, connections=[], announce, }={}){
// 	if (!Array.isArray(mapids)) mapids = [mapids];
// 	let me = new Node({ name:"Pokémon Center", mapids, attrs:Object.assign({
// 		"indoors": true,
// 		"healing": "pokecenter",
// 		"shopping": true,
// 		announce, the, noteworthy: true,
// 	}, attrs), locOf:Object.assign({
// 		"pc": ["4,12"],
// 	}, locOf) });
// 	me.addConnection(...connections);
// 	me.addConnection("Union Room");
// 	me._typename = "Center";
// 	me.getName = function() {
// 		if (this.parent) return `${this.parent.getName()} ${this.name}`;
// 		return this.name;
// 	};
// 	return me;
// };
// const PokeCenter = Center;


// Helper functions
function id( mapid, parentId, matrix=0 ) {
	let d = HEADER.reverse[`${mapid}:${parentId}:${matrix}`];
	// console.log(`${mapid}:${parentId}:${matrix} => ${d}`);
	if (!d) return `${mapid}:${parentId}:${matrix}`;
	return `${d}`;
	// return { mapid, parentId, matrix };
}
function gameSpecific(black, white) {
	if (global.game == "Pyrite") return black;
	return white;
}

// The region itself
const Johto = module.exports =
new Region({ name:"Johto", mapid:"identity" }, [
]);

Johto.resolve();