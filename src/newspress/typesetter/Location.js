// newspress/typesetter/Location.js
// The phrasebook for Location-related LedgerItems

module.exports = {
	LocationChanged: {
		// prev = the previous location
		// curr = the current location
		default: [
			`Welcome to {{@curr}}!`,
		],
		announce: `{{@announce}}`,
		nomap: [ //When we have no map information for the current location
			`{{@curr}}.`,
			`{{On the location|@curr}}.`,
			`Now {{in the location|@curr}}.`,
			`We head {{into the location|@curr}}.`,
			`Arrived {{on the location|@curr}}.`,
		],
		'enter': [ //We walk from an outside location to an inside location
			`We head inside {{the location|@curr}}.`,
		],
		'exit': [ //We walk from an inside location to an outside location
			`We head back outside to {{the location|@curr}}.`,
		],
		'arrive': [ //We arrive in a city or town
			`We arrive {{in the location|@curr}}.`,
		],
		'fly': [ //We fly to a location
			`We fly to {{the location|@curr}}`,
		],
		'escape': [ //We used an escape rope to flee a location
			`We escape rope out of {{the location|@prev}}, and land {{in the location|@curr}}.`,
		],
		'dig': [ //We dig out a location
			`We dig out of {{the location|@prev}}! Welcome to {{the location|@curr}}.`,
		],
	},
	EnteredEntralink: {
		// prev = the previous location
		// curr = the current location
		default: [ //We enter an "entralink"-type area
			
		],
	},
	
	JumpedLedge: {
		default: [
			`We jumped the ledge.`,
			`We hop over the ledge.`,
			`We skip down the ledge.`,
			`We trapise over the ledge.`,
			`We trip over the ledge.`,
			`We tumble down the ledge.`,
			`We bound down the ledge.`,
			`We sumersault over the ledge.`,
			`We dive over the ledge.`,
			`We drop down the ledge.`,
			`We hurdle the ledge.`,
			`We canter across the ledge.`,
			`We take a plunge off the ledge.`,
			`We vault over the ledge.`,
			`We leap across the ledge.`,
			`We nosedive off the ledge. Ow.`,
			`We spring over the ledge.`,
			`We bounce over the ledge.`,
			`We clear the ledge. As in we clear over it. To the bottom of the map.`,
			`We have a pop down the ledge, and can't get back up.`,
			`We parachute over the ledge. Not sure when we got a Parachute item, but we've now used it.`,
			`We twitch wrong and now we're at the bottom of the ledge.`,
			`We caper across the ledge. (That means we fell.)`,
			`We sidle slowly across the ledge-- and we fall.`,
			`We inch along the ledge-- nope, we jump it.`,
			`We walk along the ledge-- nope, we fell.`,
			`Help, we've fallen over this ledge and can't get up!`,
			`And over the ledge.`,
			`And over the ledge we go.`,
			`Down the ledge, rip.`,
			`We walk precariously across the ledge... and down.`,
			`And over the ledge we go!`,
			`The ledge is a tight rope... and we just fell.`,
			`{{randomMon.species}} sneezes and startles us off the ledge.`,
			`{{randomMon.species}} spots something below and bumps us off the ledge.`,
			`{{randomMon.species}} gets startled and knocks us off the ledge.`,
			`{{randomMon.species}} scratches {{randomMon|them}}self and accidentally hits us off the ledge.`,
		],
	},
	ClearedLedge: {
		default: [
			`<b><i>We've made it past the ledge!</i></b>`,
			`<b><i>We've made it beyond the ledge!</i></b>`,
			`<b><i>We've made it past the ledge!</i></b> Hopefully it stays that way.`,
			`<b><i>We're on the other side of the {{@loc}} ledge!</i></b>`,
		],
	},
};