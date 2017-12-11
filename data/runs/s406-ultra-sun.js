// updaters/s406-ultra-sun.js
// The configuration for Season 4's Ultra Sun run

module.exports = {
	// The name of the base game being played
	game: "UltraSun",
	// The name of the hack being played (same as the base game if not hacked)
	hack: "UltraSun",
	// The generation of this game
	gen: 7,
	// The region to use as the map
	regionMap: 'alola',
	
	// Trainer information
	trainer: {
		id: 57263,
		secret: 10183,
	},
	
	// The Reddit Live Updater ID to post to
	liveID : "zr4lmzz2p2tp",
	// The Discord LiveUpdater channel snowflake
	discordID: '366698530343223306',
	// Unix timestamp since when the run started
	runStart : 1511643600,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 15, //15 seconds
	
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
		// 'Battle',
		'Politics',
		'Chat',
		'Timing',
	],
};