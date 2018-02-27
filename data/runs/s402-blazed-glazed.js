// updaters/s402-blazed-glazed.js
// The configuration for Season 4's Blazed Glazed

module.exports = {
	// The name of the base game being played
	game: "Glazed",
	// The name of the hack being played (same as the base game if not hacked)
	hack: "BlazedGlazed",
	// The generation of this game
	gen: 3,
	// The region to use as the map
	regionMap: null,
	
	// Trainer information
	trainer: {
		id: 6702,
		secret: 60589,
	},
	
	// The Reddit Live Updater ID to post to
	liveID : "yp65jgm0fxu9",
	// The Discord LiveUpdater channel snowflake
	discordID: null,
	// Unix timestamp since when the run started
	runStart : 1491685200,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 20, //15 seconds
	
	// The list of active modules
	modules: [
		'Pokemon',
		'Party',
		'Item',
		'Location',
		'Health',
		'E4',
		'Gym',
		'Battle',
	],
};