// updaters/s4-rand-white2.js
// The configuration for Season 4's Randomized White 2

module.exports = {
	// Information about the game being played
	game0: {
		name: "RandoColo",
		base: "Colosseum",
		gen: 3,
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
	
	run: {
		// Unix timestamp since when the run started
		runStart : 1560027600,
		// The amount of time between searching for updates
		updatePeriod: 1000 * 5,
		
		// The Stream API URL to poll
		apiSrc: "https://twitchplayspokemon.tv/api/run_status",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 12, //12 seconds
		
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
		liveID: "132l9olrsvbdj",
		// The Discord LiveUpdater channel snowflake to report to
		discordID: "366698530343223306",
		
		// The Reddit Live Updater ID to report test information to
		testLiveID: "13312tgaeyq8q",
		// The Discord channel snowflake to report test information to
		testDiscordID: "436589281033715712", //"367499647410765824",
		
		// The Discord channel snowflake where commands are taken
		controlChannel: "266878339346726913",
	},
	
	// The list of active modules and their configurations
	modules: {
		// Meme: {},
		MaplessLocation: {},
		ApiMonitoring: {},
		Pokemon: {},
		Party: {},
		Item: {},
		E4: {},
		Battle: {},
		Politics: {},
		Chat: {},
		// Timing: {
		// 	// The threshold amount of time without an update before the Timing module
		// 	// starts increasing importances
		// 	thresholdTicks: 5 * 15, //~15 minutes
		// 	// The amount per tick after the threshold that the importance should be increased.
		// 	promoteSlope: 0.01, //~0.05 importance per minute
		// },
		// Phonebook: {},
		// Options: {},
		GameStats: {
			stats: {
				// 'games_saved': 'GameSaved',
				// 'pokecenter_used': 'HealedAtCenter',
				// 'rested_at_home': 'HealedAtHome',
				// 'entered_safari_zone': null,
				// 'pokemon_trades': null,
				// 'splash_used': null,
				// 'struggle_used': null,
				// 'slots_jackpots': null,
				// 'contests_entered': null,
				// 'contests_won': null,
				// 'shopping_trips': null,
				// 'got_rained_on': null,
				// 'ribbons_earned': null,
				// 'ledges_jumped': null,
				// 'tvs_watched': null,
				// 'lottery_wins': null,
				// 'cable_car_rides': null,
				// 'hot_spring_baths_taken': null,
			},
			reportNote: null,
		},
		RunStats: { // Note: Stats we keep, not game stats
			innacurate: [], //list of innacurate stats
			reportNote: null,
		}, 
		// RealTime: {},
		// PC: {},
	},
};