// exptable.js
// Defines Experiance Tables for backup level calculation

class ExpTable {
	constructor(name, arr) {
		if (!Array.isArray(arr) && arr.length !== 100) throw new TypeError('Passed EXP Table is not correct!');
		this.name = name;
		this.table = new Uint32Array(100);
		this.reverse = {};
		
		for (let i = 0; i < 100; i++) {
			this.table[i] = arr[i];
			this.reverse[arr[i]] = i;
		}
	}
	
	getLevelFromExp(exp) {
		if (typeof exp !== 'number') return NaN; // Sanity check
		if (exp < 0) return 1; // Sanity check
		
		// Quick common case
		let l = this.reverse[exp];
		if (l) return l;
		
		// Slower general case
		for (let i = 0; i < 100; i++) {
			if (exp < this.table[i]) return i;
		}
		// Exception
		return 100;
	}
}

module.exports = {
	fast: new ExpTable("Fast", [
		0,6,21,51,100,172,274,409,583,800,1064,1382,1757,2195,2700,3276,3930,4665,5487,6400,7408,8518,9733,11059,12500,14060,15746,17561,19511,21600,23832,26214,28749,31443,34300,37324,40522,43897,47455,51200,55136,59270,63605,68147,72900,77868,83058,88473,94119,100000,
		106120,112486,119101,125971,133100,140492,148154,156089,164303,172800,181584,190662,200037,209715,219700,229996,240610,251545,262807,274400,286328,298598,311213,324179,337500,351180,365226,379641,394431,409600,425152,441094,457429,474163,491300,508844,526802,545177,563975,583200,602856,622950,643485,664467,685900,707788,730138,752953,776239,800000,
	]),
	medfast: new ExpTable("Medium Fast", [
		1,8,27,64,125,216,343,512,729,1000,1331,1728,2197,2744,3375,4096,4913,5832,6859,8000,9261,10648,12167,13824,15625,17576,19683,21952,24389,27000,29791,32768,35937,39304,42875,46656,50653,54872,59319,64000,68921,74088,79507,85184,91125,97336,103823,110592,117649,125000,
		132651,140608,148877,157464,166375,175616,185193,195112,205379,216000,226981,238328,250047,262144,274625,287496,300763,314432,328509,343000,357911,373248,389017,405224,421875,438976,456533,474552,493039,512000,531441,551368,571787,592704,614125,636056,658503,681472,704969,729000,753571,778688,804357,830584,857375,884736,912673,941192,970299,1000000,
	]),
	medslow: new ExpTable("Medium Slow", [
		// -54 = 16777162 unsigned
		-54,9,57,96,135,179,236,314,419,560,742,973,1261,1612,2035,2535,3120,3798,4575,5460,6458,7577,8825,10208,11735,13411,15244,17242,19411,21760,24294,27021,29949,33084,36435,40007,43808,47846,52127,56660,61450,66505,71833,77440,83335,89523,96012,102810,109923,117360,
		125126,133229,141677,150476,159635,169159,179056,189334,199999,211060,222522,234393,246681,259392,272535,286115,300140,314618,329555,344960,360838,377197,394045,411388,429235,447591,466464,485862,505791,526260,547274,568841,590969,613664,636935,660787,685228,710266,735907,762160,789030,816525,844653,873420,902835,932903,963632,995030,1027103,1059860,
	]),
	slow: new ExpTable("Slow", [
		1,10,33,80,156,270,428,640,911,1250,1663,2160,2746,3430,4218,5120,6141,7290,8573,10000,11576,13310,15208,17280,19531,21970,24603,27440,30486,33750,37238,40960,44921,49130,53593,58320,63316,68590,74148,80000,86151,92610,99383,106480,113906,121670,129778,138240,147061,156250,
		165813,175760,186096,196830,207968,219520,231491,243890,256723,270000,283726,297910,312558,327680,343281,359370,375953,393040,410636,428750,447388,466560,486271,506530,527343,548720,570666,593190,616298,640000,664301,689210,714733,740880,767656,795070,823128,851840,881211,911250,941963,973360,1005446,1038230,1071718,1105920,1140841,1176490,1212873,1250000,
	]),
};
module.exports["Fast"] = module.exports["fast"];
module.exports["Medium Fast"] = module.exports["medfast"];
module.exports["Medium Slow"] = module.exports["medslow"];
module.exports["Slow"] = module.exports["slow"];

