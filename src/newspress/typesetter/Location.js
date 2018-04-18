// newspress/typesetter/Location.js
// The phrasebook for Location-related LedgerItems

const MapChanged = {};

MapChanged['report'] = `{{@report}}`;
MapChanged['default'] = [
	`{{@curr}}.`,
	`{{On the location|@curr}}.`,
	`Now {{in the location|@curr}}.`,
	`We head {{into the location|@curr}}.`,
	`Arrived {{on the location|@curr}}.`,
];
MapChanged['default_back'] = [
	...MapChanged['default'],
	`Back {{in the location|@curr}}.`,
	`We head back {{into the location|@curr}}.`,
];
MapChanged['default_nvm'] = [
	...MapChanged['default_back'],
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
	`We step out into the {{daylight|sunlight|moonlight|red glow of dawn}}, {{into the location|@curr}}.`,
	`We head out {{into the location|@curr}}.`,
	`{{time of day|Squinting against the sun|Squinting into the darkness}}, we step outside {{into the location|@curr}}.`,
];
//We walk from an outside location to an inside location within 15 minutes
MapChanged['enter_back'] = [
	`We head back inside {{the location|@curr}}.`,
];
//We walk from an inside location to an outside location within 15 minutes
MapChanged['exit_back'] = [
	`We head back outside to {{the location|@curr}}.`,
	`We head back out {{into the location|@curr}}.`,
	`We leave back {{into the location|@curr}}.`,
	`We exit back {{into the location|@curr}}.`,
	`Back out {{into the location|@curr}}.`,
];
MapChanged['enter_nvm'] = [
	`Never mind, back inside {{the location|@curr}}.`,
	`Wait, no, back inside {{the location|@curr}}.`,
	`Nevermind, we immedeately turn around again and head back inside.`,
	`We change our mind. Back inside {{the location|@curr}}.`,
	`And back inside.`,
];
MapChanged['exit_nvm'] = [
	`And we turn around and leave again immedeately.`,
	`Never mind, we head right back out again. {{The location|@curr}}.`,
	`We turn on a heel and leave again. Back out {{in the location|@curr}}.`,
];

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
	`Back inside {{the location|@curr}}.`,
];
//We walk back out of the same dungeon within 15 minutes
MapChanged['dungeon_exit_back'] = [
	`We head back outside to {{the location|@curr}}.`,
	`Back outside. {{the location|@curr}}.`,
];
MapChanged['dungeon_enter_nvm'] = MapChanged['dungeon_enter_back'];
MapChanged['dungeon_exit_nvm'] = MapChanged['dungeon_exit_back'];
// We use an escape rope to exit the dungeon
MapChanged['dungeon_escaperope'] =[
	`<b>We use an escape rope and climb out of {{the location|@prev}}!</b> We land outside {{on the location|@curr}}.`,
	`<b>We escape rope out of {{the location|@prev}}, and land {{in the location|@curr}}.</b>`,
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
	`We arrive {{in the location|@curr}}.`,
	`We enter the boundries of {{the location|@curr}}.`,
	`We walk {{into the location|@curr}}.`,
	`Welcome back to {{the location|@curr}}.`,
];
//We walk out of a town
MapChanged['town_exit'] = [
	`We leave {{the location|@prev}}. {{The location|@curr}}`,
	`We head out of town. Now {{on the location|@curr}}.`,
	`We depart now. {{The location|@curr}}.`,
	`Out {{into the location|@curr}}`,
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
	`Wait, never mind. {{The location|@curr}} again.`,
	`Never mind, we're back {{in the location|@curr}}.`,
	`And we immedeately cross back into town.`,
	`No, wait, back in {{the location|@curr}} again.`,
];
//We walk out of a town within 2 minutes of the last time we were there
MapChanged['town_exit_nvm'] = [
	`Never mind, back out {{on the location|@curr}} again.`,
	`And we turn right around and leave town again. {{The location|@curr}}.`,
];
// Directional overrides, to be overridden using Transit Reports
MapChanged['town_exit_west'] = [
	...MapChanged['town_exit'],
	`We depart westward {{onto the location|@curr}}.`,
	`We head {{rand|westward|west}} out of town {{onto the location|@curr}}.`,
	`We leave town heading west, out {{onto the location|@curr}}.`,
];
MapChanged['town_exit_east'] = [
	...MapChanged['town_exit'],
	`We depart eastward {{onto the location|@curr}}.`,
	`We head {{rand|eastward|east}} out of town {{onto the location|@curr}}.`,
	`We leave town heading east, out {{onto the location|@curr}}.`,
];
MapChanged['town_exit_north'] = [
	...MapChanged['town_exit'],
	`We depart northward {{onto the location|@curr}}.`,
	`We head {{rand|northward|north}} out of town {{onto the location|@curr}}.`,
	`We leave town heading north, out {{onto the location|@curr}}.`,
];
MapChanged['town_exit_south'] = [
	...MapChanged['town_exit'],
	`We depart southward {{onto the location|@curr}}.`,
	`We head {{rand|southward|south}} out of town {{onto the location|@curr}}.`,
	`We leave town heading south, out {{onto the location|@curr}}.`,
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

MapChanged['stairs_up'] = [
	`We {{rand|climb|head up|ascend}} the stairs. {{The location|@curr}}.`,
	`We {{rand|climb|head up|ascend}} the stairs to {{the location|@curr}}.`,
];

//We ride the magnet train (override with Transit Report)
MapChanged['magenttrain'] = [
	`We {{rand|hop|jump}} on the {{rand|magnet |}}train! Weeeeeee! \PogChamp/ Now {{in the location|@curr}}!`,
	`We {{rand|take|ride|board|grab}} the {{rand|magnet |}}train to {{the location|@curr}}!`,
];
//We ride the magnet train within 15 minutes of the last time
MapChanged['magenttrain_back'] = [
	`Back for more {{rand|magnet |}}train fun! Weeee{{rand|eeee|ee|e}}e! \ PogChamp / {{The location|@curr}}!`,
	`Back now for more train riding! To {{the location|@curr}} we go!`,
	`TRAINS! Onward to {{the location|@curr}}!`,
];
//We ride the magnet train within 5 minutes of the last time
MapChanged['magenttrain_nvm'] = [
	`Weeeeeeeee! \ PogChamp / Now back {{in the location|@curr}}!`,
	`Weeeeeeeeeeee! \ PogChamp / {{The location|@curr}}!`,
	`Weeeeeeeeee! \ PogChamp / {{The location|@curr}}!`,
	`Weeeeeeee! \ PogChamp / Back {{in the location|@curr}}!`,
	`Weeeeeeeeeeee! \ PogChamp / Back to {{the location|@curr}}!`,
	`That train ride was so much fun, we do it again! {{The location|@curr}}!`,
	`This train is fun! Back {{in the location|@curr}}!`,
	`That ride was a blast! Again! \PogChamp/ {{The location|@curr}}!`,
	`Again! Again! \PogChamp/ We ride the train back to {{the location|@curr}}!`,
];


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
	MapChanged,
	
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