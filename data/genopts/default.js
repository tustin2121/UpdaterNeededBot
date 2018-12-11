// data/genopts/default.js
// Defines the default generation options

module.exports = {
	/* Game Support */
	// If this generation supports gendered pokemon
	gender: true,
	// If this generation supports pokemon forms
	forms: true,
	// If this generation supports pokerus
	pokerus: true,
	// If this generation supports held items
	heldItem: true,
	// If this generation supports shiny status
	shiny: true,
	// If this generation supports a secret id as an extension of the trainer id
	secretId: true,
	// If this generation supports walk-behind mon (Pikachu in Yellow, any mon in HGSS)
	walkBehind: false,
	// If this generation supports a real-time clock
	rtc: false,
	// If this generation has a phonebook to register contacts in. (if so, name of the device)
	phonebook: false,
	// If this generation records a pokemon's met information (caught in what pokemon mainly)
	caughtInfo: true,
	// If this generation records a separate "personality value" for a caught pokemon.
	personalityValues: true,
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
	// If this generation has a trainer id that is dependant on the class, or if the trainer id is unique to all trainers
	dependentTrainerId: false,
	// If this generation sets a checkpoint upon entering a pokemon center, rather than on healing.
	checkpointOnEnter: true,
	// If this generation revives the player after a black out in the center, rather than at the spawn point.
	reviveInCenter: true,
	
	// If this generation requires external move information, the link to extdata file is here
	moveInfo: false,
	// If this run is supplying full info for the pokemone on the enemy team
	fullEnemyInfo: false,
	// If this game has external information about phone contacts
	contactInfo: false,
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
	// The gender of the rival, or "O" for "opposite the player's gender".
	rivalGender: "O",
	// The (default) name of the player's friendly rival (can be an array if it's "the unchosen protagonist")
	friendName: "",
	// The gender of the friendly rival, or "O" for "opposite the player's gender".
	friendGender: "O",
	
	// Trainer classes to mark specially
	trainerClasses: {
		// The following have special handling available
		rival: [],
		leader: [],
		e4: [],
		champ: [],
		m: [], // Male trainer classes
		f: [], // Female trainer classes
		p: [], // Plural trainer classes
	},
	determineImportanceMethod: 'viaClasses',
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
	itemIds_pokeballs: [
		1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,
		492,493,494,495,496,497,498,499,500,
		576,851,948,
	],
	// Premier Ball item ids
	itemIds_promo: [ 12 ],
	// Item ids for vending machine items
	itemIds_vending: [ 0x1E, 0x1F, 0x20 ],
	// Item ids for berries
	itemIds_berries: [
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
	// Item id for Rare Candy
	itemIds_rareCandy: [ 50 ],
	// Item ids for reviving items
	itemIds_revive: [ 28,29,37,44, ],
	// Item ids for HP healing items
	itemIds_healHP: [
		17,23,24,25,26, //Potions
		30,31,32,33, //drinks
		34,35,//herbal
		155,158,159,160,161,162,163, //berries
	],
	// Item ids for PP healing items
	itemIds_healPP: [
		38,39,40,41, //items
		154, //berries
	],
	// Item ids for status healing items
	itemIds_healStatus: [
		18,19,20,21,22,23,27,36,42,54, //items
		149,150,151,152,153,157,//berries
	],
	// Item ids for evolution stones
	itemIds_evoStones: [ 80,81,82,83,84,85,107,108,109,849, ],
	// Item ids for TMs
	itemIds_tms: [
		328,329,
		330,331,332,333,334,335,336,337,338,339,
		340,341,342,343,344,345,346,347,348,349,
		350,351,352,353,354,355,356,357,358,359,
		360,361,362,363,364,365,366,367,368,369,
		370,371,372,373,374,375,376,377,378,379,
		380,381,382,383,384,385,386,387,388,389,
		390,391,392,393,394,395,396,397,398,399,
		400,401,402,403,404,405,406,407,408,409,
		410,411,412,413,414,415,416,417,418,419,
		420,421,422,423,424,425,426,427,
		618,619,620,
		690,691,692,693,694,
		737,
	],
	// Item ids for the escape rope
	itemIds_escapeRope: [ 78 ],
	
	moveId_surf: 57,
	moveId_fly: 19,
	
	trainerId_joey: 0,
	
	// Capacity of a PC box
	pcBoxCapacity: 30,
	// If a full PC box rolls new pokemon into the next box
	pcBoxRollover: true,
	
	/* Tweaks */
	// If pokemon, item, and location names should have their case corrected.
	correctCase: false,
};