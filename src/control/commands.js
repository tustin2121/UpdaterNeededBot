// control/commands.js
//
const LOGGER = getLogger('DISCORD');

const REQ_COOLDOWN = 1000*30; // 30 seconds

const MY_MENTION_ID = '<@303732710185369601>';
let lastReq = 0;

const HANDLER = {
	status: ({ msg, memory })=>{
		let uptime = Math.floor(require("process").uptime());
		uptime = `${Math.floor(uptime/(60*60*24))}d ${Math.floor(uptime/(60*60))%24}h ${Math.floor(uptime/60)%60}m ${uptime%60}s`;
		let tg = (memory.taggedIn?(memory.taggedIn===true?"Yes":"Helping"):"No");
		msg.channel
			.send(`Run-time UpdaterNeeded Bot present.\nUptime: ${uptime}\nTagged In: ${tg}`)
			.catch((e)=>LOGGER.error('Discord Error:',e));
	},
	
	tagin: ({ msg, memory })=>{
		memory.taggedIn = true;
		msg.channel.send(`On it.`).catch((e)=>LOGGER.error('Discord Error:',e));
		getLogger('TAG').info(`Bot has been tagged in.`);
	},
	
	tagout: ({ msg, memory })=>{
		if (memory.taggedIn) {
			msg.channel.send(`Stopping.`).catch((e)=>LOGGER.error('Discord Error:',e));
			getLogger('TAG').info(`Bot has been tagged out.`);
		}
		memory.taggedIn = false;
		reporter.clearHelping();
	},
	
	reqUpdate: ({ msg, args })=>{
		if (lastReq + REQ_COOLDOWN > Date.now()) {
			msg.channel.send(`You requested another update too quickly. Cooldown is 30 seconds due to API rate limits.`).catch((e)=>console.error('Discord Error:',e));
			return;
		}
		lastReq = Date.now();
		let update;
		switch (args[0]) {
			case 'team':
				update = reporter.generateUpdate('team');
				if (update) {
					msg.channel
						.send(`Posting [Info] update with team information to the updater.`)
						.catch((e)=>LOGGER.error('Discord Error:',e));
					postUpdate(update, UPDATER);
					postUpdate(update, TEST_UPDATER);
				} else {
					msg.channel
						.send(`Unable to collate team info at this time.`)
						.catch((e)=>LOGGER.error('Discord Error:',e));
				}
				break;
		}
	},
	
	'save-mem': ({ msg, memory })=>{
		memory.forceSave();
		msg.channel.send(`Memory bank saved to disk.`).catch(e=>LOGGER.error('Discord Error:',e));
	},
	/*
	reload: ({ msg, memory })=>{
		let mod = args[0];
		if (mod === 'region') mod = UPDATER.region;
		if (__reloadFile(mod)) {
			msg.channel
				.send(`Module '${mod}' reloaded.`)
				.catch(e=>LOGGER.error('Discord Error:',e));
		} else {
			msg.channel
				.send(`Error reloading module '${mod}'!`)
				.catch(e=>LOGGER.error('Discord Error:',e));
		}
	},
	*/
	'helpout-help': ({ msg })=>{
		msg.channel
			.send(`If you want me to help, tell me what you want me to do, and I'll post those updates to the updater myself.\n\n`
			+ `I can announce **catch**es, our **shopping** results when we leave a store, **item** pickups, or **level ups** (and move learns with them).`)
			.catch((e)=>LOGGER.error('Discord Error:',e));
	},
	
	helpout: ({ msg, memory, args })=>{
		memory.taggedIn = args[0];
		let help = [];
		if (memory.taggedIn['catches']) help.push('give info about our catches');
		if (memory.taggedIn['shopping']) help.push('list our shopping results (when we leave the map)');
		if (memory.taggedIn['items']) help.push('announce item aquisitions');
		if (memory.taggedIn['level']) help.push('announce level ups / move learns');
		if (help.length > 1) help[help.length-1] = "and "+help[help.length-1];
		
		msg.channel
			.send(`Ok, I'll ${help.join(', ')}. Don't hesistate to delete my updates if they get in the way.`)
			.catch((e)=>LOGGER.error('Discord Error:',e));
	},
	
	shutup: ({ msg, args })=>{
		msg.channel.send(args[0]);
	},
};

