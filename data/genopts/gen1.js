// data/genopts/gen1.js
// Defines the default generation options for a Gen 1 run

module.exports = {
	gender: false,
	pokerus: false,
	heldItem: false,
	shiny: false,
	caughtInfo: false,
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
	
	pokeballIds: [ 1,2,3,4,8, ],
	vendedItemIds: [ 0x3C, 0x3D, 0x3E ],
	berryIds: [],
	pcBoxCapacity: 20,
	pcBoxRollover: false,
};