// data/genopts/gen2.js
// Defines the default generation options for a Gen 2 run

module.exports = {
	rtc: true,
	specialSplit: false,
	abilities: false,
	natures: false,
	characteristics: false,
	infinteTM: false,
	hubE4: false,
	'3d': false,
	
	namingMatch: /-_/i,
	moveInfo: 'gen2/movetable.js',
	
	badgeNames: [
		"Zephyr", "Hive", "Plain", "Fog", "Mineral", "Storm", "Glacier", "Rising",
		"Boulder", "Cascade", "Thunder", "Rainbow", "Marsh", "Soul", "Volcano", "Earth",
	],
	e4Names: [ "Will", "Koga", "Bruno", "Karen" ],
	champName: "Lance",
	rivalName: "???",
	correctCase: true,
	
	pokeballIds: [ 1,2,4,5,157,159,160,161,163,164,165,166,177, ],
	vendedItemIds: [ 0x2E, 0x2F, 0x30 ],
	berryIds: [ 74,78,79,80,83,84,109,139,150,173,174 ],
	pcBoxCapacity: 20,
	pcBoxRollover: false,
};