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
		runStart: 1511643600,
		updatePeriod: 1000 * 15,
		
		liveID: "zr4lmzz2p2tp",
		discordID: '366698530343223306',
	},
	
	// The list of active modules and their configurations
	modules: {
		Gym: false, //disabled
		Battle: false, //disabled
	},
};