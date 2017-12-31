// newspress/typesetter/Location.js
// The phrasebook for Location-related LedgerItems

module.exports = {
	LocationChanged: {
		// prev = the previous location
		// curr = the current location
		default: [
			`Welcome to {{curr}}!`,
		],
		nomap: [ //When we have no map information for the current location
			`We have moved to {{curr}}!`,
		],
		'enter': [ //We walk from an outside location to an inside location
			`We head inside {{curr}}.`,
		],
		'exit': [ //We walk from an inside location to an outside location
			`We head back outside to {{curr}}.`,
		],
		'arrive': [ //We arrive in a city or town
			`We arrive in {{curr}}.`,
		],
		'fly': [ //We fly to a location
			`We fly to {{curr}}`,
		],
		'escape': [ //We used an escape rope to flee a location
			`We escape rope out of {{prev}}, and land in {{curr}}.`,
		],
		'dig': [ //We dig out a location
			`We dig out of {{prev}}! Welcome to {{curr}}.`,
		],
	},
	EnteredEntralink: {
		// prev = the previous location
		// curr = the current location
		default: [ //We enter an "entralink"-type area
			
		],
	},
	
};