const { createDebugUrl } = require('./debugxml');

/*
0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
*/

let xml = `
<Ledger>
	<LedgerItem name="PokemonGained" imp="2" helps="catches">
		<pokemon key="mon" hash="893758743806978358469">
			<name nicknamed="false">Pikachu</name>
			<species id="25">Pikachu</species>
			<type A="Electric" B="Ground" />
			<gender>M</gender>
			<nature>Humble, likes chips</nature>
			<ability>Static</ability>
			<caughtIn>Pokeball</caughtIn>
			<hp>100</hp>
			<item id="65">Paralyze Heal</item>
			<move id="5" pp="30">Tackle</move>
			<move id="23" pp="25">Shadow Ball</move>
			<move id="846" pp="10">Sing</move>
			<move id="24" pp="20">Surf</move>
			<level>55</level>
			<storedIn>Party</storedIn>
			<shiny />
			<pokerus />
			<traded />
		</pokemon>
	</LedgerItem>
</Ledger>
<Ledger>
	<LedgerItem name="PokemonLost" imp="2" helps="catches">
		<pokemon key="mon" hash="893758743806978358469">
			<name nicknamed="false">Pikachu</name>
			<species id="25">Pikachu</species>
			<type A="Electric" B="Ground" />
			<gender>M</gender>
			<nature>Humble, likes chips</nature>
			<ability>Static</ability>
			<caughtIn>Pokeball</caughtIn>
			<hp>100</hp>
			<item id="65">Paralyze Heal</item>
			<move id="5" pp="30">Tackle</move>
			<move id="23" pp="25">Shadow Ball</move>
			<move id="846" pp="10">Sing</move>
			<move id="24" pp="20">Surf</move>
			<level>55</level>
			<storedIn>Party</storedIn>
			<shiny />
			<pokerus />
			<traded />
		</pokemon>
	</LedgerItem>
</Ledger>
`.replace(/[\n\t]/gi, '');

let url = createDebugUrl(xml);
console.log(url);
console.log(url.length+'/4096 = '+(url.length/4096));

//TODO: try a binary buffer and see how small that can be.
