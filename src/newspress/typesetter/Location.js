// newspress/typesetter/Location.js
// The phrasebook for Location-related LedgerItems

const MapChanged = {};

const move = `{{rand|head|go|step|move|travel|walk|stroll|stride}}`;
MapChanged['report'] = `{{@report}}`;
MapChanged['default'] = [
	`{{@curr}}.`,
	`{{On the location|@curr}}.`,
	`Now {{in the location|@curr}}.`,
	`We ${move} {{into the location|@curr}}.`,
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

MapChanged['blackout'] = [
	`Next thing we know, we're {{in the location|@curr}}.`,
	`Next thing we know, we're {{in the location|@curr}} with no memory as to how we got here.`,
	`We wake up {{in the location|@curr}}.`,
	`We wake up {{in the location|@curr}} with no memory as to how we got here.`,
	`We come to our senses {{in the location|@curr}}.`,
	`We come to our senses {{in the location|@curr}}... {{rand|when|how}} did we get here?`,
];

//////////////////////////////
// Generic Entering/Exiting //

const enter = `{{rand|head|go|step|move|walk|stroll|stride|saunter}}`;
const enterQuickly = `{{rand|head|go|step|move|bustle|hurry}}`;
const leave = `{{rand|head|go|step|move|leave|exit|depart|walk|stroll|stride|take our leave}}`;
const leaveQuickly = `{{rand|leave|leave again|flee|skedaddle|take off|abscond|hightail it|run away|run out|depart|take our leave}}`;
//We walk from an outside location to an inside location
MapChanged['enter'] = [
	`We ${enter} inside {{the location|@curr}}.`,
	`We ${enter} into {{the location|@curr}}.`,
	`We go in {{the location|@curr}}.`,
	`We enter {{the location|@curr}}.`,
];
//We walk from an inside location to an outside location
MapChanged['exit'] = [
	`We ${leave} outside: {{the location|@curr}}.`,
	`We ${leave} out into the {{daylight|sunlight|moonlight|red glow of dawn}}, {{into the location|@curr}}.`,
	`We ${leave} out {{into the location|@curr}}.`,
	`{{time of day|Squinting against the sun|Squinting into the darkness}}, we ${leave} outside {{into the location|@curr}}.`,
];
//We walk from an outside location to an inside location within 15 minutes
MapChanged['enter_back'] = [
	`We ${enter} back inside {{the location|@curr}}.`,
	`Back inside {{the location|@curr}}.`,
];
//We walk from an inside location to an outside location within 15 minutes
MapChanged['exit_back'] = [
	`We ${leave} back outside to {{the location|@curr}}.`,
	`We ${leave} back out {{into the location|@curr}}.`,
	`We ${leave} back {{into the location|@curr}}.`,
	`Back out {{into the location|@curr}}.`,
];
MapChanged['enter_nvm'] = [
	`Never mind, back inside {{the location|@curr}}.`,
	`Wait, no, back inside {{the location|@curr}}.`,
	`We turn around and ${enterQuickly} right back inside {{the location|@curr}}.`,
	`Nevermind, we immedeately turn around again and ${enterQuickly} back inside.`,
	`We change our mind. Back inside {{the location|@curr}}.`,
	`And back inside.`,
];

MapChanged['exit_nvm'] = [
	`And we turn around and ${leaveQuickly} immedeately.`,
	`Never mind, we ${move} right back out again. {{The location|@curr}}.`,
	`We turn on a heel and ${leaveQuickly}. Back out {{in the location|@curr}}.`,
];

//////////////////////////////
// Entering/Exiting Dungeon //

//We walk into a dungeon or cave
MapChanged['dungeon_enter'] = [
	...MapChanged['enter'],
	`We ${enter} inside {{the location|@curr}}.`,
];
//We walk out of a dungeon or cave
MapChanged['dungeon_exit'] = [
	...MapChanged['exit'],
	`We ${leave} outside: {{the location|@curr}}.`,
];
//We walk back into the same dungeon within 15 minutes
MapChanged['dungeon_enter_back'] = [
	...MapChanged['enter_back'],
	`Back inside {{the location|@curr}}.`,
];
//We walk back out of the same dungeon within 15 minutes
MapChanged['dungeon_exit_back'] = [
	...MapChanged['exit_back'],
	`Back outside. {{the location|@curr}}.`,
];
MapChanged['dungeon_enter_nvm'] = [
	...MapChanged['enter_nvm'],
];
MapChanged['dungeon_exit_nvm'] = [
	...MapChanged['exit_nvm'],
];
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
	`We enter the boundaries of {{the location|@curr}}.`,
	`We ${move} {{into the location|@curr}}.`,
	`Welcome back to {{the location|@curr}}.`,
];
//We walk out of a town
MapChanged['town_exit'] = [
	`We {{rand|leave|depart from|take our leave from}} {{the location|@prev}}. {{The location|@curr}}`,
	`We head out of town. Now {{on the location|@curr}}.`,
	`We depart now. {{The location|@curr}}.`,
	`Out {{into the location|@curr}}`,
];
//We walk into a town within 15 minutes of the last time we were there
MapChanged['town_enter_back'] = [
	`We ${enter} back to town.`,
	`Back in town.`,
	`Back {{in the location|@curr}}.`,
];
//We walk out of a town within 15 minutes of the last time we were there
MapChanged['town_exit_back'] = [
	`We ${leave} back outside to {{the location|@curr}}.`,
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
//We teleport from one town to another
MapChanged['town_teleport'] = [
	`We {{rand|fiddle|diddle|play|screw around}} with the teleport kiosk next to the Pokémon Center and suddenly we're {{in the location|@curr}}.`,
	`We dial up {{the location|@curr}} on the teleport kiosk and suddenly we're there.`,
	`We pound on some buttons on the teleport kiosk and next thing we know we're {{in the location|@curr}}.`,
	`After {{rand|fiddling with|pounding on|screwing with}} the teleport kiosk next to the Pokémon Center, we blink and are now {{in the location|@curr}}.`,
];
MapChanged['town_teleport_back'] = [
	...MapChanged['town_teleport'],
	`We decide {{the location|@prev}} is not our scene, and in a blink of an eye, the teleport kiosk leaves us {{in the location|@curr}}.`,
	`Change of plans: we fuss with the teleport kiosk again and find ourselves again {{in the location|@curr}}.`,
	`Back to the teleport kiosk, and back {{in the location|@curr}}.`,
];
MapChanged['town_teleport_nvm'] = [
	`We change our mind and dial ourselves back to {{the location|@curr}}.`,
	`We try again with the teleport kiosk and end up back {{in the location|@curr}}.`,
	`We decide to try our luck with the teleport kiosk again and suddenly we're {{in the location|@curr}}.`,
	`A spin of the teleport kiosk roulette lands us back {{in the location|@curr}}.`,
];
//We fly to a town
MapChanged['fly'] = [
	`We take flight and land {{in the location|@curr}}!`,
	`Upon the wings of a Pokémon we sail {{into the location|@curr}}!`,
	`{{$select fly mon}}We hop on {{Mon}}'s back and fly {{into the location|@curr}}!`,
	`{{$select fly mon}}We climb aboard our {{Mon}} and fly {{into the location|@curr}}!`,
	`{{$select fly mon}}{{Mon}} flies us {{into the location|@curr}}!`,
	`{{$select fly mon}}We soar {{into the location|@curr}} on {{Mon}}'s back!`,
];
MapChanged['fly_back'] = [
	...MapChanged['fly'],
	`Longing for nostalgia for not even fifteen minutes ago, we fly back to {{the location|@curr}}.`,
];
MapChanged['fly_nvm'] = [
	`Change of plans: we fly back to {{the location|@curr}}.`,
	`We decide we liked {{the location|@curr}} better, and fly back there.`,
	`{{$select fly mon}}{{Mon}} looks at us funny as we direct {{her}} to fly right back to {{the location|@curr}}.`,
	`{{$select fly mon}}{{Mon}} wasn't even back in {{her}} ball yet, and {{she}}'s flying us back to {{the location|@curr}}.`,
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
// Floors //

// We go up some stairs in a building or dungeon
MapChanged['floor_stairs_up'] = [
	`We {{rand|head|go}} upstairs to {{@curr.floorStr}}.`,
	`We {{rand|climb|go up|mount|scale|move up|ascend}} the {{rand|stairs|steps}} to {{@curr.floorStr}}.`,
	`We {{rand|climb|ascend}} to {{@curr.floorStr}}.`,
	`Up to {{@curr.floorStr}}.`,
	`Now on {{@curr.floorStr}}.`,
	`Now {{on the location}}, {{@curr.floorStr}}.`,
];

// We go down some stairs in a building or dungeon
MapChanged['floor_stairs_down'] = [
	`We {{rand|head|go}} downstairs to {{@curr.floorStr}}.`,
	`We {{rand|stumble|go down|move down|descend}} the {{rand|stairs|steps}} to {{@curr.floorStr}}.`,
	`We {{rand|go down|descend}} to {{@curr.floorStr}}.`,
	`Down to {{@curr.floorStr}}.`,
	`Now on {{@curr.floorStr}}.`,
	`Now {{on the location}}, {{@curr.floorStr}}.`,
];

// We go up a ladder in a cave
MapChanged['floor_ladder_up'] = [
	`We {{rand|head|go}} up a ladder to {{@curr.floorStr}}.`,
	`We {{rand|climb|go up|mount|scale|move up|ascend}} a {{rand|ladder}} to {{@curr.floorStr}}.`,
	`We {{rand|climb|ascend}} to {{@curr.floorStr}}.`,
	`Up to {{@curr.floorStr}}.`,
	`Now on {{@curr.floorStr}}.`,
	`Now {{on the location}}, {{@curr.floorStr}}.`,
];

// We go down a ladder in a cave
MapChanged['floor_ladder_down'] = [
	`We {{rand|head|go}} down a ladder to {{@curr.floorStr}}.`,
	`We {{rand|stumble|go down|move down|descend}} a {{rand|ladder}} to {{@curr.floorStr}}.`,
	`We {{rand|go down|descend}} to {{@curr.floorStr}}.`,
	`Down to {{@curr.floorStr}}.`,
	`Now on {{@curr.floorStr}}.`,
	`Now {{on the location}}, {{@curr.floorStr}}.`,
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

//We ride the chairlift (override with Transit Report)
MapChanged['chairlift'] = [
	`We {{rand|hop|jump}} on the {{rand|chair |}}lift! Weeeeeee! \PogChamp/ Now {{in the location|@curr}}!`,
	`We {{rand|take|ride|board|grab}} the {{rand|chair |}}lift to {{the location|@curr}}!`,
];
//We ride the chairlift within 15 minutes of the last time
MapChanged['chairlift_back'] = [
	`Back for more {{rand|chair |}}lift fun! Weeee{{rand|eeee|ee|e}}e! \ PogChamp / {{The location|@curr}}!`,
	`Back now for more chair lift riding! To {{the location|@curr}} we go!`,
	`CHAIR LIFTS! Onward to {{the location|@curr}}!`,
];
//We ride the chairlift within 5 minutes of the last time
MapChanged['chairlift_nvm'] = [
	`Weeeeeeeee! \ PogChamp / Now back {{in the location|@curr}}!`,
	`Weeeeeeeeeeee! \ PogChamp / {{The location|@curr}}!`,
	`Weeeeeeeeee! \ PogChamp / {{The location|@curr}}!`,
	`Weeeeeeee! \ PogChamp / Back {{in the location|@curr}}!`,
	`Weeeeeeeeeeee! \ PogChamp / Back to {{the location|@curr}}!`,
	`That chair lift ride was so much fun, we do it again! {{The location|@curr}}!`,
	`This chair lift is fun! Back {{in the location|@curr}}!`,
	`That ride was a blast! Again! \PogChamp/ {{The location|@curr}}!`,
	`Again! Again! \PogChamp/ We ride the chair lift back to {{the location|@curr}}!`,
];

MapChanged['sootopolis_fall'] = [
	`We fall through the ice.`,
	`We careen through a hole in the ice.`,
	`We plummit through the ice.`,
	`We misstep and take a dive through the ice.`,
	`We step on a crack and hurdle through the ice.`,
	`We take a step on cracked ice. And down we go.`,
	`We plummit to the room below.`,
	`Falling through the ice like this must hurt.`,
	`We slip and fall through the ice.`,
	`We step on a cracked ice tile and fall through to the room below.`,
	`We visit the trainers under the ice again.`,
	`We plummit through the ice again.`,
	`We drop through the hole in the ice.`,
	`We plunge through the cracked ice.`,
	`We land hard in the room below, and somehow our legs aren't broken yet.`,
	`We tumble through a hole in the ice.`,
	`The ice shatters and we plummit through to the room below.`,
	`The ice gives way and we fall to our failure.`,
	`The ice bursts and we fall down.`,
	`The fractured ice shatters and we take a plunge.`,
	`We unwillingly dip down to visit the room below.`,
	`Time for another visit to the trainers below.`,
	`The ice splits and we fall.`,
	`The ice collapses under our feet again.`,
	`The structural integrety of the ice under our feet has been comprimised and our downward velocity increases rapidly and suddenly.`,
	`Rip, we fell.`,
	`The ice is falling from the ceiling once again, and us with it.`,
	`The ice smashes to bits while we were standing on it. And down we go.`,
	`Alas, the ice under us has given way once again. Lo, our attempt has been sabataged by frozen liquid.`,
	`Today's forecast: hail with a chance of {{player}}.`,
	`And with a crack, the ice floor gives way again.`,
	`We lament, as we fall to our failure again, that there doesn't seem to be an OSHA in the Pokemon World.`,
	`We imprint our face in the snow below the ice floor yet again.`,
	`The ice floor gives way to the snowy depths of the gym's bottommost floor.`,
	`We prove Newton's theory on gravity by falling through a hole in the ice.`, //--Ciphrius Kane
	`{{$select random party mon}}{{Mon}} distracts us and we take a wrong step on the puzzle. Down we fall.`,
	`{{$select random party mon}}{{Mon}} tries to lead us right, but we take a wrong step. The ice breaks.`,
	`{{$select random party mon}}{{Mon}} leads us the wrong way and we fall through the ice.`,
	`{{$select random party mon}}{{Mon}} takes a wrong step and falls through the ice. We follow after {{them}}.`,
	`{{$select random party mon}}{{if mon body has|$|claw}}{{Mon}} taps on the ice out of curiosity, and {{their}} claw shatters it as we're about to step there.`,
	`{{$select random party mon}}{{if mon body has|$|heavy}}The whole ice floor gives way instantly the moment {{Mon}} puts {{their}} weight on the ice.`,
	`{{$select random party mon}}{{if mon body has|$|leg|worm}}{{Mon}} shows us the way through the puzzle, but in doing so cracked the ice tiles prematurely, and so we fall through instantly.`,
	`{{$select random party mon}}{{if mon body has|$|tail}}We accidentally get hit by {{Mon}}'s tail and tumble onto a cracked ice tile, and fall through.`,
	`{{$select random party mon}}{{if mon body has|$|tail}}{{Mon}}'s tail breaks the ice tile we were about to step into and we fall through the hole.`,
	`{{$select random party mon}}{{if mon body has|$|wing}}{{Mon}} flies over the ice puzzle. We try and follow {{them}} and fall through.`,
	`{{$select random party mon}}{{if mon body has|$|explode}}{{Mon}} explodes and takes out nine tiles of ice. We fall through to the room below.`,
	`{{$select random party mon}}{{if mon body has|$|firetail}}{{Mon}} melts the ice accidentally, and we fall through.`,
];


MapChanged.__meta__ = { sort:-110 }; //After "Blackout!"

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
		__meta__ : { sort:-120 }, //After MapChanged
		default: [
			`<b>Checkpoint {{@areaName}}!</b>`,
			`<b>Checkpoint!</b>`
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
			`{{$select random party mon}}{{Mon}} sneezes and startles us off the ledge.`,
			`{{$select random party mon}}{{Mon}} spots something below and bumps us off the ledge.`,
			`{{$select random party mon}}{{Mon}} gets startled and knocks us off the ledge.`,
			`{{$select random party mon}}{{if mon body has any|$|arm|claw}}{{Mon}} scratches {{themselves}} and accidentally hits us off the ledge.`,
			`{{$select random party mon}}{{if mon body has|$|electricbody}}We accidentally brush against {{Mon}} and the resulting electric shock sends us reeling over the ledge.`,
			`{{$select random party mon}}{{if mon body has|$|wing}}{{Mon}} flaps {{their}} wings a little too hard and send us careening off the ledge.`,
			`{{$select random party mon}}{{if mon body has|$|tail}}{{Mon}} accidentally smacks us with {{their}} tail, and we topple over the ledge.`,
			`{{$select random party mon}}{{if mon body has|$|levitate}}We lie sprawled at the bottom of the ledge again. {{Mon}} hovers above us, looking down at us with mild amusement.`,
			`{{$select random party mon}}{{if mon body has|$|explode}}{{Mon}} unfortunately chose this moment to explode randomly, which sends us flying over the ledge.`,
			`{{$select random party mon}}{{if mon body has|$|firetail}}We spot our party below the ledge, roasting marshmellows over {{Mon}}'s tail, and decide to join them.'`
		],
		clearedLedge: [
			`<b><i>We've made it past the ledge!</i></b>`,
			`<b><i>We've made it beyond the ledge!</i></b>`,
			`<b><i>We've made it past the ledge!</i></b> Hopefully it stays that way.`,
			`<b><i>We're on the other side of the {{@loc}} ledge!</i></b>`,
		],
		surfStart: [
			`{{$select surf mon}}We hop onto {{Mon}}'s back and head into the surf.`,
			`{{$select surf mon}}{{Mon}} slips into the water and we climb aboard.`,
			`{{$select surf mon}}{{Mon}} dives into the waves and we climb up onto {{their}} back.`,
			`{{$select surf mon}}We call {{Mon}} forth to ferry us across the waters.`,
		],
		surfEnd: [
			`{{$select surf mon}}We hop off {{Mon}}'s back and go ashore.`,
			`{{$select surf mon}}{{Mon}} beaches on the shores of {{the location|@loc}} and we disembark.`,
			`{{$select surf mon}}We run aground and clamber off {{Mon}}.`,
		],
	},
	
};