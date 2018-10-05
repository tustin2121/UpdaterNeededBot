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
		regionMap: 'gen2_johto',
		// Trainer information
		trainer: {
			id: 1824,
			secret: 64434,
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
			trainerClasses: {
				// The following have special handling available
				rival: [8],
				leader: [],
				e4: [],
				champ: [],
				m: [], // Male trainer classes
				f: [], // Female trainer classes
				p: [], // Plural trainer classes
			},
		},
	},
	run: {
		// Unix timestamp since when the run started
		runStart : 1502571600,
		// The amount of time between searching for updates
		updatePeriod: 1000 * 2,
		
		// The Stream API URL to poll
		apiSrc: "http://localhost:1337/",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 5, //15 seconds
		
		// The Chat URL to connect to via irc
		chatSrc: null,
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
		},
		
		// The Reddit Live Updater ID to report to
		liveID : null,//"11eruwjudziy8",
		// The Discord LiveUpdater channel snowflake to report to
		discordID: "367499647410765824",
		
		// The Reddit Live Updater ID to report test information to
		testLiveID: null,//"11eruwjudziy8",
		// The Discord channel snowflake to report test information to
		testDiscordID: "367499647410765824",
		
		// The Discord channel snowflake where commands are taken
		controlChannel: "412122002162188289",
	},
	
	// The list of active modules and their configurations
	modules: {
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
		RealTime: {},
		PC: {},
	},
};