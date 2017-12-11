// updaters/s405-theta-emerald.js
// The configuration for Season 4's Theta Emerald run

module.exports = {
	// The name of the base game being played
	game: "Emerald",
	// The name of the hack being played (same as the base game if not hacked)
	hack: "ThetaEmeraldEX",
	// The generation of this game
	gen: 3,
	// The region to use as the map
	regionMap: 'hoenn',
	
	// Trainer information
	trainer: {
		id: 51890,
		secret: 49705,
	},
	
	// The Reddit Live Updater ID to post to
	liveID : "zmxw6yogfa8q",
	// The Discord LiveUpdater channel snowflake
	discordID: '366698530343223306',
	// Unix timestamp since when the run started
	runStart : 1506805200,
	
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
		'Battle',
		'Politics',
		'Chat',
		'Timing',
	],
};