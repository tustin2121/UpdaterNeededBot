// newspress/typesetter/Location.js
// The phrasebook for Location-related LedgerItems

const MapChanged = {};

MapChanged['report'] = `{{@report}}`;
MapChanged['default'] = [
	
];

//////////////////////////////
// Generic Entering/Exiting //

//We walk from an outside location to an inside location
MapChanged['enter'] = [
	`We head inside {{the location|@curr}}.`,
	`We head into {{the location|@curr}}.`,
	`We go in {{the location|@curr}}.`,
	`We enter {{the location|@curr}}.`,
];
//We walk from an inside location to an outside location
MapChanged['exit'] = [
	`We head outside: {{the location|@curr}}.`,
];
//We walk from an outside location to an inside location within 15 minutes
MapChanged['enter_back'] = [
	`We head back inside {{the location|@curr}}.`,
];
//We walk from an inside location to an outside location within 15 minutes
MapChanged['exit_back'] = [
	`We head back outside to {{the location|@curr}}.`,
];
MapChanged['enter_nvm'] = MapChanged['enter_back'];
MapChanged['exit_nvm'] = MapChanged['exit_back'];

//////////////////////////////
// Entering/Exiting Dungeon //

//We walk into a dungeon or cave
MapChanged['dungeon_enter'] = [
	`We head inside {{the location|@curr}}.`,
];
//We walk out of a dungeon or cave
MapChanged['dungeon_exit'] = [
	`We head outside: {{the location|@curr}}.`,
];
//We walk back into the same dungeon within 15 minutes
MapChanged['dungeon_enter_back'] = [
	`We head back inside {{the location|@curr}}.`,
];
//We walk back out of the same dungeon within 15 minutes
MapChanged['dungeon_exit_back'] = [
	`We head back outside to {{the location|@curr}}.`,
];
MapChanged['dungeon_enter_nvm'] = MapChanged['dungeon_enter_back'];
MapChanged['dungeon_exit_nvm'] = MapChanged['dungeon_exit_back'];
// We use an escape rope to exit the dungeon
MapChanged['dungeon_escaperope'] =[
	`<b>We use an escape rope and climb out of {{the location|@prev}}!</b> We land outside {{on the location|@curr}}.`,
];

//////////////////////////////////
// Entering/Exiting a City/Town //

//We walk into a town for the first time ever
MapChanged['town_new'] = [
	`<b>We reach {{the location|@curr}}!</b>`,
	`<b>Welcome to {{the location|@curr}}!</b>`,
	`<b>Welcome to {{the location|@curr}}!</b>`,
];
//We walk into a town
MapChanged['town_enter'] = [
	`We head {{into the location|@curr}}.`,
];
//We walk out of a town
MapChanged['town_exit'] = [
	`We leave {{the location|@prev}}. {{The location|@curr}}`,
	`We head out of town. Now {{on the location|@curr}}.`,
];
//We walk into a town within 15 minutes of the last time we were there
MapChanged['town_enter_back'] = [
	`We head back to town.`,
	`Back in town.`,
	`Back {{in the location|@curr}}.`,
];
//We walk out of a town within 15 minutes of the last time we were there
MapChanged['town_exit_back'] = [
	`We head back outside to {{the location|@curr}}.`,
];
//We walk into a town within 2 minutes of the last time we were there
MapChanged['town_enter_nvm'] = [
	
];
//We walk out of a town within 2 minutes of the last time we were there
MapChanged['town_exit_nvm'] = [
	
];

////////////////////////////
// Entering/Exiting a Gym //

//We walk into a gym for the first time ever
MapChanged['gym_new'] = [
	`We step inside {{the location|@curr}} and the sound of anticipation in the form of the gym music hits our ears. Time to begin another gym challenge...`,
	`We step foot inside {{the location|@curr}}. The sound of the gym music thumps through our chest. Time to challenge a new gym.`,
	`The sliding doors open and we hear the music of {{the location|@curr}} hit our ears. Time for another gym challenge, perhaps.`,
	`{{$select walking mon}}We pause in front of {{the location|@curr}}'s doors and exchange glances with {{Mon}}. Time for another gym challenge. We head inside.`,
	`{{$select walking mon}}We step over the threshold. {{Mon}} peaks around us tenitively. The gym guide turns to us: "Yo! Champ in the making! Welcome to {{the location|@curr}}!"`
];
//We walk into a gym
MapChanged['gym_enter'] = [
	...MapChanged['enter'],
	`We head through the sliding glass doors into {{the location|@curr}}.`,
	`We reenter {{the location|@curr}}.`,
];
//We walk out of a gym
MapChanged['gym_exit'] = [
	...MapChanged['exit'],
];
//We walk into a gym within 15 minutes of the last time we were there
MapChanged['gym_enter_back'] = [
	...MapChanged['enter_back'],
];
//We walk out of a gym within 15 minutes of the last time we were there
MapChanged['gym_exit_back'] = [
	...MapChanged['exit_back'],
];
//We walk into a gym within 2 minutes of the last time we were there
MapChanged['gym_enter_nvm'] = [
	...MapChanged['enter_nvm'],
];
//We walk out of a gym within 2 minutes of the last time we were there
MapChanged['gym_exit_nvm'] = [
	...MapChanged['exit_nvm'],
];

