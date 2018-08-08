// data/genopts/gen4.js
// Defines the default generation options for a Gen 4 run

module.exports = {
	badgeNames: [
		"Bug", "Cliff", "Rumble", "Plant", "Voltage", "Fairy", "Psychic", "Iceberg"
	],
	e4Names: [ "Malva", "Siebold", "Wikstrom", "Drasna" ],
	champName: "Diantha",
	rivalName: "{{gender|Serena|Calem}}",
	
	trainerClasses: {
		// The following have special handling available
		rival: [104,103],
		leader: [4,39,40,41,42,43,44,45,177, 81],
		e4: [35,36,37,38],
		champ: [53],
		info: [ //Extra Info
			{ id:  0, gender:'m', name: "Pokémon Trainer", },
			{ id:  1, gender:'f', name: "Pokémon Trainer", },
			{ id:  2, gender:'m', name: "Youngster", },
			{ id:  3, gender:'f', name: "Lass", },
			{ id:  4, gender:'f', name: "Leader", important:'leader', }, //Viola
			{ id:  5, gender:'f', name: "Sky Trainer", },
			{ id:  6, gender:'m', name: "Sky Trainer", },
			{ id:  7, gender:'f', name: "Waitress", },
			{ id:  8, gender:'p', name: "Ace Duo", },
			{ id:  9, gender:'f', name: "Ace Trainer", },
			{ id: 10, gender:'m', name: "Ace Trainer", },
			{ id: 11, gender:'f', name: "Preschooler", },
			{ id: 12, gender:'m', name: "Preschooler", },
			{ id: 13, gender:'f', name: "Hex Maniac", },
			{ id: 14, gender:'f', name: "Lady", },
			{ id: 15, gender:'f', name: "Beauty", },
			{ id: 16, gender:'m', name: "Rich Boy", },
			{ id: 17, gender:'m', name: "Swimmer M", },
			{ id: 18, gender:'f', name: "Team Flare", important:true, }, //Aliana
			{ id: 19, gender:'f', name: "Team Flare", important:true, }, //Bryony
			{ id: 20, gender:'f', name: "Team Flare", important:true, }, //Celosia
			{ id: 21, gender:'f', name: "Team Flare", important:true, }, //Mable
			{ id: 22, gender:'m', name: "Team Flare", important:true, }, //Xerosic
			{ id: 23, gender:'m', name: "Black Belt", },
			{ id: 24, gender:'m', name: "Tourist", },
			{ id: 25, gender:'m', name: "Garçon", },
			{ id: 26, gender:'p', name: "Artist Family", },
			{ id: 27, gender:'m', name: "Artist", },
			{ id: 28, gender:'f', name: "Artist", },
			{ id: 29, gender:'f', name: "Scientist", },
			{ id: 30, gender:'m', name: "Scientist", },
			{ id: 31, gender:'m', name: "Psychic", },
			{ id: 32, gender:'m', name: "Worker", },
			{ id: 33, gender:'m', name: "Worker", },
			{ id: 34, gender:'m', name: "Butler", },
			{ id: 35, gender:'f', name: "Elite Four", important:'e4', }, //Drasna
			{ id: 36, gender:'m', name: "Elite Four", important:'e4', }, //Wikstrom
			{ id: 37, gender:'f', name: "Elite Four", important:'e4', }, //Malva
			{ id: 38, gender:'m', name: "Elite Four", important:'e4', }, //Siebold
			{ id: 39, gender:'m', name: "Leader", important:'leader', }, //Grant
			{ id: 40, gender:'f', name: "Leader", important:'leader', }, //Olympia
			{ id: 41, gender:'f', name: "Leader", important:'leader', }, //Korrina
			{ id: 42, gender:'m', name: "Leader", important:'leader', }, //Ramos
			{ id: 43, gender:'m', name: "Leader", important:'leader', }, //Wulfric
			{ id: 44, gender:'m', name: "Leader", important:'leader', }, //Clemont
			{ id: 45, gender:'f', name: "Leader", important:'leader', }, //Valerie
			{ id: 46, gender:'p', name: "Brains & Brawn", },
			{ id: 47, gender:'m', name: "Punk Guy", },
			{ id: 48, gender:'f', name: "Schoolgirl", },
			{ id: 49, gender:'m', name: "Schoolboy", },
			{ id: 50, gender:'f', name: "Poké Fan", },
			{ id: 51, gender:'m', name: "Poké Fan", },
			{ id: 52, gender:'p', name: "Poké Fan Family", },
			{ id: 53, gender:'f', name: "Champion", important:'champ', }, //Diantha
			{ id: 54, gender:'m', name: "Fisherman", },
			{ id: 55, gender:'f', name: "Pokémon Trainer", }, //Shauna
			{ id: 56, gender:'m', name: "Pokémon Trainer", }, //Tierno
			{ id: 57, gender:'m', name: "Pokémon Trainer", }, //Trevor
			{ id: 58, gender:'f', name: "Ace Surfer", }, //Unused
			{ id: 59, gender:'m', name: "Ace Surfer", }, //Unused
			{ id: 60, gender:'m', name: "Gardener", },
			{ id: 61, gender:'m', name: "Backpacker", },
			{ id: 62, gender:'f', name: "Punk Girl", },
			{ id: 63, gender:'f', name: "Battle Girl", },
			{ id: 64, gender:'f', name: "Battle Chatelaine", important:true, }, //Nita
			{ id: 65, gender:'f', name: "Battle Chatelaine", important:true, }, //Evelyn
			{ id: 66, gender:'f', name: "Battle Chatelaine", important:true, }, //Dina
			{ id: 67, gender:'f', name: "Battle Chatelaine", important:true, }, //Morgan
			{ id: 68, gender:'f', name: "Tourist", },
			{ id: 69, gender:'m', name: "Tourist", },
			{ id: 70, gender:'f', name: "Swimmer F", },
			{ id: 71, gender:'p', name: "Mysterious Sisters", },
			{ id: 72, gender:'p', name: "Twins", },
			{ id: 73, gender:'f', name: "Furisode Girl", },
			{ id: 74, gender:'f', name: "Furisode Girl", },
			{ id: 75, gender:'f', name: "Furisode Girl", },
			{ id: 76, gender:'f', name: "Furisode Girl", },
			{ id: 77, gender:'f', name: "Team Flare Admin", },
			{ id: 78, gender:'m', name: "Team Flare Admin", },
			{ id: 79, gender:'f', name: "Team Flare", },
			{ id: 80, gender:'m', name: "Team Flare", }, 
			{ id: 81, gender:'m', name: "Team Flare", important:true, }, //Lysandre
			{ id: 82, gender:'f', name: "Veteran", },
			{ id: 83, gender:'m', name: "Veteran", },
			{ id: 84, gender:'f', name: "Rising Star", },
			{ id: 85, gender:'m', name: "Rising Star", },
			{ id: 86, gender:'f', name: "Pokémon Breeder", },
			{ id: 87, gender:'m', name: "Pokémon Breeder", },
			{ id: 88, gender:'f', name: "Pokémon Ranger", },
			{ id: 89, gender:'m', name: "Pokémon Ranger", },
			{ id: 90, gender:'m', name: "Owner", },
			{ id: 91, gender:'f', name: "Madame", },
			{ id: 92, gender:'p', name: "Swimmers", },
			{ id: 93, gender:'m', name: "Monsieur", },
			{ id: 94, gender:'f', name: "Maid", },
			{ id: 95, gender:'f', name: "Fairy Tale Girl", },
			{ id: 96, gender:'m', name: "Hiker", },
			{ id: 97, gender:'p', name: "Honeymooners", },
			{ id: 98, gender:'m', name: "Chef", },
			{ id: 99, gender:'p', name: "Rangers", },
			{ id:100, gender:'f', name: "Roller Skater", },
			{ id:101, gender:'m', name: "Roller Skater", },
			{ id:102, gender:'m', name: "Pokémon Trainer", important:true, }, //AZ
			{ id:103, gender:'m', name: "Pokémon Trainer", important:'rival', }, //Calem
			{ id:104, gender:'f', name: "Pokémon Trainer", important:'rival', }, //Serena
			{ id:105, gender:'m', name: "Pokémon Professor", },
			{ id:106, gender:'p', name: "Punk Couple", },
			{ id:107, gender:'m', name: "Team Flare", },
			{ id:108, gender:'f', name: "Team Flare", },
			{ id:109, gender:'m', name: "Baron", },
			{ id:110, gender:'m', name: "Viscount", },
			{ id:111, gender:'m', name: "Earl", },
			{ id:112, gender:'m', name: "Marquis", },
			{ id:113, gender:'m', name: "Duke", },
			{ id:114, gender:'m', name: "Baron", },
			{ id:115, gender:'m', name: "Viscount", },
			{ id:116, gender:'m', name: "Earl", },
			{ id:117, gender:'m', name: "Marquis", },
			{ id:118, gender:'m', name: "Duke", },
			{ id:119, gender:'m', name: "Baron", },
			{ id:120, gender:'m', name: "Viscount", },
			{ id:121, gender:'m', name: "Earl", },
			{ id:122, gender:'m', name: "Marquis", },
			{ id:123, gender:'m', name: "Duke", },
			{ id:124, gender:'f', name: "Baroness", },
			{ id:125, gender:'m', name: "Viscountess", },
			{ id:126, gender:'m', name: "Countess", },
			{ id:127, gender:'m', name: "Marchioness", },
			{ id:128, gender:'f', name: "Duchess", },
			{ id:129, gender:'f', name: "Baroness", },
			{ id:130, gender:'m', name: "Viscountess", },
			{ id:131, gender:'f', name: "Countess", },
			{ id:132, gender:'m', name: "Marchioness", },
			{ id:133, gender:'f', name: "Duchess", },
			{ id:134, gender:'f', name: "Baroness", },
			{ id:135, gender:'m', name: "Viscountess", },
			{ id:136, gender:'f', name: "Countess", },
			{ id:137, gender:'m', name: "Marchioness", },
			{ id:138, gender:'f', name: "Duchess", },
			{ id:139, gender:'m', name: "Marchioness", },
			{ id:140, gender:'m', name: "Marquis", },
			{ id:141, gender:'m', name: "Marchioness", },
			{ id:142, gender:'m', name: "Marquis", },
			{ id:143, gender:'m', name: "Marquis", },
			{ id:144, gender:'m', name: "Marchioness", },
			{ id:145, gender:'m', name: "Marchioness", },
			{ id:146, gender:'m', name: "Marquis", },
			{ id:147, gender:'m', name: "Duke", },
			{ id:148, gender:'f', name: "Duchess", },
			{ id:149, gender:'f', name: "Duchess", },
			{ id:150, gender:'m', name: "Duke", },
			{ id:151, gender:'f', name: "Grand Duchess", },
			{ id:152, gender:'f', name: "Marchioness", },
			{ id:153, gender:'f', name: "Marchioness", },
			{ id:154, gender:'f', name: "Marchioness", },
			{ id:155, gender:'f', name: "Marchioness", },
			{ id:156, gender:'f', name: "Duchess", },
			{ id:157, gender:'f', name: "Duchess", },
			{ id:158, gender:'f', name: "Duchess", },
			{ id:159, gender:'f', name: "Duchess", },
			{ id:160, gender:'f', name: "Pokémon Trainer", },
			{ id:161, gender:'m', name: "Pokémon Trainer", },
			{ id:162, gender:'m', name: "Driver", },
			{ id:163, gender:'m', name: "Driver", },
			{ id:164, gender:'m', name: "Driver", },
			{ id:165, gender:'f', name: "Lumiose Gang Member", },
			{ id:166, gender:'m', name: "Lumiose Gang Member", },
			{ id:167, gender:'f', name: "Suspicious Lady", },
			{ id:168, gender:'f', name: "Suspicious Woman", },
			{ id:169, gender:'f', name: "Suspicious Child", },
			{ id:170, gender:'f', name: "Pokémon Trainer", },
			{ id:171, gender:'f', name: "Pokémon Trainer", },
			{ id:172, gender:'f', name: "Pokémon Trainer", },
			{ id:173, gender:'f', name: "Team Flare", },
			{ id:174, gender:'m', name: "Team Flare", },
			{ id:175, gender:'m', name: "Team Flare Boss", },
			{ id:176, gender:'f', name: "Successor", }, //Korrina (at Tower of Mastery)
			{ id:177, gender:'f', name: "Leader", }, //Korrina (at Geosenge)
		],
		m: [2,6,10,12,16,17,23,24,25,27,30,31,32,33,34,36,38,39,42,43,44,47,49,], // Male trainer classes
		f: [3,4,5,7,9,11,13,14,15,28,29,35,37,40,41,45,48,], // Female trainer classes
		p: [8,26,46,], // Plural trainer classes
	},
	
	trainerId_joey: 36,
};