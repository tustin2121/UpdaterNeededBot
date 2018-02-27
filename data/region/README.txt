This folder contains Region definition json files. These files are parsed by the map system
to create a comprehensive map that the UpdaterBot can use for certain context information,
as well as English language use.

A region definition looks like this (give or take the usual JSON requirements):

{
	name: "Johto",  // The name of the region
	idType: "banked", // Types are "banked" for bank.id maps, or "single" for single id maps
	typeDefaults: { // Default attributes for certain map types
		"center": { indoors: true, heal: true, },
		//etc
	},
	nodes: {
		// A map of all nodes. In "banked" mode, keys are banks to object values, and
		// the subobjects have mapid keys to node values. In "single" mode, this is
		// one layer deep.
		0x18: {
			0x04: {
				//Node definition (see below)
			},
		},
	},
}


