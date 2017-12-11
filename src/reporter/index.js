// reporter/index.js
// The heart of the update reporter system

/*
- Modules work like this:
	- The API is parsed and normalized. The chat is also collected and filtered.
	- The normalized API and chat info are passed through all of the modules' first pass, where
	  the modules discover things independently of one another. As the modules discover items,
	  all of their discoveries are logged in a "ledger".
		- This ledger is a single update item, like "lost 1 [item]", and "moved to [location]".
		  Each update item has an importance, nominally 1. Items of little importance have 0, and
		  items of high importance (like gym battles) are 2.
	- This ledger is now passed through the modules again on a second pass, where modules
	  apply a list of rules to the ledger to reduce its size.
		- These rules turn simple update items into more complex update items.
		  Like "lost 1 Hard Stone" and "Onix item changed from null to Hard Stone" into
		  "Gave Onix a Hard Stone to hold". Or "lost 1 pokeball" and "in a wild battle with Aipom"
		  into "threw 1 pokeball at a wild Aipom".
		- This second pass happens multiple times, until the ledger changes size no more,
		  min 2 passes, max 10 passes.
	- This ledger is now sorted on importance and reporting order, and items with importance
	  lower than 1 are dropped.
	- This ledger goes to the Typesetter now, which turns all of the items into elequent english,
	  and will then post it to updating mediums.
		- The Typesetter will choose from a randomized list of phrases for each item type, and
		  plug in variables as needed.
		- The Typesetter is also responsible for formatting for Reddit or Discord, using rich
		  embeds for the latter case.
*/

