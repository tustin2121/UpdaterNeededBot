// updaters/s406-ultra-sun.js
// The configuration for Season 4's Ultra Sun run

module.exports = {
	// Information about the game being played
	game0: {
		// The name of the game/hack being played (same as the base game if not hacked)
		name: "UltraSun",
		// The name of the base game being played
		base: "UltraSun",
		// The generation of this game
		gen: 7,
		// The region to use as the map
		regionMap: 'alola',
		// Trainer information
		trainer: {
			id: 57263,
			secret: 10183,
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
		},
	},
	run: {
		// Unix timestamp since when the run started
		runStart: 1511643600,
		// The amount of time between searching for updates
		updatePeriod: 1000 * 15, 
		
		// The Stream API URL to poll
		apiSrc: "https://twitchplayspokemon.tv/api/run_status",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 15, //15 seconds
		
		// The Chat URL to connect to via irc
		chatSrc: "",
		// The irc channel to join when connected via irc (auth data is in the auth folder)
		chatChannel: "#twitchplayspokemon",
		
		// The Reddit Live Updater ID to report to
		liveID: "zr4lmzz2p2tp",
		// The Discord LiveUpdater channel snowflake to report to
		discordID: '366698530343223306',
		
	},
	
	// The list of active modules and their configurations
	modules: {
		ApiMonitoring: {},
		Pokemon: {},
		Party: {},
		Item: {},
		Location: {},
		Health: {},
		E4: {},
		Gym: false, //disabled
		Battle: false, //disabled
		Politics: {},
		Chat: {},
		Timing: {},
	},
};