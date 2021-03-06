// bodyfeats.js
// A list of all pokemon by index number, and the body features they have.

const PROPS = {
	head:1,
	leg:0,
	arm:0,
	body:0,
	base:0,
	wing:0,
	tail:0,
	fin:0,
	tentacle:0,
	worm:0,
	shell:0, //If the pokemon has a shell on its back
	claw:0, //If the pokemon owns a claw
	levitate:0, //If the pokemon can levitate
	firetail:0, //If the pokemon has a firey tail or backside
	electricbody:0, //If the pokemon has electricly charged skin
	explode:0, //If the pokemon easily explodes
	blade:0, //If the pokemon has something sharp like a blade
	heavy:0, //If the pokemon is extremely heavy
};

const CATS = {
	'head-only'		: { },
	'head-legs'		: { leg:2, },
	'head-arms'		: { arm:2, },
	'head-base'		: { base:1, },
	'wings'			: { wing:2, levitate:1, },
	'multi-wings'	: { wing:4, levitate:1, },
	'bipedal-tail'	: { leg:2, arm:2, tail:1, },
	'bipedal'		: { leg:2, arm:2, },
	'quadruped'		: { leg:4, tail:1, },
	'fins'			: { fin:2, tail:1, },
	'insect'		: { leg:6, },
	'multi-body'	: { head:2, },
	'tentacles'		: { tentacle:6, },
	'serpentine'	: { long:1,worm:1 },
};

const b = (base, extras={})=>{
	return Object.assign(PROPS, CATS[base], extras);
};

const mon = [];