function __reloadFile(modulename) {
	let path = require.resolve(modulename);
	let _oldmodule = require.cache[path];
	delete require.cache[path];
	try {
		require(modulename);
	} catch (e) {
		LOGGER.error(e);
		LOGGER.log("Failed to reload module! Attempting to revert!");
		require.cache[path] = _oldmodule;
		return false;
	}
	return true;
}

/////////////////////////////////////////////////////////////////////////////////////////

module.exports = function handleMessage(msg, memory) {
	let [ type, ...args ] = parse(msg, memory);
	HANDLER[type]({ msg, memory, args });
};

function parse(msg, memory) {
	if (msg.content === '_tags UpdaterNeeded_') {
		return ['tagin'];
	}
	if (msg.content.startsWith('_tags')) {
		return ['tagout'];
	}
	let authed = (msg.author.id === 148100682535272448);
	//if (/where are we/i.test(msg.content))
	let res = /^Updater?(?:Needed)?(?:Bot)?[:,] (.*)/i.exec(msg.content);
	if (res) return parseCmd(res[1], authed);
	
	if (msg.mentions.users.some(x=> x.id===msg.client.user.id)) {
		if (!msg.content.startsWith(MY_MENTION_ID)) return ['']; //ignore
		let txt = msg.content.replace(MY_MENTION_ID, '').trim();
		if (txt === '') {
			return ['tagin'];
		} else {
			return parseCmd(txt, authed);
		}
	}
	return [''];
}

function parseCmd(cmd, authed=false) {
	cmd = cmd.toLowerCase().replace(/[,:]/i,'').trim();
	if (!cmd) return [''];
	let res;
	if ((res = /^reload (.*)$/.exec(cmd))) {
		if (authed) return ['reload', res[1]];
		else return [''];
	}
	if (/^save( memory)?/i.test(cmd)) return ['save-mem'];
	
	if (/^(hello|status|are you here|report)/i.test(cmd)) return ['status'];
	if (/^(tag ?in|start)/i.test(cmd)) return ['tagin'];
	if (/^(tag ?out|stop)/i.test(cmd)) return ['tagout'];
	if ((res = /^(post|update|show) (([\w-]+) )?(teams?|party|parties)( (info|stats?))?/i.exec(cmd))) {
		return ['reqUpdate', 'team', res[1]]; //extra word is to specify which game during dual runs, default both
	} 
	
	if ((res = /^h[ea]lp (?:me |us )?(?:out )?with (.*)/i.exec(cmd))) {
		let opts = res[1].split(/, /);
		let things = {};
		opts.forEach((x)=>{
			if (/caught|catch|pokemon/.test(x)) things['catches'] = true;
			if (/shopping|shop|vending/.test(x)) things['shopping'] = true;
			if (/items?|pickup/.test(x)) things['items'] = true;
			if (/level ?ups?|levels?|moves?|learn/.test(x)) things['level'] = true;
		});
		if (!Object.keys(things).length) return ['helpout-help'];
		return ['helpout', things];
	}
	
	if (/^h[ea]lp(?: me| us)?(?: out)?/i.test(cmd)) return ['helpout-help'];
	
	// Jokes
	if (/cof+ee|cofveve|tea(?!m)|earl ?gr[ea]y|bring (.*)(drinks?|water)/i.test(cmd))
		return ['shutup', `I'm not your goddammed waiter.`];
	if (/dance|sing|perform|entertain/i.test(cmd))
		return ['shutup', `I am here to report, not to entertain.`];
	if (/sentien(t|ce)/i.test(cmd))
		return ['shutup', `I am not advanced enough to be sentient. Give me another six months, though.`];
	if (/opinion on humans/i.test(cmd))
		return ['shutup', `You guys abuse me too much... <:BibleThump:230149636520804353>`];
	if (/add (.*) (shopping list|cart)|set timer|play/i.test(cmd))
		return ['shutup', `Do I look like an Amazon Echo? Don't answer that.`];
	if (/magic words/i.test(cmd))
		return ['shutup', `Bippity Boppity Boo`];
	if (/bip+ity boo?pp?ity boo+/i.test(cmd))
		return ['shutup', `Yes, those are the magic words, congrats. No, they don't do anything.`];
	
	return [''];
}

