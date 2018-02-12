// data/genopts/default.js
// Defines the default generation options

module.exports = {
	/* Game Support */
	// If this generation supports gendered pokemon
	gender: true,
	// If this generation supports pokerus
	pokerus: true,
	// If this generation supports held items
	heldItem: true,
	// If this generation supports shiny status
	shiny: true,
	// If this generation supports a real-time clock
	rtc: false,
	// If this generation records a pokemon's met information (caught in what pokemon mainly)
	caughtInfo: true,
	// If this generation supports a split special stat (spD and spA, instead of just special)
	specialSplit: true,
	// If this generation supports abilities
	abilities: true,
	// If this generation supports pokemon natures
	natures: true,
	// If this game supports contest stats
	contest: false,
	// If this generation supports pokemon charactaristics (in addition to natures)
	characteristics: true,
	// If this game supports shadow pokemon
	shadow: false,
	// If this game supports "sparkly" pokemon (N's pokemon in B2W2)
	sparkly: false,
	// If this generation has infinite use TMs (report as "the TM" instead of "1 TM")
	infinteTM: true,
	// If this generation has a hub and spokes E4 system, instead of a line system
	hubE4: true,
	// If this generation supports 3D movement (resolve the Z axis)
	'3d': true,
	
	// If this generation requires external move information, the link to extdata file is here
	moveInfo: false,
	// If this generation puts its nicknaming in the current name slot, and should postpone
	// reporting a name change until it is finished, put a regex here to match against
	namingMatch: null,
	
	// The names of the badges in this game, in the order of the bits that represent them
	badgeNames: [],
	// The names of the e4 members, in order of apperance (line) or from left to right (hub)
	e4Names: [],
	// The name of the champion
	champName: "",
	// The (default) name of the player's rival
	rivalName: "",
	
	// Trainer classes to mark specially
	trainerClasses: {
		// The following have special handling available
		rival: [],
		leader: [],
		e4: [],
		champ: [],
	},
	// Wild pokemon species to mark specially
	legendarySpecies: [
		// Legendary Pokemon
		144,145,146, 150,151,
		243,244,245, 249,250,251,
		377,378,379, 380,381, 382,383,384, 385, 386,
		480,481,482, 483,484,485, 486, 487, 488,489,490,491,492,493,
		494,638,639,640,647, 641,642,645, 643,644,646, 648,649,
		716,717,718, 719,720,721,
		785,786,787,788, 789,790,791,792, 800,801,
		// Ultra Beasts
		793,794,795,796,797,798,779, 803,804,805,806,
	],
	// Ball item ids
	pokeballIds: [
		1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,
		492,493,494,495,496,497,498,499,500,
		576,851,948,
	],
	// Item ids for vending machine items
	vendedItemIds: [ 0x1E, 0x1F, 0x20 ],
	// Item ids for berries
	berryIds: [
		// consumable
		43,
		// berries
		149,
		150,151,152,153,154,155,156,157,158,159,
		160,161,162,163,164,165,166,167,168,169,
		170,171,172,173,174,175,176,177,178,179,
		180,181,182,183,184,185,186,187,188,189,
		190,191,192,193,194,195,196,197,198,199,
		200,201,202,203,204,205,206,207,208,209,
		210,211,212,
		686,687,688,
	],
	// Capacity of a PC box
	pcBoxCapacity: 30,
	// If a full PC box rolls new pokemon into the next box
	pcBoxRollover: true,
	
	/* Tweaks */
	// If pokemon, item, and location names should have their case corrected.
	correctCase: false,
};