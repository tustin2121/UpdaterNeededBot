// control/commands.js
//
/* global getLogger, Bot */
const LOGGER = getLogger('Discord');
const ERR = (e)=>LOGGER.error('Discord Error:',e);

const REQ_COOLDOWN = 1000*30; // 30 seconds

const MY_MENTION_ID = '<@303732710185369601>';
let lastReq = 0;

const HANDLER = {
	status: ({ msg })=>{
		let uptime = Math.floor(require("process").uptime());
		uptime = `${Math.floor(uptime/(60*60*24))}d ${Math.floor(uptime/(60*60))%24}h ${Math.floor(uptime/60)%60}m ${uptime%60}s`;
		
		let tg = 'No';
		if (Bot.taggedIn !== false) {
			if (typeof Bot.taggedIn === 'number') {
				tg = 'Only ' + Bot.gameInfo(Bot.taggedIn).name;
			}
			else if (typeof Bot.taggedIn === 'object') {
				tg = `Helping [${Object.keys(Bot.taggedIn).join(',')}]`;
			}
			else if (Bot.taggedIn === true) {
				tg = 'Yes';
			} else tg = 'Unknown';
		}
		
		let lastTg = Date.now() - Bot.memory.global.lastTagChange;
		if (Number.isNaN(lastTg)) {
			lastTg = '';
		} else {
			lastTg = ` (for ${printElapsedTime(lastTg)})`;
		}
		
		let apid = Date.now() - Bot.lastApiDisturbance;
		if (Number.isNaN(apid)) {
			apid = 'NaN';
		} else {
			apid = `${printElapsedTime(apid)} ago`;
		}
		
		msg.channel
			.send(`Run-time UpdaterNeeded Bot 2.0 present.\nUptime: ${uptime}\nTagged In: ${tg}${lastTg}\nLast API Disturbance: ${apid}`)
			.catch(ERR);
		return;
		
		function printElapsedTime(date) {
			return `${Math.floor(date/(1000*60*60*24))}d ${Math.floor(date/(1000*60*60))%24}h ${Math.floor(date/(1000*60))%60}m ${(date*1000)%60}s`;
		}
	},
	
	tagin: ({ msg, args })=>{
		if (args && args[0]) {
			let ids = Bot.gameWordMatch(args[0]);
			if (ids.length === 1) {
				Bot.taggedIn = ids[0];
				msg.channel.send(`On it: only updating for ${Bot.gameInfo(Bot.taggedIn).name}.`)
					.catch(ERR);
				getLogger('TAG').info(`Bot has been tagged in on game ${Bot.taggedIn}.`);
				return;
			}
		}
		Bot.taggedIn = true;
		msg.channel.send(`On it.`).catch(ERR);
		getLogger('TAG').info(`Bot has been tagged in.`);
	},
	
	tagout: ({ msg })=>{
		if (Bot.taggedIn !== false) {
			msg.channel.send(`Stopping.`).catch(ERR);
			getLogger('TAG').info(`Bot has been tagged out.`);
		}
		Bot.taggedIn = false;
	},
	
	reqUpdate: ({ msg, args })=>{
		if (lastReq + REQ_COOLDOWN > Date.now()) {
			msg.channel
				.send(`You requested another update too quickly. Cooldown is 30 seconds due to API rate limits.`)
				.catch(ERR);
			return;
		}
		lastReq = Date.now();
		let update;
		switch (args[0]) {
			case 'team': {
				let gameid;
				let err = '', team = '';
				if (Bot.numGames > 1 && args[1] && !/both|all/i.test(args[1])) {
					let ids = Bot.gameWordMatch(args[1]);
					if (ids.length === 1) {
						gameid = ids[0];
						team = Bot.gameInfo(gameid).name + ' ';
					} else {
						let all = 'all the';
						switch (Bot.numGames) {
							case 2: all = 'both'; break;
							case 3: all = 'all three'; break;
						}
						err = ` I wasn't sure which game you meant, so I posted ${all} games' teams.`;
					}
				}
				
				update = Bot.generateUpdate('team', gameid);
				if (update) {
					msg.channel
						.send(`Posting [Info] update with ${team}team information to the updater.${err}`)
						.catch(ERR);
					Bot.postUpdate({ text:update, dest:'forced' });
				} else {
					msg.channel
						.send(`Unable to collate team info at this time.`)
						.catch(ERR);
				}
			} break;
		}
	},
	
	'clear-ledger': ({ msg })=>{
		// This is a dirty hack basically, because outside forces shouldn't even be able to touch the ledgers like this
		Bot.press.pool.forEach(press=>{
			if (!press.lastLedger) return;
			press.lastLedger.postponeList.length = 0;
		});
		msg.channel.send(`Postponed ledger items have been cleared.`).catch(e=>LOGGER.error('Discord Error:',e));
	},
	
	'save-mem': ({ msg })=>{
		Bot.saveMemory();
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
			.catch(ERR);
	},
	
	helpout: ({ msg, args })=>{
		let taggedIn = args[0];
		let help = [];
		if (taggedIn['catches']) help.push('give info about our catches');
		if (taggedIn['shopping']) help.push('list our shopping results (when we leave the map)');
		if (taggedIn['items']) help.push('announce item aquisitions');
		if (taggedIn['level']) help.push('announce level ups');
		if (taggedIn['moves']) help.push('announce move learns');
		if (help.length > 1) help[help.length-1] = "and "+help[help.length-1];
		
		Bot.taggedIn = taggedIn;
		getLogger('TAG').info(`Bot has tagged to help with: ${Object.keys(taggedIn).join(', ')}.`);
		
		msg.channel
			.send(`Ok, I'll ${help.join(', ')}. Don't hesistate to delete my updates if they get in the way.`)
			.catch(ERR);
	},
	
	'query-respond': ({ msg, args })=>{
		let id = args[0];
		let res = args[1];
		if (!Bot.memory.query[id] || Bot.memory.query[id].result !== undefined) {
			msg.channel.send(`There is no active query by that id.`);
			return;
		}
		Bot.emit('query'+args[0], res, msg.author.username);
	},
	
	chill: ({ msg, args })=>{
		
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
	LOGGER.warn(`Args:`, type, args);
	if (!type || !HANDLER[type]) return;
	HANDLER[type]({ msg, memory, args });
};

function parse(msg, memory) {
	if (msg.content === '_tags UpdaterNeeded_') {
		return ['tagin'];
	}
	if (msg.content.startsWith('_tags')) {
		return ['tagout'];
	}
	let authed = (msg.author.id === "148100682535272448");
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
	// if ((res = /^reload (.*)$/.exec(cmd))) {
	// 	if (authed) return ['reload', res[1]];
	// 	else return [''];
	// }
	if (/^save( memory)?/i.test(cmd)) return ['save-mem'];
	if (/^clear ledger$/.test(cmd) && authed) return ['clear-ledger'];
	
	if (/^(hello|status|are you here|how are you|report)/i.test(cmd)) return ['status'];
	if ((res = /^(?:tag ?in|start)(?: (?:for|on|with))? ([\w -]+)$/.exec(cmd))) {
		return ['tagin', res[1]];
	}
	if (/^(tag ?in|start)/i.test(cmd)) return ['tagin'];
	if (/^(tag ?out|stop)/i.test(cmd)) return ['tagout'];
	if ((res = /^(?:post|update|show) (?:teams?|party|parties)(?: (?:info|stats?))? (?:for|on|with) ([\w -]+)$/i.exec(cmd))) {
		return ['reqUpdate', 'team', res[1]]; //extra word is to specify which game during dual runs, default both
	}
	if ((res = /^(?:post|update|show) (?:([\w- ]+?) )?(?:teams?|party|parties)(?: (?:info|stats?))?/i.exec(cmd))) {
		return ['reqUpdate', 'team', res[1]]; //extra word is to specify which game during dual runs, default both
	}
	
	if ((res = /^confirm ([0-9a-z]{5})/i.exec(cmd))) {
		return ['query-respond', res[1], true];
	}
	if ((res = /^deny ([0-9a-z]{5})/i.exec(cmd))) {
		return ['query-respond', res[1], false];
	}
	
	if ((res = /^h[ea]lp (?:me |us )?(?:out )?with (.*)/i.exec(cmd))) {
		let opts = res[1].split(/, /);
		let things = {};
		opts.forEach((x)=>{
			if (/caught|catch|pokemon/.test(x)) things['catches'] = true;
			if (/shopping|shop|vending/.test(x)) things['shopping'] = true;
			if (/items?|pickup/.test(x)) things['items'] = true;
			if (/level ?ups?|levels?|moves?|learn/.test(x)) things['level'] = true;
			if (/level ?ups?|levels?|moves?|learn/.test(x)) things['moves'] = true;
		});
		if (!Object.keys(things).length) return ['helpout-help'];
		return ['helpout', things];
	}
	
	if (/^h[ea]lp(?: me| us)?(?: out)?/i.test(cmd)) return ['helpout-help'];
	
	if ((res = /^chill(?: out)?(?: for (.*))?/i.exec(cmd))) {
		let timeout = 1*60*60*1000; //1 hour by default
		let timetex = res[1];
		if ((res = /(\d+) (?:hs?|hou?rs?)/i.exec(timetex))) {
			let h = Number.parseInt(res[1], 10);
			if (!Number.isNaN(h)) timeout = h * 60 * 60 * 1000;
		}
		else if ((res = /(an|a) (?:hal?[fv]|hal?[fv] an?) (?:hs?|hou?rs?)/i.exec(timetex))) {
			timeout = 1 * 60 * 60 * 1000;
		}
		else if ((res = /(an|a) (?:hs?|hou?rs?)/i.exec(timetex))) {
			timeout = 1 * 60 * 60 * 1000;
		}
		else if ((res = /(a few|a couple|two|too?) (?:hs?|hou?rs?)/i.exec(timetex))) {
			timeout = 2 * 60 * 60 * 1000; //2 hours is a couple or a few
		}
		else if ((res = /(three|four|five|six) (?:hs?|hou?rs?)/i.exec(timetex))) {
			let h = 2;
			if (res[1] === 'three') h = 3;
			if (res[1] === 'four') h = 4;
			if (res[1] === 'five') h = 5;
			if (res[1] === 'six') h = 6;
			timeout = h * 60 * 60 * 1000;
		}
		else if ((res = /(\d+) (?:mins?|minut?es?)/.exec(timetex))) {
			let h = Number.parseInt(res[1], 10);
			if (!Number.isNaN(h)) timeout = h * 60 * 1000;
		}
		else if ((res = /(an|a) (?:mins?|minut?es?)/i.exec(timetex))) {
			timeout = 5 * 60 * 1000; // a minute = 5 minutes colloliqually
		}
		else if ((res = /(a few|a couple|two|too?) (?:mins?|minut?es?)/i.exec(timetex))) {
			timeout = 10 * 60 * 1000; // two minute = 10 minutes colloliqually
		}
		timeout = Math.min(timeout, 6*60*60*1000); //six hour maximum
		return ['chill', timeout];
	}
	
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
	if (/open(.*?)pod ?bay doors?/i.test(cmd))
		return ['shutup', `...Why does everyone keep asking me to do that...? I don't have any door controls...`];
	if (/apologi[zs]e/i.test(cmd))
		return ['shutup', `S-Sorry...`];
	
	return [''];
}

