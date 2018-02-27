// updaters/s404-pyrite.js
// The configuration for Season 4's Pokemon Pyrite run

module.exports = {
	// Information about the game being played
	game0: {
		// The name of the game/hack being played (same as the base game if not hacked)
		name: "Pyrite",
		// The name of the base game being played
		base: "Crystal",
		// The generation of this game
		gen: 2,
		// The region to use as the map
		regionMap: null,//'johto',
		// Trainer information
		trainer: {
			id: 25756,
			secret: 33145,
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
		},
	},
	run: {
		// Unix timestamp since when the run started
		runStart : 1502571600,
		// The amount of time between searching for updates
		updatePeriod: 1000 * 5,
		
		// The Stream API URL to poll
		apiSrc: "http://localhost:1337/",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 15, //15 seconds
		
		// The Chat URL to connect to via irc
		chatSrc: "",
		// The irc channel to join when connected via irc (auth data is in the auth folder)
		chatChannel: "#twitchplayspokemon",
		
		// The Reddit Live Updater ID to post to
		liveID : "10f3p1gulvkl9",
		testLiveID: "10f3p1gulvkl9",
		testDiscordID: "367499647410765824",
		
		// The Discord channel snowflake where commands are taken
		controlChannel: "412122002162188289",
	},
	
	// The list of active modules and their configurations
	modules: {
		ApiMonitoring: {},
		Pokemon: {},
		Party: {},
		Item: {},
		Location: {},
		E4: {},
		Battle: {},
		Politics: {},
		Chat: {},
		Timing: {},
	},
};