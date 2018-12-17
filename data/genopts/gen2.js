// data/genopts/gen2.js
// Defines the default generation options for a Gen 2 run

module.exports = {
	rtc: true,
	phonebook: 'Pokégear',
	personalityValues: false,
	specialSplit: false,
	abilities: false,
	natures: false,
	characteristics: false,
	infinteTM: false,
	hubE4: false,
	'3d': false,
	dependentTrainerId: true,
	
	namingMatch: /-_/i,
	moveInfo: 'gen2/movetable.js',
	
	trainerClasses: {
		// The following have special handling available
		rival: [9,],
		leader: [1,2,3,4,5,6,7,8,17,18,19,21,26,35,42,46,64,],
		e4: [11,13,14,15],
		champ: [16,63,],
	},
	
	badgeNames: [
		"Zephyr", "Hive", "Plain", "Fog", "Mineral", "Storm", "Glacier", "Rising",
		"Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth",
	],
	e4Names: [ "Will", "Koga", "Bruno", "Karen" ],
	champName: "Lance",
	rivalName: "???",
	correctCase: true,
	
	itemIds_pokeballs: [ 1,2,4,5,157,159,160,161,163,164,165,166,177, ],
	itemIds_promo: [ ],
	itemIds_vending: [ 0x2E, 0x2F, 0x30 ],
	itemIds_berries: [ 74,78,79,80,83,84,109,139,150,173,174 ],
	itemIds_evoStones: [ 8,22,23,24,34,169, ],
	itemIds_tms: [
		    191,192,193,194,    196,197,198,199,
		200,201,202,203,204,205,206,207,208,209,
		210,211,212,213,214,215,216,217,218,219,
		    221,222,223,224,225,226,227,228,229,
		230,231,232,233,234,235,236,237,238,239,
		240,241,242,243,244,245,246,247,248,249,
	],
	itemIds_revive: [ 39,40, ],
	
	pcBoxCapacity: 20,
	pcBoxRollover: false,
};