mon[  1  ] = b('quadruped'		, { tail:0, }) // Bulbasaur
mon[  2  ] = b('quadruped'		, { tail:0, }) // Ivysaur
mon[  3  ] = b('quadruped'		, { tail:0, heavy:1, }) // Venusaur
mon[  4  ] = b('bipedal-tail' 	, { firetail:1, }) // Charmander
mon[  5  ] = b('bipedal-tail' 	, { firetail:1, }) // Charmeleon
mon[  6  ] = b('bipedal-tail' 	, { firetail:1, wing:2, }) // Charizard
mon[  7  ] = b('bipedal-tail' 	, { shell:1, }) // Squirtle
mon[  8  ] = b('bipedal-tail' 	, { shell:1, }) // Wartortle
mon[  9  ] = b('bipedal-tail' 	, { shell:1, heavy:1, }) // Blastoise
mon[  10 ] = b('insect'			, {}) // Caterpie
mon[  11 ] = b('serpentine' 	, { shell:1, }) // Metapod
mon[  12 ] = b('wings'			, {}) // Butterfree
mon[  13 ] = b('insect'			, {}) // Weedle
mon[  14 ] = b('serpentine' 	, { shell:1, }) // Kakuna
mon[  15 ] = b('wings'			, {}) // Beedrill
mon[  16 ] = b('wings'			, {}) // Pidgey
mon[  17 ] = b('wings'			, {}) // Pidgeotto
mon[  18 ] = b('wings'			, {}) // Pidgeot
mon[  19 ] = b('quadruped'		, {}) // Rattata
mon[  20 ] = b('quadruped'		, {}) // Raticate
mon[  21 ] = b('wings'			, {}) // Spearow
mon[  22 ] = b('wings'			, {}) // Fearow
mon[  23 ] = b('serpentine' 	, {}) // Ekans
mon[  24 ] = b('serpentine' 	, {}) // Arbok
mon[  25 ] = b('quadruped'		, { electricbody:1, }) // Pikachu
mon[  26 ] = b('bipedal-tail' 	, { electricbody:1, }) // Raichu
mon[  27 ] = b('bipedal-tail' 	, { shell:1, }) // Sandshrew
mon[  28 ] = b('bipedal-tail' 	, {}) // Sandslash
mon[  29 ] = b('quadruped'		, {}) // Nidoran♀
mon[  30 ] = b('quadruped'		, {}) // Nidorina
mon[  31 ] = b('bipedal-tail' 	, {}) // Nidoqueen
mon[  32 ] = b('quadruped'		, {}) // Nidoran♂
mon[  33 ] = b('quadruped'		, {}) // Nidorino
mon[  34 ] = b('bipedal-tail' 	, {}) // Nidoking
mon[  35 ] = b('bipedal-tail' 	, {}) // Clefairy
mon[  36 ] = b('bipedal-tail' 	, {}) // Clefable
mon[  37 ] = b('quadruped'		, { tail:6, }) // Vulpix
mon[  38 ] = b('quadruped'		, { tail:9, }) // Ninetales
mon[  39 ] = b('bipedal'		, {}) // Jigglypuff
mon[  40 ] = b('bipedal'		, {}) // Wigglytuff
mon[  41 ] = b('wings'			, {}) // Zubat
mon[  42 ] = b('wings'			, {}) // Golbat
mon[  43 ] = b('head-legs'		, {}) // Oddish
mon[  44 ] = b('bipedal'		, {}) // Gloom
mon[  45 ] = b('bipedal'		, {}) // Vileplume
mon[  46 ] = b('insect'			, {}) // Paras
mon[  47 ] = b('insect'			, {}) // Parasect
mon[  48 ] = b('bipedal'		, {}) // Venonat
mon[  49 ] = b('wings'			, {}) // Venomoth
mon[  50 ] = b('head-base'		, {}) // Diglett
mon[  51 ] = b('multi-body' 	, {}) // Dugtrio
mon[  52 ] = b('quadruped'		, {}) // Meowth
mon[  53 ] = b('quadruped'		, {}) // Persian
mon[  54 ] = b('bipedal-tail' 	, {}) // Psyduck
mon[  55 ] = b('bipedal-tail' 	, {}) // Golduck
mon[  56 ] = b('bipedal-tail' 	, {}) // Mankey
mon[  57 ] = b('bipedal-tail' 	, {}) // Primeape
mon[  58 ] = b('quadruped'		, {}) // Growlithe
mon[  59 ] = b('quadruped'		, {}) // Arcanine
mon[  60 ] = b('head-legs'		, { tail:1, }) // Poliwag
mon[  61 ] = b('bipedal'		, {}) // Poliwhirl
mon[  62 ] = b('bipedal'		, {}) // Poliwrath
mon[  63 ] = b('bipedal-tail' 	, {}) // Abra
mon[  64 ] = b('bipedal-tail' 	, {}) // Kadabra
mon[  65 ] = b('bipedal'		, {}) // Alakazam
mon[  66 ] = b('bipedal-tail' 	, {}) // Machop
mon[  67 ] = b('bipedal'		, {}) // Machoke
mon[  68 ] = b('bipedal'		, {}) // Machamp
mon[  69 ] = b('bipedal'		, {}) // Bellsprout
mon[  70 ] = b('head-base'		, {}) // Weepinbell
mon[  71 ] = b('head-base'		, {}) // Victreebel
mon[  72 ] = b('tentacles'		, {}) // Tentacool
mon[  73 ] = b('tentacles'		, {}) // Tentacruel
mon[  74 ] = b('head-arms'		, {}) // Geodude
mon[  75 ] = b('bipedal'		, {}) // Graveler
mon[  76 ] = b('bipedal'		, { explode:1, }) // Golem
mon[  77 ] = b('quadruped'		, { firetail:1, }) // Ponyta
mon[  78 ] = b('quadruped'		, { firetail:1, }) // Rapidash
mon[  79 ] = b('quadruped'		, {}) // Slowpoke
mon[  80 ] = b('bipedal-tail' 	, {}) // Slowbro
mon[  81 ] = b('head-arms'		, {}) // Magnemite
mon[  82 ] = b('multi-body' 	, {}) // Magneton
mon[  83 ] = b('wings'			, {}) // Farfetch'd
mon[  84 ] = b('head-legs'		, { head:2 }) // Doduo
mon[  85 ] = b('head-legs'		, { tail:1, head:3, }) // Dodrio
mon[  86 ] = b('fins'			, {}) // Seel
mon[  87 ] = b('fins'			, {}) // Dewgong
mon[  88 ] = b('head-arms'		, {}) // Grimer
mon[  89 ] = b('head-arms'		, {}) // Muk
mon[  90 ] = b('head-only'		, { shell:1, }) // Shellder
mon[  91 ] = b('head-only'		, { shell:1, }) // Cloyster
mon[  92 ] = b('head-only'		, {}) // Gastly
mon[  93 ] = b('head-arms'		, {}) // Haunter
mon[  94 ] = b('bipedal-tail' 	, {}) // Gengar
mon[  95 ] = b('serpentine' 	, { heavy:1, }) // Onix
mon[  96 ] = b('bipedal'		, {}) // Drowzee
mon[  97 ] = b('bipedal'		, {}) // Hypno
mon[  98 ] = b('insect'			, { shell:1, claw:1, }) // Krabby
mon[  99 ] = b('insect'			, { shell:1, claw:1, }) // Kingler
mon[ 100 ] = b('head-only'		, { explode:1, }) // Voltorb
mon[ 101 ] = b('head-only'		, { explode:1, }) // Electrode
mon[ 102 ] = b('multi-body' 	, { head:6, }) // Exeggcute
mon[ 103 ] = b('head-legs'		, { head:3, }) // Exeggutor
mon[ 104 ] = b('bipedal-tail' 	, {}) // Cubone
mon[ 105 ] = b('bipedal-tail' 	, {}) // Marowak
mon[ 106 ] = b('bipedal'		, {}) // Hitmonlee
mon[ 107 ] = b('bipedal'		, {}) // Hitmonchan
mon[ 108 ] = b('bipedal-tail' 	, {}) // Lickitung
mon[ 109 ] = b('head-only'		, {}) // Koffing
mon[ 110 ] = b('multi-body' 	, {}) // Weezing
mon[ 111 ] = b('quadruped'		, { heavy:1, }) // Rhyhorn
mon[ 112 ] = b('bipedal-tail' 	, { heavy:1, }) // Rhydon
mon[ 113 ] = b('bipedal-tail' 	, {}) // Chansey
mon[ 114 ] = b('head-legs'		, {}) // Tangela
mon[ 115 ] = b('bipedal-tail' 	, {}) // Kangaskhan
mon[ 116 ] = b('head-base'		, {}) // Horsea
mon[ 117 ] = b('head-base'		, {}) // Seadra
mon[ 118 ] = b('fins'			, {}) // Goldeen
mon[ 119 ] = b('fins'			, {}) // Seaking
mon[ 120 ] = b('head-base'		, {}) // Staryu
mon[ 121 ] = b('head-base'		, {}) // Starmie
mon[ 122 ] = b('bipedal'		, {}) // Mr. Mime
mon[ 123 ] = b('wings'			, { blade:2, }) // Scyther
mon[ 124 ] = b('bipedal'		, {}) // Jynx
mon[ 125 ] = b('bipedal-tail' 	, { electricbody:1, }) // Electabuzz
mon[ 126 ] = b('bipedal-tail' 	, { firetail:1, }) // Magmar
mon[ 127 ] = b('bipedal'		, {}) // Pinsir
mon[ 128 ] = b('quadruped'		, { tail:3, }) // Tauros
mon[ 129 ] = b('fins'			, {}) // Magikarp
mon[ 130 ] = b('serpentine' 	, {}) // Gyarados
mon[ 131 ] = b('fins'			, { shell:1, }) // Lapras
mon[ 132 ] = b('head-only'		, {}) // Ditto
mon[ 133 ] = b('quadruped'		, {}) // Eevee
mon[ 134 ] = b('quadruped'		, {}) // Vaporeon
mon[ 135 ] = b('quadruped'		, { electricbody:1, }) // Jolteon
mon[ 136 ] = b('quadruped'		, {}) // Flareon
mon[ 137 ] = b('head-legs'		, { tail:1, }) // Porygon
mon[ 138 ] = b('tentacles'		, { shell:1, }) // Omanyte
mon[ 139 ] = b('tentacles'		, { shell:1, }) // Omastar
mon[ 140 ] = b('insect'			, { shell:1, }) // Kabuto
mon[ 141 ] = b('bipedal-tail' 	, {}) // Kabutops
mon[ 142 ] = b('wings'			, {}) // Aerodactyl
mon[ 143 ] = b('bipedal'		, { heavy:1, }) // Snorlax
mon[ 144 ] = b('wings'			, {}) // Articuno
mon[ 145 ] = b('wings'			, {}) // Zapdos
mon[ 146 ] = b('wings'			, { firetail:1, }) // Moltres
mon[ 147 ] = b('serpentine' 	, {}) // Dratini
mon[ 148 ] = b('serpentine' 	, {}) // Dragonair
mon[ 149 ] = b('bipedal-tail' 	, { wing:2, levitate:1, }) // Dragonite
mon[ 150 ] = b('bipedal-tail' 	, {}) // Mewtwo
mon[ 151 ] = b('bipedal-tail' 	, { levitate:1, }) // Mew
mon[ 152 ] = b('quadruped'		, { tail:0, }) // Chikorita
mon[ 153 ] = b('quadruped'		, { tail:0, }) // Bayleef
mon[ 154 ] = b('quadruped'		, { tail:0, }) // Meganium
mon[ 155 ] = b('bipedal'		, { tail:0, firetail:1, }) // Cyndaquil
mon[ 156 ] = b('quadruped'		, { tail:0, firetail:1, }) // Quilava
mon[ 157 ] = b('quadruped'		, { tail:0, }) // Typhlosion
mon[ 158 ] = b('bipedal-tail' 	, {}) // Totodile
mon[ 159 ] = b('bipedal-tail' 	, {}) // Croconaw
mon[ 160 ] = b('bipedal-tail' 	, { heavy:1, }) // Feraligatr
mon[ 161 ] = b('quadruped'		, {}) // Sentret
mon[ 162 ] = b('quadruped'		, {}) // Furret
mon[ 163 ] = b('wings'			, {}) // Hoothoot
mon[ 164 ] = b('wings'			, {}) // Noctowl
mon[ 165 ] = b('wings'			, {}) // Ledyba
mon[ 166 ] = b('wings'			, {}) // Ledian
mon[ 167 ] = b('insect'			, {}) // Spinarak
mon[ 168 ] = b('insect'			, {}) // Ariados
mon[ 169 ] = b('wings'			, {}) // Crobat
mon[ 170 ] = b('fins'			, {}) // Chinchou
mon[ 171 ] = b('fins'			, {}) // Lanturn
mon[ 172 ] = b('quadruped'		, { electricbody:1, }) // Pichu
mon[ 173 ] = b('bipedal-tail' 	, {}) // Cleffa
mon[ 174 ] = b('bipedal'		, {}) // Igglybuff
mon[ 175 ] = b('bipedal'		, {}) // Togepi
mon[ 176 ] = b('bipedal'		, {}) // Togetic
mon[ 177 ] = b('wings'			, {}) // Natu
mon[ 178 ] = b('wings'			, {}) // Xatu
mon[ 179 ] = b('quadruped'		, { electricbody:1, }) // Mareep
mon[ 180 ] = b('bipedal-tail' 	, { electricbody:1, }) // Flaaffy
mon[ 181 ] = b('bipedal-tail' 	, { electricbody:1, }) // Ampharos
mon[ 182 ] = b('bipedal'		, {}) // Bellossom
mon[ 183 ] = b('bipedal-tail' 	, {}) // Marill
mon[ 184 ] = b('bipedal-tail' 	, {}) // Azumarill
mon[ 185 ] = b('bipedal'		, {}) // Sudowoodo
mon[ 186 ] = b('bipedal'		, {}) // Politoed
mon[ 187 ] = b('bipedal-tail' 	, { levitate:1, }) // Hoppip
mon[ 188 ] = b('bipedal-tail' 	, { levitate:1, }) // Skiploom
mon[ 189 ] = b('bipedal-tail' 	, { levitate:1, }) // Jumpluff
mon[ 190 ] = b('bipedal-tail' 	, {}) // Aipom
mon[ 191 ] = b('head-only'		, {}) // Sunkern
mon[ 192 ] = b('bipedal'		, {}) // Sunflora
mon[ 193 ] = b('wings'			, {}) // Yanma
mon[ 194 ] = b('head-legs'		, { tail:1, }) // Wooper
mon[ 195 ] = b('bipedal-tail' 	, { arm:2, }) // Quagsire
mon[ 196 ] = b('quadruped'		, {}) // Espeon
mon[ 197 ] = b('quadruped'		, {}) // Umbreon
mon[ 198 ] = b('wings'			, {}) // Murkrow
mon[ 199 ] = b('bipedal-tail' 	, {}) // Slowking
mon[ 200 ] = b('head-only'		, {}) // Misdreavus
mon[ 201 ] = b('head-only'		, { arm:1, }) // Unown
mon[ 202 ] = b('head-base'		, { tail:1, }) // Wobbuffet
mon[ 203 ] = b('quadruped'		, {}) // Girafarig
mon[ 204 ] = b('head-only'		, {}) // Pineco
mon[ 205 ] = b('head-only'		, { shell:1, }) // Forretress
mon[ 206 ] = b('serpentine' 	, {}) // Dunsparce
mon[ 207 ] = b('wings'			, {}) // Gligar
mon[ 208 ] = b('serpentine' 	, { heavy:1 }) // Steelix
mon[ 209 ] = b('bipedal'		, {}) // Snubbull
mon[ 210 ] = b('bipedal-tail' 	, {}) // Granbull
mon[ 211 ] = b('fins'			, {}) // Qwilfish
mon[ 212 ] = b('wings'			, { blade:2, }) // Scizor
mon[ 213 ] = b('insect'			, { shell:1, }) // Shuckle
mon[ 214 ] = b('bipedal'		, {}) // Heracross
mon[ 215 ] = b('bipedal-tail' 	, {}) // Sneasel
mon[ 216 ] = b('bipedal-tail' 	, { tail:0, }) // Teddiursa
mon[ 217 ] = b('bipedal-tail' 	, { heavy:1, tail:0, }) // Ursaring
mon[ 218 ] = b('serpentine' 	, { firetail:1, }) // Slugma
mon[ 219 ] = b('serpentine' 	, { firetail:1, }) // Magcargo
mon[ 220 ] = b('quadruped'		, { tail:0, }) // Swinub
mon[ 221 ] = b('quadruped'		, { tail:0, }) // Piloswine
mon[ 222 ] = b('insect'			, {}) // Corsola
mon[ 223 ] = b('fins'			, {}) // Remoraid
mon[ 224 ] = b('tentacles'		, {}) // Octillery
mon[ 225 ] = b('wings'			, { tail:1, }) // Delibird
mon[ 226 ] = b('wings'			, {}) // Mantine
mon[ 227 ] = b('wings'			, {}) // Skarmory
mon[ 228 ] = b('quadruped'		, {}) // Houndour
mon[ 229 ] = b('quadruped'		, {}) // Houndoom
mon[ 230 ] = b('head-base'		, {}) // Kingdra
mon[ 231 ] = b('quadruped'		, {}) // Phanpy
mon[ 232 ] = b('quadruped'		, {}) // Donphan
mon[ 233 ] = b('head-legs'		, { tail:1, }) // Porygon2
mon[ 234 ] = b('quadruped'		, {}) // Stantler
mon[ 235 ] = b('bipedal-tail' 	, {}) // Smeargle
mon[ 236 ] = b('bipedal'		, {}) // Tyrogue
mon[ 237 ] = b('bipedal-tail' 	, {}) // Hitmontop
mon[ 238 ] = b('bipedal'		, {}) // Smoochum
mon[ 239 ] = b('bipedal'		, { electricbody:1, }) // Elekid
mon[ 240 ] = b('bipedal-tail' 	, {}) // Magby
mon[ 241 ] = b('bipedal-tail' 	, {}) // Miltank
mon[ 242 ] = b('bipedal'		, {}) // Blissey
mon[ 243 ] = b('quadruped'		, { electricbody:1, }) // Raikou
mon[ 244 ] = b('quadruped'		, {}) // Entei
mon[ 245 ] = b('quadruped'		, {}) // Suicune
mon[ 246 ] = b('bipedal-tail' 	, {}) // Larvitar
mon[ 247 ] = b('serpentine' 	, {}) // Pupitar
mon[ 248 ] = b('bipedal-tail' 	, { heavy:1, }) // Tyranitar
mon[ 249 ] = b('wings'			, { tail:1, }) // Lugia
mon[ 250 ] = b('wings'			, { tail:1, }) // Ho-Oh
mon[ 251 ] = b('bipedal'		, {}) // Celebi
mon[ 252 ] = b('bipedal-tail' 	, {}) // Treecko
mon[ 253 ] = b('bipedal-tail' 	, {}) // Grovyle
mon[ 254 ] = b('bipedal-tail' 	, {}) // Sceptile
mon[ 255 ] = b('head-legs'		, {}) // Torchic
mon[ 256 ] = b('bipedal-tail' 	, {}) // Combusken
mon[ 257 ] = b('bipedal-tail' 	, {}) // Blaziken
mon[ 258 ] = b('quadruped'		, {}) // Mudkip
mon[ 259 ] = b('bipedal-tail' 	, {}) // Marshtomp
mon[ 260 ] = b('bipedal-tail' 	, {}) // Swampert
mon[ 261 ] = b('quadruped'		, {}) // Poochyena
mon[ 262 ] = b('quadruped'		, {}) // Mightyena
mon[ 263 ] = b('quadruped'		, {}) // Zigzagoon
mon[ 264 ] = b('quadruped'		, { long:1 }) // Linoone
mon[ 265 ] = b('insect'			, {}) // Wurmple
mon[ 266 ] = b('head-only'		, {}) // Silcoon
mon[ 267 ] = b('wings'			, {}) // Beautifly
mon[ 268 ] = b('head-only'		, {}) // Cascoon
mon[ 269 ] = b('wings'			, {}) // Dustox
mon[ 270 ] = b('insect'			, {}) // Lotad
mon[ 271 ] = b('bipedal'		, {}) // Lombre
mon[ 272 ] = b('bipedal'		, {}) // Ludicolo
mon[ 273 ] = b('head-legs'		, {}) // Seedot
mon[ 274 ] = b('bipedal'		, {}) // Nuzleaf
mon[ 275 ] = b('bipedal'		, {}) // Shiftry
mon[ 276 ] = b('wings'			, {}) // Taillow
mon[ 277 ] = b('wings'			, {}) // Swellow
mon[ 278 ] = b('wings'			, {}) // Wingull
mon[ 279 ] = b('wings'			, {}) // Pelipper
mon[ 280 ] = b('bipedal'		, {}) // Ralts
mon[ 281 ] = b('bipedal'		, {}) // Kirlia
mon[ 282 ] = b('bipedal'		, {}) // Gardevoir
mon[ 283 ] = b('insect'			, {}) // Surskit
mon[ 284 ] = b('wings'			, {}) // Masquerain
mon[ 285 ] = b('head-legs'		, {}) // Shroomish
mon[ 286 ] = b('bipedal-tail' 	, {}) // Breloom
mon[ 287 ] = b('quadruped'		, {}) // Slakoth
mon[ 288 ] = b('bipedal-tail' 	, {}) // Vigoroth
mon[ 289 ] = b('bipedal'		, { heavy:1, }) // Slaking
mon[ 290 ] = b('insect'			, {}) // Nincada
mon[ 291 ] = b('wings'			, { levitate:1, }) // Ninjask
mon[ 292 ] = b('head-base'		, { levitate:1, }) // Shedinja
mon[ 293 ] = b('bipedal-tail' 	, {}) // Whismur
mon[ 294 ] = b('bipedal-tail' 	, {}) // Loudred
mon[ 295 ] = b('bipedal-tail' 	, {}) // Exploud
mon[ 296 ] = b('bipedal'		, {}) // Makuhita
mon[ 297 ] = b('bipedal'		, {}) // Hariyama
mon[ 298 ] = b('head-legs'		, { tail:1, }) // Azurill
mon[ 299 ] = b('bipedal'		, {}) // Nosepass
mon[ 300 ] = b('quadruped'		, {}) // Skitty
mon[ 301 ] = b('quadruped'		, {}) // Delcatty
mon[ 302 ] = b('bipedal'		, {}) // Sableye
mon[ 303 ] = b('bipedal'		, {}) // Mawile
mon[ 304 ] = b('quadruped'		, { shell:1, }) // Aron
mon[ 305 ] = b('quadruped'		, { shell:1, }) // Lairon
mon[ 306 ] = b('bipedal-tail' 	, { shell:1, heavy:1, }) // Aggron
mon[ 307 ] = b('bipedal'		, {}) // Meditite
mon[ 308 ] = b('bipedal'		, {}) // Medicham
mon[ 309 ] = b('quadruped'		, { electricbody:1, }) // Electrike
mon[ 310 ] = b('quadruped'		, { electricbody:1, }) // Manectric
mon[ 311 ] = b('bipedal-tail' 	, { electricbody:1, }) // Plusle
mon[ 312 ] = b('bipedal-tail' 	, { electricbody:1, }) // Minun
mon[ 313 ] = b('bipedal-tail' 	, { levitate:1, }) // Volbeat
mon[ 314 ] = b('bipedal'		, { levitate:1, }) // Illumise
mon[ 315 ] = b('bipedal'		, {}) // Roselia
mon[ 316 ] = b('head-arms'		, {}) // Gulpin
mon[ 317 ] = b('head-arms'		, {}) // Swalot
mon[ 318 ] = b('fins'			, {}) // Carvanha
mon[ 319 ] = b('fins'			, { tail:0, }) // Sharpedo
mon[ 320 ] = b('fins'			, { tail:0, heavy:1, }) // Wailmer
mon[ 321 ] = b('fins'			, {}) // Wailord
mon[ 322 ] = b('quadruped'		, { tail:0, }) // Numel
mon[ 323 ] = b('quadruped'		, { tail:0, }) // Camerupt
mon[ 324 ] = b('quadruped'		, { shell:1, }) // Torkoal
mon[ 325 ] = b('head-arms'		, {}) // Spoink
mon[ 326 ] = b('bipedal-tail' 	, {}) // Grumpig
mon[ 327 ] = b('bipedal-tail' 	, {}) // Spinda
mon[ 328 ] = b('insect'			, {}) // Trapinch
mon[ 329 ] = b('wings'			, {}) // Vibrava
mon[ 330 ] = b('wings'			, {}) // Flygon
mon[ 331 ] = b('bipedal'		, {}) // Cacnea
mon[ 332 ] = b('bipedal'		, {}) // Cacturne
mon[ 333 ] = b('wings'			, {}) // Swablu
mon[ 334 ] = b('wings'			, {}) // Altaria
mon[ 335 ] = b('bipedal-tail' 	, {}) // Zangoose
mon[ 336 ] = b('serpentine' 	, {}) // Seviper
mon[ 337 ] = b('head-only'		, {}) // Lunatone
mon[ 338 ] = b('head-only'		, {}) // Solrock
mon[ 339 ] = b('fins'			, {}) // Barboach
mon[ 340 ] = b('fins'			, {}) // Whiscash
mon[ 341 ] = b('insect'			, {}) // Corphish
mon[ 342 ] = b('insect'			, {}) // Crawdaunt
mon[ 343 ] = b('head-arms'		, {}) // Baltoy
mon[ 344 ] = b('head-arms'		, {}) // Claydol
mon[ 345 ] = b('head-base'		, {}) // Lileep
mon[ 346 ] = b('head-base'		, {}) // Cradily
mon[ 347 ] = b('insect'			, {}) // Anorith
mon[ 348 ] = b('bipedal-tail' 	, { shell:1, }) // Armaldo
mon[ 349 ] = b('fins'			, {}) // Feebas
mon[ 350 ] = b('serpentine' 	, {}) // Milotic
mon[ 351 ] = b('head-only'		, {}) // Castform
mon[ 352 ] = b('bipedal-tail' 	, {}) // Kecleon
mon[ 353 ] = b('head-only'		, {}) // Shuppet
mon[ 354 ] = b('bipedal-tail' 	, {}) // Banette
mon[ 355 ] = b('head-arms'		, {}) // Duskull
mon[ 356 ] = b('bipedal'		, {}) // Dusclops
mon[ 357 ] = b('quadruped'		, {}) // Tropius
mon[ 358 ] = b('head-arms'		, {}) // Chimecho
mon[ 359 ] = b('quadruped'		, {}) // Absol
mon[ 360 ] = b('bipedal-tail' 	, {}) // Wynaut
mon[ 361 ] = b('bipedal'		, {}) // Snorunt
mon[ 362 ] = b('head-only'		, {}) // Glalie
mon[ 363 ] = b('fins'			, {}) // Spheal
mon[ 364 ] = b('fins'			, {}) // Sealeo
mon[ 365 ] = b('quadruped'		, {}) // Walrein
mon[ 366 ] = b('head-only'		, { shell:1, }) // Clamperl
mon[ 367 ] = b('serpentine' 	, {}) // Huntail
mon[ 368 ] = b('serpentine' 	, {}) // Gorebyss
mon[ 369 ] = b('fins'			, {}) // Relicanth
mon[ 370 ] = b('fins'			, { tail:0, }) // Luvdisc
mon[ 371 ] = b('bipedal'		, { shell:1, }) // Bagon
mon[ 372 ] = b('quadruped'		, { tail:0, shell:1, }) // Shelgon
mon[ 373 ] = b('quadruped'		, {}) // Salamence
mon[ 374 ] = b('head-base'		, { claw:1, levitate:1, }) // Beldum
mon[ 375 ] = b('head-arms'		, { claw:2, levitate:1, }) // Metang
mon[ 376 ] = b('multi-body' 	, { claw:4, heavy:1, }) // Metagross
mon[ 377 ] = b('bipedal'		, {}) // Regirock
mon[ 378 ] = b('bipedal'		, {}) // Regice
mon[ 379 ] = b('bipedal'		, {}) // Registeel
mon[ 380 ] = b('wings'			, { levitate:1, }) // Latias
mon[ 381 ] = b('wings'			, { levitate:1, }) // Latios
mon[ 382 ] = b('fins'			, { heavy:1, }) // Kyogre
mon[ 383 ] = b('bipedal-tail' 	, { heavy:1, }) // Groudon
mon[ 384 ] = b('serpentine' 	, { levitate:1, }) // Rayquaza
mon[ 385 ] = b('bipedal'		, { levitate:1, }) // Jirachi
mon[ 386 ] = b('bipedal'		, { levitate:1, }) // Deoxys
mon[ 387 ] = b('quadruped'		, { shell:1, }) // Turtwig
mon[ 388 ] = b('quadruped'		, { shell:1, }) // Grotle
mon[ 389 ] = b('quadruped'		, { shell:1, heavy:1, }) // Torterra
mon[ 390 ] = b('bipedal-tail' 	, { firetail:1, }) // Chimchar
mon[ 391 ] = b('bipedal-tail' 	, { firetail:1, }) // Monferno
mon[ 392 ] = b('bipedal-tail' 	, {}) // Infernape
mon[ 393 ] = b('bipedal'		, {}) // Piplup
mon[ 394 ] = b('bipedal-tail' 	, {}) // Prinplup
mon[ 395 ] = b('bipedal-tail' 	, { heavy:1, }) // Empoleon
mon[ 396 ] = b('wings'			, {}) // Starly
mon[ 397 ] = b('wings'			, {}) // Staravia
mon[ 398 ] = b('wings'			, {}) // Staraptor
mon[ 399 ] = b('quadruped'		, {}) // Bidoof
mon[ 400 ] = b('bipedal-tail' 	, {}) // Bibarel
mon[ 401 ] = b('bipedal'		, {}) // Kricketot
mon[ 402 ] = b('wings'			, {}) // Kricketune
mon[ 403 ] = b('quadruped'		, { electricbody:1, }) // Shinx
mon[ 404 ] = b('quadruped'		, { electricbody:1, }) // Luxio
mon[ 405 ] = b('quadruped'		, { electricbody:1, }) // Luxray
mon[ 406 ] = b('bipedal'		, {}) // Budew
mon[ 407 ] = b('bipedal'		, {}) // Roserade
mon[ 408 ] = b('bipedal-tail' 	, {}) // Cranidos
mon[ 409 ] = b('bipedal-tail' 	, {}) // Rampardos
mon[ 410 ] = b('quadruped'		, { shell:1, }) // Shieldon
mon[ 411 ] = b('quadruped'		, { shell:1, }) // Bastiodon
mon[ 412 ] = b('head-base'		, {}) // Burmy
mon[ 413 ] = b('head-base'		, {}) // Wormadam
mon[ 414 ] = b('wings'			, {}) // Mothim
mon[ 415 ] = b('multi-body' 	, {}) // Combee
mon[ 416 ] = b('wings'			, {}) // Vespiquen
mon[ 417 ] = b('quadruped'		, {}) // Pachirisu
mon[ 418 ] = b('quadruped'		, {}) // Buizel
mon[ 419 ] = b('quadruped'		, {}) // Floatzel
mon[ 420 ] = b('multi-body' 	, {}) // Cherubi
mon[ 421 ] = b('head-legs'		, {}) // Cherrim
mon[ 422 ] = b('serpentine' 	, {}) // Shellos
mon[ 423 ] = b('serpentine' 	, {}) // Gastrodon
mon[ 424 ] = b('bipedal-tail' 	, {}) // Ambipom
mon[ 425 ] = b('head-arms'		, {}) // Drifloon
mon[ 426 ] = b('head-arms'		, {}) // Drifblim
mon[ 427 ] = b('bipedal-tail' 	, {}) // Buneary
mon[ 428 ] = b('bipedal-tail' 	, {}) // Lopunny
mon[ 429 ] = b('head-only'		, {}) // Mismagius
mon[ 430 ] = b('wings'			, {}) // Honchkrow
mon[ 431 ] = b('quadruped'		, {}) // Glameow
mon[ 432 ] = b('quadruped'		, {}) // Purugly
mon[ 433 ] = b('bipedal'		, {}) // Chingling
mon[ 434 ] = b('quadruped'		, {}) // Stunky
mon[ 435 ] = b('quadruped'		, {}) // Skuntank
mon[ 436 ] = b('head-only'		, {}) // Bronzor
mon[ 437 ] = b('head-arms'		, {}) // Bronzong
mon[ 438 ] = b('head-legs'		, {}) // Bonsly
mon[ 439 ] = b('bipedal'		, {}) // Mime Jr.
mon[ 440 ] = b('bipedal'		, {}) // Happiny
mon[ 441 ] = b('wings'			, {}) // Chatot
mon[ 442 ] = b('head-base'		, {}) // Spiritomb
mon[ 443 ] = b('bipedal-tail' 	, { claw:2, }) // Gible
mon[ 444 ] = b('bipedal-tail' 	, { claw:2 }) // Gabite
mon[ 445 ] = b('bipedal-tail' 	, { claw:2 }) // Garchomp
mon[ 446 ] = b('bipedal'		, {}) // Munchlax
mon[ 447 ] = b('bipedal-tail' 	, {}) // Riolu
mon[ 448 ] = b('bipedal-tail' 	, {}) // Lucario
mon[ 449 ] = b('quadruped'		, { heavy:1, }) // Hippopotas
mon[ 450 ] = b('quadruped'		, { heavy:1, }) // Hippowdon
mon[ 451 ] = b('insect'			, {}) // Skorupi
mon[ 452 ] = b('insect'			, {}) // Drapion
mon[ 453 ] = b('bipedal'		, {}) // Croagunk
mon[ 454 ] = b('bipedal'		, {}) // Toxicroak
mon[ 455 ] = b('tentacles'		, {}) // Carnivine
mon[ 456 ] = b('fins'			, {}) // Finneon
mon[ 457 ] = b('fins'			, {}) // Lumineon
mon[ 458 ] = b('wings'			, {}) // Mantyke
mon[ 459 ] = b('bipedal-tail' 	, {}) // Snover
mon[ 460 ] = b('bipedal-tail' 	, {}) // Abomasnow
mon[ 461 ] = b('bipedal-tail' 	, {}) // Weavile
mon[ 462 ] = b('head-arms'		, {}) // Magnezone
mon[ 463 ] = b('bipedal'		, {}) // Lickilicky
mon[ 464 ] = b('bipedal-tail' 	, { heavy:1, }) // Rhyperior
mon[ 465 ] = b('bipedal'		, {}) // Tangrowth
mon[ 466 ] = b('bipedal-tail' 	, { electricbody:1, }) // Electivire
mon[ 467 ] = b('bipedal-tail' 	, { firetail:1, }) // Magmortar
mon[ 468 ] = b('wings'			, {}) // Togekiss
mon[ 469 ] = b('wings'			, {}) // Yanmega
mon[ 470 ] = b('quadruped'		, {}) // Leafeon
mon[ 471 ] = b('quadruped'		, {}) // Glaceon
mon[ 472 ] = b('wings'			, {}) // Gliscor
mon[ 473 ] = b('quadruped'		, { heavy:1, }) // Mamoswine
mon[ 474 ] = b('head-arms'		, { tail:1, }) // Porygon-Z
mon[ 475 ] = b('bipedal'		, { fin:2, blade:2 }) // Gallade
mon[ 476 ] = b('multi-body' 	, {}) // Probopass
mon[ 477 ] = b('head-arms'		, {}) // Dusknoir
mon[ 478 ] = b('head-arms'		, {}) // Froslass
mon[ 479 ] = b('head-only'		, {}) // Rotom
mon[ 480 ] = b('bipedal-tail' 	, {}) // Uxie
mon[ 481 ] = b('bipedal-tail' 	, {}) // Mesprit
mon[ 482 ] = b('bipedal-tail' 	, {}) // Azelf
mon[ 483 ] = b('quadruped'		, {}) // Dialga
mon[ 484 ] = b('bipedal-tail' 	, {}) // Palkia
mon[ 485 ] = b('quadruped'		, {}) // Heatran
mon[ 486 ] = b('bipedal'		, {}) // Regigigas
mon[ 487 ] = b('tentacles'		, {}) // Giratina
mon[ 488 ] = b('serpentine' 	, {}) // Cresselia
mon[ 489 ] = b('head-arms'		, {}) // Phione
mon[ 490 ] = b('bipedal'		, {}) // Manaphy
mon[ 491 ] = b('bipedal'		, {}) // Darkrai
mon[ 492 ] = b('quadruped'		, { tail:0, }) // Shaymin
mon[ 493 ] = b('quadruped'		, {}) // Arceus
mon[ 494 ] = b('bipedal'		, {}) // Victini
mon[ 495 ] = b('bipedal-tail' 	, {}) // Snivy
mon[ 496 ] = b('bipedal-tail' 	, {}) // Servine
mon[ 497 ] = b('serpentine' 	, {}) // Serperior
mon[ 498 ] = b('quadruped'		, {}) // Tepig
mon[ 499 ] = b('bipedal-tail' 	, {}) // Pignite
mon[ 500 ] = b('bipedal-tail' 	, {}) // Emboar
mon[ 501 ] = b('bipedal-tail' 	, {}) // Oshawott
mon[ 502 ] = b('bipedal-tail' 	, {}) // Dewott
mon[ 503 ] = b('quadruped'		, {}) // Samurott
mon[ 504 ] = b('quadruped'		, {}) // Patrat
mon[ 505 ] = b('bipedal-tail' 	, {}) // Watchog
mon[ 506 ] = b('quadruped'		, {}) // Lillipup
mon[ 507 ] = b('quadruped'		, {}) // Herdier
mon[ 508 ] = b('quadruped'		, {}) // Stoutland
mon[ 509 ] = b('quadruped'		, {}) // Purrloin
mon[ 510 ] = b('quadruped'		, {}) // Liepard
mon[ 511 ] = b('bipedal-tail' 	, {}) // Pansage
mon[ 512 ] = b('bipedal-tail' 	, {}) // Simisage
mon[ 513 ] = b('bipedal-tail' 	, {}) // Pansear
mon[ 514 ] = b('bipedal-tail' 	, {}) // Simisear
mon[ 515 ] = b('bipedal-tail' 	, {}) // Panpour
mon[ 516 ] = b('bipedal-tail' 	, {}) // Simipour
mon[ 517 ] = b('quadruped'		, { tail:0, levitate:1, }) // Munna
mon[ 518 ] = b('bipedal'		, { levitate:1, }) // Musharna
mon[ 519 ] = b('wings'			, {}) // Pidove
mon[ 520 ] = b('wings'			, {}) // Tranquill
mon[ 521 ] = b('wings'			, {}) // Unfezant
mon[ 522 ] = b('quadruped'		, { electricbody:1, }) // Blitzle
mon[ 523 ] = b('quadruped'		, { electricbody:1, }) // Zebstrika
mon[ 524 ] = b('head-legs'		, {}) // Roggenrola
mon[ 525 ] = b('tentacles'		, { shell:1, }) // Boldore
mon[ 526 ] = b('tentacles'		, {}) // Gigalith
mon[ 527 ] = b('wings'			, {}) // Woobat
mon[ 528 ] = b('wings'			, {}) // Swoobat
mon[ 529 ] = b('bipedal-tail' 	, {}) // Drilbur
mon[ 530 ] = b('bipedal'		, {}) // Excadrill
mon[ 531 ] = b('bipedal-tail' 	, {}) // Audino
mon[ 532 ] = b('bipedal'		, {}) // Timburr
mon[ 533 ] = b('bipedal'		, {}) // Gurdurr
mon[ 534 ] = b('bipedal'		, {}) // Conkeldurr
mon[ 535 ] = b('fins'			, {}) // Tympole
mon[ 536 ] = b('bipedal-tail' 	, {}) // Palpitoad
mon[ 537 ] = b('bipedal'		, {}) // Seismitoad
mon[ 538 ] = b('bipedal'		, {}) // Throh
mon[ 539 ] = b('bipedal'		, {}) // Sawk
mon[ 540 ] = b('insect'			, {}) // Sewaddle
mon[ 541 ] = b('head-arms'		, {}) // Swadloon
mon[ 542 ] = b('bipedal'		, {}) // Leavanny
mon[ 543 ] = b('insect'			, { shell:1, }) // Venipede
mon[ 544 ] = b('head-only'		, { shell:1, }) // Whirlipede
mon[ 545 ] = b('insect'			, { shell:1, }) // Scolipede
mon[ 546 ] = b('head-only'		, {}) // Cottonee
mon[ 547 ] = b('bipedal'		, {}) // Whimsicott
mon[ 548 ] = b('head-base'		, {}) // Petilil
mon[ 549 ] = b('head-base'		, {}) // Lilligant
mon[ 550 ] = b('fins'			, {}) // Basculin
mon[ 551 ] = b('quadruped'		, {}) // Sandile
mon[ 552 ] = b('quadruped'		, {}) // Krokorok
mon[ 553 ] = b('bipedal-tail' 	, {}) // Krookodile
mon[ 554 ] = b('bipedal'		, {}) // Darumaka
mon[ 555 ] = b('quadruped'		, {}) // Darmanitan
mon[ 556 ] = b('head-base'		, {}) // Maractus
mon[ 557 ] = b('insect'			, { shell:1, }) // Dwebble
mon[ 558 ] = b('insect'			, { shell:1, }) // Crustle
mon[ 559 ] = b('bipedal-tail' 	, {}) // Scraggy
mon[ 560 ] = b('bipedal-tail' 	, {}) // Scrafty
mon[ 561 ] = b('wings'			, {}) // Sigilyph
mon[ 562 ] = b('head-arms'		, {}) // Yamask
mon[ 563 ] = b('head-base'		, {}) // Cofagrigus
mon[ 564 ] = b('quadruped'		, {}) // Tirtouga
mon[ 565 ] = b('bipedal-tail' 	, {}) // Carracosta
mon[ 566 ] = b('wings'			, {}) // Archen
mon[ 567 ] = b('wings'			, {}) // Archeops
mon[ 568 ] = b('bipedal'		, {}) // Trubbish
mon[ 569 ] = b('bipedal'		, {}) // Garbodor
mon[ 570 ] = b('quadruped'		, {}) // Zorua
mon[ 571 ] = b('bipedal-tail' 	, {}) // Zoroark
mon[ 572 ] = b('quadruped'		, {}) // Minccino
mon[ 573 ] = b('quadruped'		, {}) // Cinccino
mon[ 574 ] = b('bipedal'		, {}) // Gothita
mon[ 575 ] = b('bipedal'		, {}) // Gothorita
mon[ 576 ] = b('bipedal'		, {}) // Gothitelle
mon[ 577 ] = b('head-only'		, {}) // Solosis
mon[ 578 ] = b('head-only'		, {}) // Duosion
mon[ 579 ] = b('head-arms'		, {}) // Reuniclus
mon[ 580 ] = b('wings'			, {}) // Ducklett
mon[ 581 ] = b('wings'			, {}) // Swanna
mon[ 582 ] = b('head-base'		, {}) // Vanillite
mon[ 583 ] = b('head-base'		, {}) // Vanillish
mon[ 584 ] = b('multi-body' 	, {}) // Vanilluxe
mon[ 585 ] = b('quadruped'		, {}) // Deerling
mon[ 586 ] = b('quadruped'		, {}) // Sawsbuck
mon[ 587 ] = b('quadruped'		, {}) // Emolga
mon[ 588 ] = b('bipedal'		, {}) // Karrablast
mon[ 589 ] = b('head-arms'		, {}) // Escavalier
mon[ 590 ] = b('head-arms'		, {}) // Foongus
mon[ 591 ] = b('head-arms'		, {}) // Amoonguss
mon[ 592 ] = b('tentacles'		, {}) // Frillish
mon[ 593 ] = b('tentacles'		, {}) // Jellicent
mon[ 594 ] = b('fins'			, {}) // Alomomola
mon[ 595 ] = b('insect'			, { electricbody:1, }) // Joltik
mon[ 596 ] = b('insect'			, { electricbody:1, }) // Galvantula
mon[ 597 ] = b('head-only'		, {}) // Ferroseed
mon[ 598 ] = b('tentacles'		, { shell:1, }) // Ferrothorn
mon[ 599 ] = b('multi-body' 	, {}) // Klink
mon[ 600 ] = b('multi-body' 	, {}) // Klang
mon[ 601 ] = b('multi-body' 	, {}) // Klinklang
mon[ 602 ] = b('fins'			, {}) // Tynamo
mon[ 603 ] = b('fins'			, { electricbody:1, }) // Eelektrik
mon[ 604 ] = b('fins'			, { electricbody:1, }) // Eelektross
mon[ 605 ] = b('bipedal-tail' 	, {}) // Elgyem
mon[ 606 ] = b('bipedal'		, {}) // Beheeyem
mon[ 607 ] = b('head-base'		, {}) // Litwick
mon[ 608 ] = b('head-arms'		, {}) // Lampent
mon[ 609 ] = b('head-arms'		, {}) // Chandelure
mon[ 610 ] = b('bipedal-tail' 	, {}) // Axew
mon[ 611 ] = b('bipedal-tail' 	, {}) // Fraxure
mon[ 612 ] = b('bipedal-tail' 	, {}) // Haxorus
mon[ 613 ] = b('bipedal-tail' 	, {}) // Cubchoo
mon[ 614 ] = b('quadruped'		, {}) // Beartic
mon[ 615 ] = b('head-only'		, {}) // Cryogonal
mon[ 616 ] = b('head-only'		, {}) // Shelmet
mon[ 617 ] = b('head-arms'		, {}) // Accelgor
mon[ 618 ] = b('fins'			, { electricbody:1, }) // Stunfisk
mon[ 619 ] = b('bipedal-tail' 	, {}) // Mienfoo
mon[ 620 ] = b('bipedal-tail' 	, {}) // Mienshao
mon[ 621 ] = b('bipedal-tail' 	, {}) // Druddigon
mon[ 622 ] = b('bipedal'		, {}) // Golett
mon[ 623 ] = b('bipedal'		, { heavy:1, }) // Golurk
mon[ 624 ] = b('bipedal'		, { blade:2, }) // Pawniard
mon[ 625 ] = b('bipedal'		, { blade:2, }) // Bisharp
mon[ 626 ] = b('quadruped'		, {}) // Bouffalant
mon[ 627 ] = b('wings'			, {}) // Rufflet
mon[ 628 ] = b('wings'			, {}) // Braviary
mon[ 629 ] = b('wings'			, {}) // Vullaby
mon[ 630 ] = b('wings'			, {}) // Mandibuzz
mon[ 631 ] = b('bipedal-tail' 	, {}) // Heatmor
mon[ 632 ] = b('insect'			, {}) // Durant
mon[ 633 ] = b('quadruped'		, {}) // Deino
mon[ 634 ] = b('quadruped'		, {}) // Zweilous
mon[ 635 ] = b('bipedal-tail' 	, {}) // Hydreigon
mon[ 636 ] = b('insect'			, {}) // Larvesta
mon[ 637 ] = b('wings'			, {}) // Volcarona
mon[ 638 ] = b('quadruped'		, {}) // Cobalion
mon[ 639 ] = b('quadruped'		, {}) // Terrakion
mon[ 640 ] = b('quadruped'		, {}) // Virizion
mon[ 641 ] = b('head-arms'		, {}) // Tornadus
mon[ 642 ] = b('head-arms'		, {}) // Thundurus
mon[ 643 ] = b('wings'			, {}) // Reshiram
mon[ 644 ] = b('bipedal-tail' 	, {}) // Zekrom
mon[ 645 ] = b('head-arms'		, {}) // Landorus
mon[ 646 ] = b('bipedal-tail' 	, {}) // Kyurem
mon[ 647 ] = b('quadruped'		, {}) // Keldeo
mon[ 648 ] = b('bipedal'		, {}) // Meloetta
mon[ 649 ] = b('bipedal'		, {}) // Genesect
mon[ 650 ] = b('bipedal-tail' 	, {}) // Chespin
mon[ 651 ] = b('bipedal-tail' 	, { shell:1, }) // Quilladin
mon[ 652 ] = b('bipedal-tail' 	, { shell:1, }) // Chesnaught
mon[ 653 ] = b('quadruped'		, {}) // Fennekin
mon[ 654 ] = b('bipedal-tail' 	, {}) // Braixen
mon[ 655 ] = b('bipedal-tail' 	, {}) // Delphox
mon[ 656 ] = b('quadruped'		, {}) // Froakie
mon[ 657 ] = b('bipedal'		, {}) // Frogadier
mon[ 658 ] = b('bipedal'		, {}) // Greninja
mon[ 659 ] = b('bipedal-tail' 	, {}) // Bunnelby
mon[ 660 ] = b('bipedal-tail' 	, {}) // Diggersby
mon[ 661 ] = b('wings'			, {}) // Fletchling
mon[ 662 ] = b('wings'			, {}) // Fletchinder
mon[ 663 ] = b('wings'			, {}) // Talonflame
mon[ 664 ] = b('insect'			, {}) // Scatterbug
mon[ 665 ] = b('head-base'		, {}) // Spewpa
mon[ 666 ] = b('wings'			, {}) // Vivillon
mon[ 667 ] = b('quadruped'		, {}) // Litleo
mon[ 668 ] = b('quadruped'		, {}) // Pyroar
mon[ 669 ] = b('head-arms'		, { levitate:1, }) // Flabébé
mon[ 670 ] = b('head-arms'		, { levitate:1, }) // Floette
mon[ 671 ] = b('head-arms'		, { levitate:1, }) // Florges
mon[ 672 ] = b('quadruped'		, {}) // Skiddo
mon[ 673 ] = b('quadruped'		, {}) // Gogoat
mon[ 674 ] = b('bipedal-tail' 	, {}) // Pancham
mon[ 675 ] = b('bipedal'		, {}) // Pangoro
mon[ 676 ] = b('quadruped'		, {}) // Furfrou
mon[ 677 ] = b('bipedal-tail' 	, {}) // Espurr
mon[ 678 ] = b('bipedal-tail' 	, {}) // Meowstic
mon[ 679 ] = b('head-base'		, { levitate:1, }) // Honedge
mon[ 680 ] = b('multi-body' 	, { levitate:1, }) // Doublade
mon[ 681 ] = b('head-base'		, { levitate:1, }) // Aegislash
mon[ 682 ] = b('head-arms'		, {}) // Spritzee
mon[ 683 ] = b('bipedal'		, {}) // Aromatisse
mon[ 684 ] = b('head-legs'		, {}) // Swirlix
mon[ 685 ] = b('bipedal'		, {}) // Slurpuff
mon[ 686 ] = b('tentacles'		, {}) // Inkay
mon[ 687 ] = b('head-base'		, {}) // Malamar
mon[ 688 ] = b('multi-body' 	, {}) // Binacle
mon[ 689 ] = b('multi-body' 	, {}) // Barbaracle
mon[ 690 ] = b('head-base'		, {}) // Skrelp
mon[ 691 ] = b('head-base'		, {}) // Dragalge
mon[ 692 ] = b('insect'			, {}) // Clauncher
mon[ 693 ] = b('serpentine' 	, {}) // Clawitzer
mon[ 694 ] = b('bipedal-tail' 	, {}) // Helioptile
mon[ 695 ] = b('bipedal-tail' 	, {}) // Heliolisk
mon[ 696 ] = b('bipedal-tail' 	, {}) // Tyrunt
mon[ 697 ] = b('bipedal-tail' 	, {}) // Tyrantrum
mon[ 698 ] = b('quadruped'		, {}) // Amaura
mon[ 699 ] = b('quadruped'		, {}) // Aurorus
mon[ 700 ] = b('quadruped'		, {}) // Sylveon
mon[ 701 ] = b('bipedal'		, {}) // Hawlucha
mon[ 702 ] = b('bipedal-tail' 	, { electricbody:1, }) // Dedenne
mon[ 703 ] = b('head-only'		, {}) // Carbink
mon[ 704 ] = b('serpentine' 	, {}) // Goomy
mon[ 705 ] = b('serpentine' 	, {}) // Sliggoo
mon[ 706 ] = b('bipedal-tail' 	, {}) // Goodra
mon[ 707 ] = b('head-only'		, { levitate:1, }) // Klefki
mon[ 708 ] = b('head-arms'		, {}) // Phantump
mon[ 709 ] = b('tentacles'		, {}) // Trevenant
mon[ 710 ] = b('head-only'		, {}) // Pumpkaboo
mon[ 711 ] = b('head-base'		, {}) // Gourgeist
mon[ 712 ] = b('quadruped'		, { tail:0, }) // Bergmite
mon[ 713 ] = b('quadruped'		, { tail:0, shell:1, }) // Avalugg
mon[ 714 ] = b('wings'			, {}) // Noibat
mon[ 715 ] = b('wings'			, {}) // Noivern
mon[ 716 ] = b('quadruped'		, {}) // Xerneas
mon[ 717 ] = b('wings'			, {}) // Yveltal
mon[ 718 ] = b('serpentine' 	, {}) // Zygarde
mon[ 719 ] = b('head-arms'		, {}) // Diancie
mon[ 720 ] = b('head-arms'		, {}) // Hoopa
mon[ 721 ] = b('quadruped'		, { shell:1, }) // Volcanion
mon[ 722 ] = b('wings'			, {}) // Rowlet
mon[ 723 ] = b('wings'			, {}) // Dartrix
mon[ 724 ] = b('wings'			, {}) // Decidueye
mon[ 725 ] = b('quadruped'		, {}) // Litten
mon[ 726 ] = b('quadruped'		, {}) // Torracat
mon[ 727 ] = b('bipedal-tail' 	, {}) // Incineroar
mon[ 728 ] = b('fins'			, {}) // Popplio
mon[ 729 ] = b('fins'			, {}) // Brionne
mon[ 730 ] = b('fins'			, {}) // Primarina
mon[ 731 ] = b('wings'			, {}) // Pikipek
mon[ 732 ] = b('wings'			, {}) // Trumbeak
mon[ 733 ] = b('wings'			, {}) // Toucannon
mon[ 734 ] = b('quadruped'		, {}) // Yungoos
mon[ 735 ] = b('quadruped'		, {}) // Gumshoos
mon[ 736 ] = b('insect'			, {}) // Grubbin
mon[ 737 ] = b('serpentine' 	, {}) // Charjabug
mon[ 738 ] = b('insect'			, { electricbody:1, shell:1, }) // Vikavolt
mon[ 739 ] = b('insect'			, { shell:1, }) // Crabrawler
mon[ 740 ] = b('insect'			, {}) // Crabominable
mon[ 741 ] = b('wings'			, {}) // Oricorio
mon[ 742 ] = b('insect'			, { wing:2, levitate:1, }) // Cutiefly
mon[ 743 ] = b('wings'			, {}) // Ribombee
mon[ 744 ] = b('quadruped'		, {}) // Rockruff
mon[ 745 ] = b('quadruped'		, {}) // Lycanroc
mon[ 746 ] = b('fins'			, {}) // Wishiwashi
mon[ 747 ] = b('head-base'		, {}) // Mareanie
mon[ 748 ] = b('tentacles'		, {}) // Toxapex
mon[ 749 ] = b('quadruped'		, {}) // Mudbray
mon[ 750 ] = b('quadruped'		, {}) // Mudsdale
mon[ 751 ] = b('head-legs'		, {}) // Dewpider
mon[ 752 ] = b('insect'			, {}) // Araquanid
mon[ 753 ] = b('bipedal-tail' 	, {}) // Fomantis
mon[ 754 ] = b('bipedal'		, {}) // Lurantis
mon[ 755 ] = b('head-base'		, {}) // Morelull
mon[ 756 ] = b('bipedal'		, {}) // Shiinotic
mon[ 757 ] = b('quadruped'		, {}) // Salandit
mon[ 758 ] = b('quadruped'		, {}) // Salazzle
mon[ 759 ] = b('quadruped'		, {}) // Stufful
mon[ 760 ] = b('bipedal-tail' 	, {}) // Bewear
mon[ 761 ] = b('head-legs'		, {}) // Bounsweet
mon[ 762 ] = b('bipedal'		, {}) // Steenee
mon[ 763 ] = b('bipedal'		, {}) // Tsareena
mon[ 764 ] = b('head-only'		, {}) // Comfey
mon[ 765 ] = b('bipedal'		, {}) // Oranguru
mon[ 766 ] = b('bipedal-tail' 	, {}) // Passimian
mon[ 767 ] = b('tentacles'		, {}) // Wimpod
mon[ 768 ] = b('bipedal'		, {}) // Golisopod
mon[ 769 ] = b('serpentine' 	, {}) // Sandygast
mon[ 770 ] = b('serpentine' 	, {}) // Palossand
mon[ 771 ] = b('serpentine' 	, {}) // Pyukumuku
mon[ 772 ] = b('quadruped'		, {}) // Type: Null
mon[ 773 ] = b('quadruped'		, {}) // Silvally
mon[ 774 ] = b('head-only'		, {}) // Minior
mon[ 775 ] = b('bipedal'		, {}) // Komala
mon[ 776 ] = b('bipedal-tail' 	, {}) // Turtonator
mon[ 777 ] = b('bipedal-tail' 	, {}) // Togedemaru
mon[ 778 ] = b('serpentine' 	, {}) // Mimikyu
mon[ 779 ] = b('fins'			, {}) // Bruxish
mon[ 780 ] = b('serpentine' 	, {}) // Drampa
mon[ 781 ] = b('head-base'		, {}) // Dhelmise
mon[ 782 ] = b('quadruped'		, {}) // Jangmo-o
mon[ 783 ] = b('bipedal-tail' 	, {}) // Hakamo-o
mon[ 784 ] = b('bipedal-tail' 	, {}) // Kommo-o
mon[ 785 ] = b('head-arms'		, {}) // Tapu Koko
mon[ 786 ] = b('head-arms'		, {}) // Tapu Lele
mon[ 787 ] = b('head-arms'		, {}) // Tapu Bulu
mon[ 788 ] = b('head-arms'		, {}) // Tapu Fini
mon[ 789 ] = b('head-only'		, {}) // Cosmog
mon[ 790 ] = b('head-only'		, { shell:1, }) // Cosmoem
mon[ 791 ] = b('quadruped'		, {}) // Solgaleo
mon[ 792 ] = b('wings'			, {}) // Lunala
mon[ 793 ] = b('tentacles'		, {}) // Nihilego
mon[ 794 ] = b('tentacles'		, {}) // Buzzwole
mon[ 795 ] = b('bipedal'		, {}) // Pheromosa
mon[ 796 ] = b('bipedal-tail' 	, {}) // Xurkitree
mon[ 797 ] = b('bipedal'		, {}) // Celesteela
mon[ 798 ] = b('bipedal'		, {}) // Kartana
mon[ 799 ] = b('bipedal-tail' 	, {}) // Guzzlord
mon[ 800 ] = b('head-arms'		, {}) // Necrozma
mon[ 801 ] = b('bipedal'		, {}) // Magearna
mon[ 802 ] = b('bipedal'		, {}) // Marshadow
mon[ 803 ] = b('bipedal-tail' 	, {}) // Poipole
mon[ 804 ] = b('wings'			, {}) // Naganadel
mon[ 805 ] = b('quadruped'		, { shell:1, }) // Stakataka
mon[ 806 ] = b('bipedal'		, {}) // Blacephalon
mon[ 807 ] = b('bipedal'		, {}) // Zeraora

module.exports = mon;