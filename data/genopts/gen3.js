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