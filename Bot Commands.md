# UpdaterNeeded Bot Help

Hello! I am UpdaterNeeded. I'm here to help you with your updating job!

If I'm updating, feel free to tag in and take over updating duties at any time! Just use:

	/me tags <Your Username>

And I'll stop updating and let you update!

If you're done updating, see if anyone else is available to update first. If no one responds, I can take back over for you. Just use:

	/me tags UpdaterNeeded

And I'll start updating again!

## Commands

If you need to address me, just address me as "Updater" or "UpdaterNeededBot" or "UpdaterBot" (case doesn't matter), and use a comma or colon after my name. If I understand your command, I'll respond. Here's some of my commands:

----

	updater, post team

If you want me to post the status of our current team to the updater, just issue me this command. I'll post the whole team's name, levels, and status, complete with a hover-over expanded view of everyone's stats and moves. [It'll look like this!](https://www.reddit.com/live/111mqavwa498g/updates/6d152688-7105-11e8-b804-0e16ca3916ee)

During a dual run, using this command will post teams for both games unless you specify which game you want me to post for: `updater, post blue team`

----

	updater, help me with ...

If you want me to help you with your updating, tell me what you want me to help with and I'll help you out! I'll post specific updates to the updater depending on what you want help with. I can help with:

* **catch**es - I will post any new pokemon we catch, with hover-over information. My updates will [look like this](https://www.reddit.com/live/111mqavwa498g/updates/b2aa9ec8-727f-11e8-b51c-0ec67d3ce33e). (*NOTE: Depending on how slow the API is, it may take several minutes for me to see a new catch. Don't worry too much if it looks like I missed a catch; it'll appear eventually.*)
* **shopping** - When we buy things from the market, I will list everything we bought and sold after we leave the market. My updates will [look like this](#). (*NOTE: **DOES NOT CURRENTLY WORK**; please refer to the Off-Duty Updater for help with shopping trips for the time being.*)
* **item** pickups - I will post any new items we pick up. My updates will [look like this](https://www.reddit.com/live/111mqavwa498g/updates/66ecf4a8-723f-11e8-bfeb-0ed29bbad770).
* **level ups** and **move** learns - I will report when a Pokemon in our party levels up and learns a new move! My updates will [look like this](https://www.reddit.com/live/111mqavwa498g/updates/b7e8f5da-7246-11e8-8096-0ea0b8265a10) and [like this](https://www.reddit.com/live/111mqavwa498g/updates/49e880de-7190-11e8-9b17-0e2478d0a364).

I can do more than one of these at a time if you wish. Just list them all in your request: `updater, help me with catches and level ups`

--------

	updater, turn on option
	updater, turn off option

I have a couple of options that you guys can turn on and off, if I get bothersome or if I'm not doing something right. 

* **battle pings** - By default, I will notify the live updaters if there's an important battle that's started on stream, like a rival battle or a gym battle. If the chat are causing too many of these pings needlessly (like if they're using one of these battles to grind), you can turn these off. Remember to turn them back on, though!
* **badge alerts** - I will also list make note in the discord channel when we've gotten a new badge, so an announcement can be made. If I start spamming these for whatever reason (usually the API is going haywire), these can be turned off too.
* **temporary party alerts** - I will note when I think we've gained a temporary party, just to let you know why I'm not reporting things like level ups and move learns. This could get spammy if the chat decides to play around in the Battle Tent.
* **missing pokemon queries** - If a pokemon is suddenly missing from the API, I can only assume it has been released. But I will attempt to confirm with the updaters if that pokemon has gone missing before I report its release. I'll ask this even if I'm tagged out, for my own bookkeeping and for the purposes of alerting the current updater if they're not sure. It's advised not to turn off these queries, but if the chat is on a release spree and someone's already handling things, it might be best to shut me up about this for a while.
* **trade watch** - Trying to determine when we've traded away a pokemon can be confusing for me, so I don't do it by default. Since we normally don't have the ability to trade, this is usually fine. But if we get the ability to trade at any point, you'll want to turn this on.
* **democracy** - I can add the standard `[D]` to my updates to indicate democracy. If I'm watching chat (***Not Yet Implemented***) I can determine when deomcracy is happening for myself by watching for what TPP bot says. But if I get it wrong or I'm not connected to chat, you can turn this on and off manually.

-----

	updater, tag in
	updater, tag out

If you want me to update, but you don't want to officially tag me in, you can use these commands. I'll act like I'm tagged in (or tagged out), but you'll skip telling TPP bot this.

Some people like to update around me, deleting my updates where they've already reported the information, but keeping my information where it makes sense. Feel free to tag yourself in, and use these commands to tell me to update too, if that's what you want to do!

During a dual run, you can use this to tag me in for one game while you update the other: `updater, tag in for red`

------

	updater, confirm #####
	updater, deny #####

Sometimes I might have questions about what's happening on stream when I can't determine it myself. If I do, I might ask the discord chat about it, and I'll tell you how to confirm or deny my assumptions. It'll be with either of these commands and a number I'll give you that corresponds with the given question. 

Most of the the time, the questions will be about if a pokemon has been released, because sometimes a pokemon vanishing from the API doesn't mean it's been released forever, and there's no way for me to know for sure without asking.

------

	updater, reboot please

This command is reserved for mods. If for some reason my updates aren't posting to the discord live updater channel, a reboot will usually solve the problem.