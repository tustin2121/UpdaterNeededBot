// updaters/s502-storm-silver.js
// The configuration for Season 5's Anniversary run

module.exports = {
	// Information about the game being played
	game0: {
		name: "Bronze",
		base: "Gold",
		gen: 2,
		// The region to use as the map
		regionMap: 'gen2_bronze', //Folder in data/regions, or null if we don't have that info
		// Trainer information
		trainer: {
			id: 49922,
			secret: 49922, //gold doesn't have a secret id, so this is duped from id
		},
		// A list of game corrections and options
		opts: {
			// see /data/genopts
			secretId: false, //Gold/Silver doesn't support secret ids
			rivalName: "Cobolt",
			badgeNames: [
				"Bubble", //Sarah's Badge (Water) (1)
				"Weed", //Weedy's Badge (Grass) (2)
				"Terra", //Bianca's Badge (Fire) (3)
				"Zap", //Kohen's Badge (Electric) (4)
				"Blank", //Agar's Badge () (5)
				"Acrobat", //Karla's Badge (Flying) (6)
				"Pollute", //Elroy's Badge (Poison) (7)
				"Psycho", //Mauro's Badge (Psychic) (8)
			],
			e4Names: [ "Pryce", "Koga", "Bruno", "Karen" ],
			champName: "{{rival}}",
			
			trainerClasses: {
				// The following have special handling available
				rival: [9,42],
				leader: [63],
				e4: [11,15,13,14],
				champ: [16],
				m: [], // Male trainer classes
				f: [], // Female trainer classes
				p: [], // Plural trainer classes
			},
		},
	},
	
	// Information about the run
	run: {
		// Unix timestamp since when the run started
		runStart: 1528578000, //Must be supplied
		// The amount of time between searching for updates
		updatePeriod: 1000 * 5,
		
		// The Stream API URL to poll
		apiSrc: "https://twitchplayspokemon.tv/api/run_status",
		// The amount of wait time between polling the apiSrc for new information
		apiPollPeriod: 1000 * 15, //15 seconds
		
		// The Chat URLs to connect to via irc. If one doesn't work, the next will be tried, looping.
		chatSrc: null,//['irc.chat.twitch.tv:6667'],
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
		liveID: "111mqavwa498g",
		// The Discord LiveUpdater channel snowflake to report to
		discordID: "366698530343223306",
		
		// The Reddit Live Updater ID to report test information to
		testLiveID: "1130ge6ue2k7b",
		// The Discord channel snowflake to report test information to
		testDiscordID: "436589281033715712", //"367499647410765824",
		
		// The Discord channel snowflake where commands are taken
		controlChannel: "266878339346726913",
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
		// PC: {},
	},
}