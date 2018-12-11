// updaters/s404-pyrite.js
// The configuration for Season 4's Pokemon Pyrite run

module.exports = {
	// Information about the game being played
	game0: {
		name: "Crystal Randofuser",
		base: "Crystal",
		gen: 2,
		// The region to use as the map
		regionMap: 'gen2_johto', //Folder in data/regions, or null if we don't have that info
		// Trainer information
		trainer: {
			id: 50959,
			secret: 54460,
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
			caughtInfo: false,
			secretId: false,
		},
	},
	run: {
		// Unix timestamp since when the run started
		runStart : 1544302800,
		// The amount of time between searching for updates
		updatePeriod: 1000 * 5,
		
		// The Stream API URL to poll
		apiSrc: "https://twitchplayspokemon.tv/api/run_status",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 12, //15 seconds
		
		// The Chat URLs to connect to via irc. If one doesn't work, the next will be tried, looping.
		// chatSrc: null,
		chatSrc: 'irc.chat.twitch.tv',
		// The irc channel to join when connected via irc (auth data is in the auth folder)
		chatChannel: "#twitchplayspokemon",
		// The regex
		inputMatch: /([rl<>][:.]?)?((up|down|left|right|start|select|anarchy|democracy|[abxylrnsew])\+?)+?\-?/i,
		// The map of chat inputs. true = this is an input, string = redirect to said input
		inputMap: {
			'up': true, 'down': true, 'left': true, 'right': true,
			'a': true, 'b': true, 'x': true, 'y': true,
			'l': true, 'r':true, 'start': true, 'select': true,
			'n':'up', 's':'down', 'e':'east', 'w':'west',
			'exp': true, 'xp':'exp', 'p':'exp',
		},
		
		// The Reddit Live Updater ID to report to
		liveID: "122kcpep8udww",
		// The Discord LiveUpdater channel snowflake to report to
		discordID: "366698530343223306",
		
		// The Reddit Live Updater ID to report test information to
		testLiveID: "122s7x2pzeq7m",
		// The Discord channel snowflake to report test information to
		testDiscordID: "436589281033715712", //"367499647410765824",
		
		// The Discord channel snowflake where commands are taken
		controlChannel: "266878339346726913",
	},
	
	// The list of active modules and their configurations
	modules: {
		// Meme: {},
		Location: {},
		ApiMonitoring: {},
		Pokemon: {},
		Party: {},
		Item: {},
		E4: {},
		Battle: {},
		Politics: {},
		Chat: {},
		Timing: {},
		Phonebook: {},
		Options: {},
		// GameStats: {},
		RunStats: {},
		RealTime: {},
		// PC: {},
	},
};