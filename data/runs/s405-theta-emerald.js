// updaters/s405-theta-emerald.js
// The configuration for Season 4's Theta Emerald run

module.exports = {
	// Information about the game being played
	game0: {
		// The name of the game/hack being played (same as the base game if not hacked)
		name: "ThetaEmeraldEX",
		// The name of the base game being played
		base: "Emerald",
		// The generation of this game
		gen: 3,
		// The region to use as the map
		regionMap: 'hoenn',
		// Trainer information
		trainer: {
			id: 51890,
			secret: 49705,
		},
	},
	run: {
		// Unix timestamp since when the run started
		runStart : 1506805200,
		// The amount of time between searching for updates
		updatePeriod: 1000 * 15, //15 seconds
		
		// The Stream API URL to poll
		apiSrc: "https://twitchplayspokemon.tv/api/run_status",
		// The amount of time between searching for updates
		updatePeriod: 1000 * 15, //15 seconds
		
		// The Chat URL to connect to via irc
		chatSrc: "",
		// The irc channel to join when connected via irc (auth data is in the auth folder)
		chatChannel: "#twitchplayspokemon",
		
		// The Reddit Live Updater ID to post to
		liveID : "zmxw6yogfa8q",
		// The Discord LiveUpdater channel snowflake
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
		Gym: {},
		Battle: {},
		Politics: {},
		Chat: {},
		Timing: {},
	},
};