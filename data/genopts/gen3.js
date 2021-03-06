// data/genopts/gen3.js
// Defines the default generation options for a Gen 3 run

module.exports = {
	phonebook: 'PokéNav',
	contest: true,
	characteristics: false,
	infinteTM: false,
	hubE4: false,
	'3d': false,
	dependentTrainerId: true,
	
	badgeNames: [
		"Stone", "Knuckle", "Dynamo", "Heat", "Balance", "Feather", "Mind", "Rain",
	],
	e4Names: [ "Sidney", "Pheobe", "Glacia", "Drake" ],
	champName: "Steven",
	rivalName: "{{gender|May|Brendan}}",
	correctCase: true,
	
	itemIds_pokeballs: [ 1,2,3,4,5,6,7,8,9,10,11,12, ],
	itemIds_healHP: [ 
		13,19,20,21,22, //potions
		26,27,28,29, //drinks
		30,31, //herbal
		44,155-16,158-16,159-16,160-16,161-16,162-16,163-16, //berries
	],
	itemIds_rareCandy: [ 68 ],
	itemIds_healPP: [
		34,35,36,37, //items
		138, //berries
	],
	itemIds_healStatus: [
		14,15,16,17,18,19,23,32,38, //items
		149-16,150-16,151-16,152-16,153-16,157-16,//berries
	],
	itemIds_vending: [ 0x1A, 0x1B, 0x1C ],
	itemIds_berries: [
		// consumable
		44,
		// berries
		133,134,135,136,137,138,139,
		140,141,142,143,144,145,146,147,148,149,
		150,151,152,153,154,155,156,157,158,159,
		160,161,162,163,164,165,166,167,168,169,
		170,171,172,173,174,175,
	],
	itemIds_evoStones: [ 93,94,95,96,97,98, ],
	// Item ids for TMs
	itemIds_tms: [
		289,
		290,291,292,293,294,295,296,297,298,299,
		300,301,302,303,304,305,306,307,308,309,
		310,311,312,313,314,315,316,317,318,319,
		320,321,322,323,324,325,326,327,328,329,
		330,331,332,333,334,335,336,337,338,339,
		340,341,342,343,344,345,346,
	],
};