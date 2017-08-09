// Johto (GSC)
// This is gen 2 Kanto

const {
	Region, Town, City, Area, Route, Dungeon,
	Building, Floor, House, Cave, Gatehouse,
	Mart, PokeMart, Gym,
	Cutscene, Node,
	Center, PokeCenter,
	
	Location,
	
	id, ref, r, firstTime,
} = require("./common.js");

module.exports = [
	Route(22, id(23,2,88), {
		connections: [ ref(23,13,255) ],
	}),
];