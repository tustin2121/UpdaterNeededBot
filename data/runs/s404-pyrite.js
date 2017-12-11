// updaters/s404-pyrite.js
// The configuration for Season 4's Pokemon Pyrite run

module.exports = {
	// The name of the base game being played
	game: "Pyrite",
	// The name of the hack being played (same as the base game if not hacked)
	hack: "Pyrite",
	// The generation of this game
	gen: 2,
	// The region to use as the map
	regionMap: 'johto',
	
	// Trainer information
	trainer: {
		id: 25756,
		secret: 33145,
	},
	
	// The Reddit Live Updater ID to post to
	liveID : "z380f0na2tyd",
	// The Discord LiveUpdater channel snowflake
	discordID: null,
	// Unix timestamp since when the run started
	runStart : 1502571600,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 15, //15 seconds
	
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