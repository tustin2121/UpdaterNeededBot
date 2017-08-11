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

/** Single Map Dungeon */
const SingleCave = function(name, mapids, { the=true, attrs={}, locOf={}, buildings=[], zones=[], connections=[], announce, legendary, noteworthy=false }={}){
	if (!Array.isArray(mapids)) mapids = [mapids];
	if (legendary) locOf.legendary = legendary.loc;
	let me = new Node({ name, mapids, attrs:Object.assign({
		"indoors": true,
		"dungeon": true,
		"noteworthy": true,
		"onto": "into",
		noteworthy, announce, legendary, the,
	}, attrs), locOf });
	me.addChild(...zones);
	me.addChild(...buildings);
	me.addConnection(...connections);
	me._typename = "Area";
	return me;
};
const SingleDungeon = SingleCave;
const Cave1 = SingleCave;
const Dungeon1 = SingleDungeon;

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
	};
}
function uponEnteringMapBank(bank, phrase) {
	return (loc, reporter)=>{
		if (reporter.prevInfo.location.map_bank !== loc.map_bank) {
			return phrase;
		}
		return null;
	};
}

module.exports = Object.assign({},
	require("../map.js"),
	require('../../../data-format').Location,
	Center, PokeCenter,
	SingleCave, SingleDungeon, Cave1, Dungeon1,
	id, ref, r, firstTime,
);