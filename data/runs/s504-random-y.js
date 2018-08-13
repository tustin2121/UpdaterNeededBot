// updaters/s504-random-y.js
// The configuration for Season 5's Anniversary run

const trainerClassInfo = require("../genopts/gen6").trainerClasses.info;

module.exports = {
	// Information about the game being played
	game0: {
		name: "Randomized Y",
		base: "Y",
		gen: 6,
		// The region to use as the map
		regionMap: 'gen6_kalos', //Folder in data/regions, or null if we don't have that info
		// Trainer information
		trainer: {
			id: 44691,
			secret: 42453, //gold doesn't have a secret id, so this is duped from id
		},
		// A list of game corrections and options
		opts: {
			determineImportanceMethod: 'viaTrainerId',
			// Despite the name, the below are not classes, but individual trainer ids
			trainerClasses: {
				// The following have special handling available
				rival: [
					130,131,132,184,185,186,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,435,436,437,519,520,521,604,605,606,
					575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,607,608,609,
				],
				leader: [6,21,22,23,24,25,26,76,613, 635,637,665,666,680,681,682,703,704,705,706,734,735,736],
				e4: [187,269,270,271, 661,662,770,771,778,779,780,781,783],
				champ: [276,277,],
				info: trainerClassInfo,
			},
		},
	},
	
	// Information about the run
	run: {
		// Unix timestamp since when the run started
		runStart: 1534021200, //Must be supplied
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
		liveID: "11ecntc3z480f",
		// The Discord LiveUpdater channel snowflake to report to
		discordID: "366698530343223306",
		
		// The Reddit Live Updater ID to report test information to
		testLiveID: "11eruwjudziy8",
		// The Discord channel snowflake to report test information to
		testDiscordID: "436589281033715712", //"367499647410765824",
		
		// The Discord channel snowflake where commands are taken
		controlChannel: "266878339346726913",
	},
	
	// The list of active modules and their configurations
	modules: {
		Meme: {},
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
		// RealTime: {},
		// PC: {},
	},
}