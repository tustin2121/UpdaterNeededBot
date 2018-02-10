// updaters/s501-dual-gen1.js
// The configuration for Season 5's Anniversary run

module.exports = {
	// Information about the game being played
	game0: {
		name: "Blue",
		base: "Blue",
		key: "blue",
		prefix: "[B]",
		nameMatch: /blue|left/i,
		// The generation of this game
		gen: 1,
		// The region to use as the map
		regionMap: null, //Folder in data/regions, or null if we don't have that info
		// Trainer information
		trainer: {
			id: 0,
			secret: 0,
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
		},
	},
	game1: {
		name: "Red",
		base: "Red",
		key: "red",
		prefix: "[R]",
		nameMatch: /red|right/i,
		// The generation of this game
		gen: 1,
		// The region to use as the map
		regionMap: null, //Folder in data/regions, or null if we don't have that info
		// Trainer information
		trainer: {
			id: 0,
			secret: 0,
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
		},
	},
	
	// Information about the run
	run: {
		// Unix timestamp since when the run started
		runStart: 1518484920, //Must be supplied
		// The amount of time between searching for updates
		updatePeriod: 1000 * 15,
		
		// The Stream API URL to poll
		apiSrc: "https://twitchplayspokemon.tv/api/run_status",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 15, //15 seconds
		
		// The Chat URLs to connect to via irc. If one doesn't work, the next will be tried, looping.
		chatSrc: ['irc.chat.twitch.tv:6667'],
		// The irc channel to join when connected via irc (auth data is in the auth folder)
		chatChannel: "#twitchplayspokemon",
		// The regex
		inputMatch: /([rl]:)?(([abxylrnsew]|up|down|left|right|start|select|anarchy|democracy)\+?)+\-?/i,
		// The map of chat inputs. true = this is an input, string = redirect to said input
		inputMap: {
			'up': true, 'down': true, 'left': true, 'right': true,
			'a': true, 'b': true, 'x': true, 'y': true,
			'l': true, 'r':true, 'start': true, 'select': true,
			'n':'up', 's':'down', 'e':'east', 'w':'west',
		},
		
		// The Reddit Live Updater ID to report to
		liveID: null,
		// The Discord LiveUpdater channel snowflake to report to
		discordID: null,
		
		// The Reddit Live Updater ID to report test information to
		testLiveID: null,
		// The Discord channel snowflake to report test information to
		testDiscordID: null,
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
		Gym: {},
		Battle: {},
		Politics: {},
		Chat: {},
		Timing: {},
	},
}