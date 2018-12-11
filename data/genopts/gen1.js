// data/genopts/gen1.js
// Defines the default generation options for a Gen 1 run

module.exports = {
	gender: false,
	pokerus: false,
	heldItem: false,
	shiny: false,
	secretId: false,
	caughtInfo: false,
	personalityValues: false,
	specialSplit: false,
	abilities: false,
	natures: false,
	characteristics: false,
	infinteTM: false,
	hubE4: false,
	'3d': false,
	dependentTrainerId: true,
	checkpointOnEnter: false,
	
	namingMatch: /-_/i,
	moveInfo: 'gen2/movetable.js',
	
	badgeNames: [
		"Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth",
	],
	e4Names: [ "Lorelei", "Bruno", "Agatha", "Lance" ],
	champName: "{{rival}}",
	rivalName: "Blue",
	correctCase: true,
	
	trainerClasses: {
		// The following have special handling available
		rival: [0x19,0x2A],
		leader: [0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x1D],
		e4: [0x21,0x2F,0x2E,0x2C],
		champ: [0x1A,0x2B],
	},
	
	itemIds_pokeballs: [ 1,2,3,4,8, ],
	itemIds_vending: [ 0x3C, 0x3D, 0x3E ],
	itemIds_berries: [],
	itemIds_rareCandy: [ 40 ],
	itemIds_revive: [ 53,54 ],
	itemIds_healHP: [ 16,17,18,19,20, ],
	itemIds_healPP: [ 80,81,82,83, ],
	itemIds_evoStones: [ 10,32,33,34,47, ],
	itemIds_tms: [
		196,197,198,199,
		200,201,202,203,204,205,206,207,208,209,
		210,211,212,213,214,215,216,217,218,219,
		220,221,222,223,224,225,226,227,228,229,
		230,231,232,233,234,235,236,237,238,239,
		240,241,242,243,244,245,246,247,248,249,
		250,251,252,253,254,255,
	],
	
	pcBoxCapacity: 20,
	pcBoxRollover: false,
};