module.exports.dex = [
	"medslow",		// Bulbasaur
	"medslow",		// Ivysaur
	"medslow",		// Venusaur
	"medslow",		// Charmander
	"medslow",		// Charmeleon
	"medslow",		// Charizard
	"medslow",		// Squirtle
	"medslow",		// Wartortle
	"medslow",		// Blastoise
	"medfast",		// Caterpie
	"medfast",		// Metapod
	"medfast",		// Butterfree
	"medfast",		// Weedle
	"medfast",		// Kakuna
	"medfast",		// Beedrill
	"medslow",		// Pidgey
	"medslow",		// Pidgeotto
	"medslow",		// Pidgeot
	"medfast",		// Rattata
	"medfast",		// Raticate
	"medfast",		// Spearow
	"medfast",		// Fearow
	"medfast",		// Ekans
	"medfast",		// Arbok
	"medfast",		// Pikachu
	"medfast",		// Raichu
	"medfast",		// Sandshrew
	"medfast",		// Sandslash
	"medslow",		// Nidoran♀
	"medslow",		// Nidorina
	"medslow",		// Nidoqueen
	"medslow",		// Nidoran♂
	"medslow",		// Nidorino
	"medslow",		// Nidoking
	"fast",			// Clefairy
	"fast",			// Clefable
	"medfast",		// Vulpix
	"medfast",		// Ninetales
	"fast",			// Jigglypuff
	"fast",			// Wigglytuff
	"medfast",		// Zubat
	"medfast",		// Golbat
	"medslow",		// Oddish
	"medslow",		// Gloom
	"medslow",		// Vileplume
	"medfast",		// Paras
	"medfast",		// Parasect
	"medfast",		// Venonat
	"medfast",		// Venomoth
	"medfast",		// Diglett
	"medfast",		// Dugtrio
	"medfast",		// Meowth
	"medfast",		// Persian
	"medfast",		// Psyduck
	"medfast",		// Golduck
	"medfast",		// Mankey
	"medfast",		// Primeape
	"slow",			// Growlithe
	"slow",			// Arcanine
	"medslow",		// Poliwag
	"medslow",		// Poliwhirl
	"medslow",		// Poliwrath
	"medslow",		// Abra
	"medslow",		// Kadabra
	"medslow",		// Alakazam
	"medslow",		// Machop
	"medslow",		// Machoke
	"medslow",		// Machamp
	"medslow",		// Bellsprout
	"medslow",		// Weepinbell
	"medslow",		// Victreebel
	"slow",			// Tentacool
	"slow",			// Tentacruel
	"medslow",		// Geodude
	"medslow",		// Graveler
	"medslow",		// Golem
	"medfast",		// Ponyta
	"medfast",		// Rapidash
	"medfast",		// Slowpoke
	"medfast",		// Slowbro
	"medfast",		// Magnemite
	"medfast",		// Magneton
	"medfast",		// Farfetch'd
	"medfast",		// Doduo
	"medfast",		// Dodrio
	"medfast",		// Seel
	"medfast",		// Dewgong
	"medfast",		// Grimer
	"medfast",		// Muk
	"slow",			// Shellder
	"slow",			// Cloyster
	"medslow",		// Gastly
	"medslow",		// Haunter
	"medslow",		// Gengar
	"medfast",		// Onix
	"medfast",		// Drowzee
	"medfast",		// Hypno
	"medfast",		// Krabby
	"medfast",		// Kingler
	"medfast",		// Voltorb
	"medfast",		// Electrode
	"slow",			// Exeggcute
	"slow",			// Exeggutor
	"medfast",		// Cubone
	"medfast",		// Marowak
	"medfast",		// Hitmonlee
	"medfast",		// Hitmonchan
	"medfast",		// Lickitung
	"medfast",		// Koffing
	"medfast",		// Weezing
	"slow",			// Rhyhorn
	"slow",			// Rhydon
	"fast",			// Chansey
	"medfast",		// Tangela
	"medfast",		// Kangaskhan
	"medfast",		// Horsea
	"medfast",		// Seadra
	"medfast",		// Goldeen
	"medfast",		// Seaking
	"slow",			// Staryu
	"slow",			// Starmie
	"medfast",		// Mr. Mime
	"medfast",		// Scyther
	"medfast",		// Jynx
	"medfast",		// Electabuzz
	"medfast",		// Magmar
	"slow",			// Pinsir
	"slow",			// Tauros
	"slow",			// Magikarp
	"slow",			// Gyarados
	"slow",			// Lapras
	"medfast",		// Ditto
	"medfast",		// Eevee
	"medfast",		// Vaporeon
	"medfast",		// Jolteon
	"medfast",		// Flareon
	"medfast",		// Porygon
	"medfast",		// Omanyte
	"medfast",		// Omastar
	"medfast",		// Kabuto
	"medfast",		// Kabutops
	"slow",			// Aerodactyl
	"slow",			// Snorlax
	"slow",			// Articuno
	"slow",			// Zapdos
	"slow",			// Moltres
	"slow",			// Dratini
	"slow",			// Dragonair
	"slow",			// Dragonite
	"slow",			// Mewtwo
	"medslow",		// Mew
	"medslow",		// Chikorita
	"medslow",		// Bayleef
	"medslow",		// Meganium
	"medslow",		// Cyndaquil
	"medslow",		// Quilava
	"medslow",		// Typhlosion
	"medslow",		// Totodile
	"medslow",		// Croconaw
	"medslow",		// Feraligatr
	"medfast",		// Sentret
	"medfast",		// Furret
	"medfast",		// Hoothoot
	"medfast",		// Noctowl
	"fast",			// Ledyba
	"fast",			// Ledian
	"fast",			// Spinarak
	"fast",			// Ariados
	"medfast",		// Crobat
	"slow",			// Chinchou
	"slow",			// Lanturn
	"medfast",		// Pichu
	"fast",			// Cleffa
	"fast",			// Igglybuff
	"fast",			// Togepi
	"fast",			// Togetic
	"medfast",		// Natu
	"medfast",		// Xatu
	"medslow",		// Mareep
	"medslow",		// Flaaffy
	"medslow",		// Ampharos
	"medslow",		// Bellossom
	"fast",			// Marill
	"fast",			// Azumarill
	"medfast",		// Sudowoodo
	"medslow",		// Politoed
	"medslow",		// Hoppip
	"medslow",		// Skiploom
	"medslow",		// Jumpluff
	"fast",			// Aipom
	"medslow",		// Sunkern
	"medslow",		// Sunflora
	"medfast",		// Yanma
	"medfast",		// Wooper
	"medfast",		// Quagsire
	"medfast",		// Espeon
	"medfast",		// Umbreon
	"medslow",		// Murkrow
	"medfast",		// Slowking
	"fast",			// Misdreavus
	"medfast",		// Unown
	"medfast",		// Wobbuffet
	"medfast",		// Girafarig
	"medfast",		// Pineco
	"medfast",		// Forretress
	"medfast",		// Dunsparce
	"medslow",		// Gligar
	"medfast",		// Steelix
	"fast",			// Snubbull
	"fast",			// Granbull
	"medfast",		// Qwilfish
	"medfast",		// Scizor
	"medslow",		// Shuckle
	"slow",			// Heracross
	"medslow",		// Sneasel
	"medfast",		// Teddiursa
	"medfast",		// Ursaring
	"medfast",		// Slugma
	"medfast",		// Magcargo
	"slow",			// Swinub
	"slow",			// Piloswine
	"fast",			// Corsola
	"medfast",		// Remoraid
	"medfast",		// Octillery
	"fast",			// Delibird
	"slow",			// Mantine
	"slow",			// Skarmory
	"slow",			// Houndour
	"slow",			// Houndoom
	"medfast",		// Kingdra
	"medfast",		// Phanpy
	"medfast",		// Donphan
	"medfast",		// Porygon2
	"slow",			// Stantler
	"fast",			// Smeargle
	"medfast",		// Tyrogue
	"medfast",		// Hitmontop
	"medfast",		// Smoochum
	"medfast",		// Elekid
	"medfast",		// Magby
	"slow",			// Miltank
	"fast",			// Blissey
	"slow",			// Raikou
	"slow",			// Entei
	"slow",			// Suicune
	"slow",			// Larvitar
	"slow",			// Pupitar
	"slow",			// Tyranitar
	"slow",			// Lugia
	"slow",			// Ho-Oh
	"medslow",		// Celebi
];