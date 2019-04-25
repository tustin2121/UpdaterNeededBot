// data/genopts/gen4.js
// Defines the default generation options for a Gen 4 run

module.exports = {
	badgeNames: [
		"Trio", "Basic", "Insect", "Bolt", "Quake", "Jet", "Freeze", "Legend"
	],
	e4Names: [ "Shauntal", "Marshal", "Grimsley", "Caitlin" ],
	champName: "Alder",
	rivalName: "Cheren",
	
	trainerClasses: {
		// The following have special handling available
		rival: [37, 38, 40, 100, 101, 47, 82,],
		leader: [10, 11, 12, 19, 20, 21, 22, 23, 54, 55, 56],
		e4: [78, 79, 80, 81],
		champ: [89],
	},
};