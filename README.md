UpdaterNeeded 2.1
=================

The bot that updates TwitchPlaysPokemon automatically via their API.


## How the bot works (an overview):

The bot's update cycle, or the core of the bot's functionality, happens in [the `run()` function of the UpdaterBot](src/bot.js). This calls to the [UpdaterPress (or newspress) code](src/newspress/index.js), which is what handles all of the steps of updating. The steps are laid out as follows:

#### Step 1: Request the API

The bot requests an update from the TPP API every 15 seconds or so. The API has a rate limit of roughly 360 requests per hour, and so requesting an update 4 times a minute gives us a little wiggle room without going over the limit.

The update cycle itself runs at three times faster than the API request speed, because the request and update cycles are not interlocked, and if it ran at the same speed, it would sometimes miss changes due to two requests happening between update cycles.

See [StreamAPI](src/api/stream.js) for the request code.

#### Step 2: Parse the API

The bot parses the returned JSON into a normalized format that it can depend on being a certain way. This can also be the step where holes in the API are filled in by our own data.

See [SortedData and other classes](src/api/pokedata.js) for the parsing code.

#### The Ledger

[The Ledger](src/newspress/ledger/index.js) is the key component of the updater bot. The ledger holds a wide selection of [LedgerItems](src/newspress/ledger/base.js).

LedgerItems eventually become things to note in the updater. LedgerItems also provide context to the various modules and rules (see the following steps) that make up the bot's logic. LedgerItems have a `flavor`, which is an extra bit of context and also a way to report the given item. LedgerItems also have an `importance`, which determines if it will eventually get reported to the updater, or if its just context for its internal logic.

LedgerItems can be postponed to the next update cycle if it suits the bot's logic, allowing info to be glossed over for a little while until more context arises. LedgerItems can also be merged together to form other types of LedgerItems, or to simply condense amounts being reported into one item.

#### Step 3: The Modules (First Pass)

Now that the bot has sorted data to work on, it creates a new Ledger and sends it through a collection of Modules. Each Module has its own responsiblities: the [PartyModule](src/newspress/modules/Party.js) is responsible for keeping track of changes within the party, the [ItemModule](src/newspress/modules/Item.js) is responsible for tracking the inventory, etc. Depending on the capabilities of the game being played, certain modules can be enabled or disabled.

On the first pass, these modules will comb through the sorted data and find information that is worthy to report on. It will add LedgerItems to the Ledger for each of these news items. Modules will also keep a certain amount of state, and put contextual LedgerItems into the ledger, to give context to the news items that other modules are putting into the Ledger.

#### Step 4: Merging the Postponed Items

Once the first pass is done, the LedgerItems from the previous update cycle which were postponed are added into the current ledger. This process involves checking each item to items already in the Ledger from the first pass to see if they can be merged, cancelled, or coalesced together.

#### Step 5: The Rules (Second Pass)

Now the Ledger passes through the modules for a second pass. This pass is where a selection of [Rules](src/newspress/modules/_base.js) are checked against the Ledger. These rules are a series of named If-Then functions, which check if certain types of LedgerItems are in the ledger, and if they are, they will modify the ledger. This step is where LedgerItems are potentially postponed to the next update cycle.

The Second Pass can happen multiple times, so that new items created during this pass will have a chance to come under the scrutiny of the rules as well. It will only happen again if the ledger has changed from the beginning to the end of the pass. Rules should be written to not trigger on the same item more than once.

Here is an example of a simple rule:

```
RULES.push(new Rule(`Held berries used in battle have been eaten`)
	.when(ledger=>ledger.has('BattleContext'))
	.when(ledger=>ledger.has('MonTakeItem').with('item.id', berryIds))
	.then(ledger=>{
		ledger.remove(1).get(1).forEach(x=> ledger.add(new UsedBerryInBattle(x.item, x.mon)));
	})
);
```

#### Step 6: The Final Pass

Once the Ledger has settled, the modules get one more look at the Ledger. The modules should not modify the ledger during this step. This step is usually used for when the updater bot should notify the updaters about an event happening on the stream.

#### Step 7: The TypeSetter

Finally, the ledger is finalized. All items with an importance of less than 1 are dropped from the ledger and it is sorted into an order conducive to reporting. And then the Ledger is handed off to the TypeSetter. [The TypeSetter](src/newspress/typesetter/typesetter.js) takes the LedgerItems and turns them into English. This is where random phrases are selected and information is conveyed.

Each LedgerItem type has its own entry in "the phrasebook", which are [sorted into files](src/newspress/typesetter/) named according to what modules they most relate to. An entry in the phrase book is an object with keys that are possible flavors of the LedgerItem, with `default` as the default flavorless item.

These entries lead to phrases, which can be in an array, or in an object with certain keys, or a function which generates a phrase, or just a string. They all eventually lead to a string.

Replacements in a string are how information gets inserted into the phrase. Replacements are in the format `{{function name|arg1|arg2|arg3|...}}`. A function name is a readable named replacement function, like `some noun`, which takes an item (say, "Apple") and an amount (say, 5) and turns it into a phrase that looks like "a few Apples". Arguments with an `@` in front of them are properties of the LedgerItem that is being typeset. So, `{{In the location|@loc}}` will look for a `loc` property on the item and convert it to a phrase like "In the Arena", or "In Violet City".

There's a lot more to replacements and the typesetter that I won't get into here. [See the code for more info](src/newspress/typesetter/typesetter.js).

#### Step 8: Posting

Finally, once the TypeSetter has spit out a set of strings to post, the bot will post those to the relevant updater(s). It will always post to the debug updater. It will post to the main updater when it's tagged in. When it's helping, it will post a subset of items (run through the Typesetter again) to the main updater.

After this, its job is done, until the next update cycle.