////////////////////////////////////
// Entering/Exiting the Entralink //

//We warp into the entralink
MapChanged['entralink_enter'] = [
	`We head inside {{the location|@curr}}.`,
];
//We warp out of the entralink
MapChanged['entralink_exit'] = [
	`We head outside: {{the location|@curr}}.`,
];
//We warp into the entralink within 15 minutes of the last time we were there
MapChanged['entralink_enter_back'] = [
	`We head back inside {{the location|@curr}}.`,
];
//We warp out of the entralink within 15 minutes of the last time we were there
MapChanged['entralink_exit_back'] = [
	`We head back outside to {{the location|@curr}}.`,
];
//We warp into the entralink within 2 minutes of the last time we were there
MapChanged['entralink_enter_nvm'] = [
	
];
//We warp out of the entralink within 2 minutes of the last time we were there
MapChanged['entralink_exit_nvm'] = [
	
];

////////////
// Others //



////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
	LocationContext: null,
	LocationChanged: {
		// prev = the previous location
		// curr = the current location
		default: [ //When we have no map information for the current location
			`{{@curr}}.`,
			`{{On the location|@curr}}.`,
			`Now {{in the location|@curr}}.`,
			`We head {{into the location|@curr}}.`,
			`Arrived {{on the location|@curr}}.`,
		],
	},
	
	MapContext: null,
	MapChanged: {
		default: [
			`Welcome to {{@curr}}!`,
		],
		report: `{{@report}}`,
		
		'enter': [
			
		],
		'exit': [
			
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
	
	CheckpointContext: null,
	CheckpointUpdated: {
		default: [
			`<b>Checkpoint {{@loc.areaName}}!</b>`
		],
	},
	
	MapMovement: {
		default: null,
		jumpedLedge: [
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
			`{{if|$@randomMon}}{{Mon}} sneezes and startles us off the ledge.`,
			`{{if|$@randomMon}}{{Mon}} spots something below and bumps us off the ledge.`,
			`{{if|$@randomMon}}{{Mon}} gets startled and knocks us off the ledge.`,
			`{{if mon body has any|$@randomMon|arm|claw}}{{Mon}} scratches {{them}}self and accidentally hits us off the ledge.`,
			`{{if mon body has|$@randomMon|electricbody}}We accidentally brush {{Mon}} and the resulting electric shock sends us reeling over the ledge.`,
			`{{if mon body has|$@randomMon|wing}}{{Mon}} flaps {{their}} wings a little too hard and send us careening off the ledge.`,
			`{{if mon body has|$@randomMon|tail}}{{Mon}} accidentally smacks us with {{their}} tail, and we topple over the ledge.`,
			`{{if mon body has|$@randomMon|levitate}}We lie sprawled at the bottom of the ledge again. {{Mon}} hovers above us, looking down at us with mild amusement.`,
			`{{if mon body has|$@randomMon|explode}}{{Mon}} unfortunately chose this moment to explode randomly, which sends us flying over the ledge.`,
			`{{if mon body has|$@randomMon|firetail}}We spot our party below the ledge, roasting marshmellows over {{Mon}}'s tail, and decide to join them.'`
		],
		clearedLedge: [
			`<b><i>We've made it past the ledge!</i></b>`,
			`<b><i>We've made it beyond the ledge!</i></b>`,
			`<b><i>We've made it past the ledge!</i></b> Hopefully it stays that way.`,
			`<b><i>We're on the other side of the {{@loc}} ledge!</i></b>`,
		],
		surfStart: [
			`We hop onto {{Mon|@surfMon}}'s back and head into the surf.`,
			`{{Mon|@surfMon}} slips into the water and we climb aboard.`,
			`{{Mon|@surfMon}} dives into the waves and we climb up onto {{their}} back.`,
			`We call {{Mon|@surfMon}} forth to ferry us across the waters.`,
		],
		surfEnd: [
			`We hop off {{Mon|@surfMon}}'s back and go ashore.`,
			`{{Mon|@surfMon}} beaches on the shores of {{the location|@loc}} and we disembark.`,
			`We run aground and clamber off {{Mon|@surfMon}}.`,
		],
	},
	
};