// updaters/s4-rand-white2.js
// The configuration for Season 4's Randomized White 2

module.exports = {
	// The name of the base game being played
	game: "White2",
	// The name of the hack being played (same as the base game if not hacked)
	hack: "RandomizedWhite2",
	// The generation of this game
	gen: 5,
	// The region to use as the map
	regionMap: 'unova2',
	
	// Trainer information
	trainer: {
		id: 32230,
		secret: 44970,
	},
	
	// The Reddit Live Updater ID to post to
	liveID : "z18ujd1blvg3",
	// The Discord LiveUpdater channel snowflake
	discordID: null,
	// Unix timestamp since when the run started
	runStart : 1496523600,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 20, //15 seconds
	
	// The list of active modules
	modules: [
		'ApiMonitoring',
		'Pokemon',
		'Party',
		'Item',
		'Location',
		'Health',
		'E4',
		'Gym',
		'Battle',
		'Politics',
		'Chat',
		'Timing',
	],
};