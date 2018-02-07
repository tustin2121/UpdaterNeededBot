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
	
	badgeNames: [
		"Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth",
	],
	e4Names: [ "Lorelei", "Bruno", "Agatha", "Lance" ],
	champName: "{{rival}}",
	rivalName: "Blue",
	correctCase: true,
	
	pokeballIds: [ 1,2,3,4,8, ],
	vendedItemIds: [ 0x3C, 0x3D, 0x3E ],
};