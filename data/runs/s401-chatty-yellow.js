// updaters/s401-chatty-yellow.js
// The configuration for Season 4's Chatty Yellow

module.exports = {
	// The name of the base game being played
	game: "Yellow",
	// The name of the hack being played (same as the base game if not hacked)
	hack: "ChattyYellow",
	// The generation of this game
	gen: 1,
	// The region to use as the map
	regionMap: null,
	
	// Trainer information
	trainer: {
		id: 0,
		secret: 0,
	},
	
	// The Reddit Live Updater ID to post to
	liveID : null,
	// The Discord LiveUpdater channel snowflake
	discordID: null,
	// Unix timestamp since when the run started
	runStart : 1486933200,
	
	// The Stream API URL to poll
	infoSource : "https://twitchplayspokemon.tv/api/run_status",
	// The amount of wait time between polling the infoSource for new information
	infoUpdateDelay : 1000 * 20, //15 seconds
	
	// The list of active modules
	modules: [],
};