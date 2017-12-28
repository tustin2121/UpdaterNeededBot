// updaters/default.js
// The default configuration for a run setup

module.exports = {
	// Information about the game being played
	// (Note: game0 cannot be defaulted, and it is in this file for documentation purposes)
	game0: {
		// The name of the game/hack being played (same as the base game if not hacked)
		name: "SuperName", //Where the game being played is 'Pokemon SuperName'
		// The name of the base game being played
		base: "Name", //Where the game SuperName is based on is 'Pokemon Name'
		// The generation of this game
		gen: 0,
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
	// If multiple games are being played at the same time, then 'game1' is defined now.
	
	// Information about the run
	run: {
		// Unix timestamp since when the run started
		runStart: -1, //Must be supplied
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
		inputMatch: /(([abxylrnsew]|up|down|left|right|start|select)\+?)+\-?/i,
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