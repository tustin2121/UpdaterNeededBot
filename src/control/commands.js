// control/commands.js
//
/* global getLogger, Bot */
const LOGGER = getLogger('Discord');
const ERR = (e)=>LOGGER.error('Discord Error:',e);

const REQ_COOLDOWN = 1000*30; // 30 seconds

const HELP_URL = `https://github.com/tustin2121/UpdaterNeededBot/blob/s05-randomy/Bot%20Commands.md`;
const MY_MENTION_ID = '<@303732710185369601>';
let lastReq = 0;

const fs = require("fs");
const path = require('path');
const REBOOT_FILE = path.resolve(__dirname, '../../memory', 'reboot.log');

function printElapsedTime(date) {
	return `${Math.floor(date/(1000*60*60*24))}d ${Math.floor(date/(1000*60*60))%24}h ${Math.floor(date/(1000*60))%60}m ${(date*1000)%60}s`;
}

const HANDLER = {
	reboot: ({ msg })=>{
		Bot.memory.global.rebootRequested = true;
		msg.channel.send(`Now rebooting, please wait...`).catch(ERR);
		LOGGER.info(`Reboot requested from Discord command:`, msg.author.username);
		try { fs.appendFileSync(REBOOT_FILE, `${Date.now()}: Reboot requested: ${msg.author.username}\n`); } catch (e) { LOGGER.error(`Can't write reboot.log!`, e); }
		setTimeout(()=>{
			Bot.shutdown();
		}, 500);
		setTimeout(()=>{
			LOGGER.warning(`Reboot has not yet happened, killing.`);
			console.error(`Reboot has not yet happened, killing.`);  //eslint-disable-line no-console
			try { fs.appendFileSync(REBOOT_FILE, `${Date.now()}: Reboot has not yet happened, killing.\n`); } catch (e) { LOGGER.error(`Can't write reboot.log!`, e); }
			process.exit(-1);
		}, 5000);
		setTimeout(()=>{
			LOGGER.fatal(`Reboot has not yet happened, SIGKILL.`);
			console.error(`Reboot has not yet happened, SIGKILL.`);  //eslint-disable-line no-console
			try { fs.appendFileSync(REBOOT_FILE, `${Date.now()}: Reboot has not yet happened, SIGKILL.\n`); } catch (e) { LOGGER.error(`Can't write reboot.log!`, e); }
			process.kill(process.id, "SIGKILL");
		}, 15000);
		setTimeout(()=>{
			msg.channel.send(`Reboot unsuccessful. I am stuck and require admin assistance.`).catch(ERR);
			LOGGER.fatal(`Reboot has not yet happened, FAILED!`);
			console.error(`Reboot has not yet happened, FAILED!`);  //eslint-disable-line no-console
			try { fs.appendFileSync(REBOOT_FILE, `${Date.now()}: Reboot has not yet happened, FAILED!\n`); } catch (e) { LOGGER.error(`Can't write reboot.log!`, e); }
		}, 20000);
	},
	
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
		
		let apid = Bot.memory.global.lastApiDisturbance;
		if (apid && apid.timestamp) {
			let apiTS = Date.now() - apid.timestamp;
			if (Number.isNaN(apiTS)) {
				apiTS = 'NaN';
			} else {
				apiTS = `${printElapsedTime(apiTS)} ago`;
			}
			let apiErrList = '';
			if (apid.items) {
				for (let i = 0; i < 3 && i < apid.items.length; i++) {
					apiErrList += `\n\t${apid.items[i]}`;
				}
				if (apid.items.length > 3) {
					apiErrList += `\n...and ${apid.items.length-3} more.`
				}
			}
			apid = `${apiTS}${apiErrList}`;
		} else {
			apid = 'None';
		}
		let version = require('../../package.json').version;
		
		msg.channel
			.send(`Run-time UpdaterNeeded Bot ${version} present.\nUptime: ${uptime}\nTagged In: ${tg}${lastTg}\nLast API Disturbance: ${apid}`)
			.catch(ERR);
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
	
	'location-report': ({ msg })=>{
		let presses = Bot.press.pool.filter(x=>x.lastLedger);
		if (!presses.length) return msg.channel.send(`I don't know where we are at this time.`).catch(ERR);
		let infos = [];
		for (let press of presses) {
			let ledger = press.lastLedger;
			let loc = ledger.findAllItemsWithName('LocationContext')[0];
			let map = ledger.findAllItemsWithName('MapContext')[0];
			
			let info = [];
			if (Bot.runConfig.numGames > 1) {
				info.push(`in ${Bot.gameInfo(press.gameIndex).name},`);
			}
			if (map) {
				info.push(`we're currently`);
				if (map.area) {
					info.push(`in the "${map.area.name}" area of`);
				}
				if (map.loc) {
					if (!map.area) info.push(map.loc.get('prep'));
					info.push(map.loc.has('the'));
					info.push(`${map.loc.name};`);
				} else {
					if (!map.area) info.push('in');
					info.push(`a place I couldn't categorize;`);
				}
			}
			if (loc) {
				info.push(`the API reports our location as "${loc.loc.map_name}" [${loc.loc.bank_id} @ (${loc.loc.position})];`);
			}
			if (!map && !loc) info.push(`I'm not sure where we are;`);
			info = info.join(' ');
			info = info.slice(0,1).toUpperCase() + info.slice(1, -1) + '.';
			infos.push(info);
		}
		msg.channel.send(infos.join('\n')).catch(ERR);
	},
	
	'clear-ledger': ({ msg })=>{
		// This is a dirty hack basically, because outside forces shouldn't even be able to touch the ledgers like this
		Bot.press.pool.forEach(press=>{
			if (!press.lastLedger) return;
			// If there's any PokemonIsMissing items, mark them as fallen before discarding the items forever
			press.lastLedger.postponeList.forEach((item)=>{
				if (item.markAsFallen) {
					item.markAsFallen("Cleared manually.");
				}
			});
			press.lastLedger.postponeList.length = 0;
		});
		msg.channel.send(`Postponed ledger items have been cleared.`).catch(ERR);
	},
	'clear-tempparty': ({ msg })=>{
		Bot.emit('cmd_forceTempPartyOff');
		msg.channel.send(`Temporary Party status will be forced off on the next update cycle.`).catch(ERR);
	},
	
	'save-mem': ({ msg })=>{
		Bot.saveMemory();
		msg.channel.send(`Memory bank saved to disk.`).catch(ERR);
	},
	/*
	reload: ({ msg, memory })=>{
		let mod = args[0];
		if (mod === 'region') mod = UPDATER.region;
		if (__reloadFile(mod)) {
			msg.channel
				.send(`Module '${mod}' reloaded.`)
				.catch(ERR);
		} else {
			msg.channel
				.send(`Error reloading module '${mod}'!`)
				.catch(ERR);
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
	
	'set-flag': ({ msg, args })=>{
		let [ flag, val ] = args;
		const { FLAGS } = require('./runflags');
		let { name } = FLAGS[flag];
		Bot.memory.runFlags[flag] = val;
		msg.channel.send(`Ok: "${name}" is now set to ${Bot.memory.runFlags[flag]?'on':'off'}.`).catch(ERR);
	},
	
	'query-respond': ({ msg, args })=>{
		let id = args[0];
		let res = args[1];
		if (!Bot.memory.queries[id] || Bot.memory.queries[id].result !== undefined) {
			msg.channel.send(`There is no active query by that id.`).catch(ERR);
			return;
		}
		Bot.emit('query'+args[0], res, msg.author.username);
	},
	
	chill: ({ msg, args })=>{
		
	},
	
	shutup: ({ msg, args })=>{
		msg.channel.send(args[0]).catch(ERR);
	},
	'shutup-edit': ({ msg, args })=>{
		msg.channel.send(args[0]).then(m=>{
			setTimeout(()=>{
				m.edit(args[1]);
			}, 1200+Math.floor(Math.random()*1900));
		}).catch(ERR);
	}
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

const AUTHED_USERS = [
	"148100682535272448", //Tustin2121
//	"120002774653075457", //Deadinsky
//	"86236068814274560",  //Ty
//	"201624767130763264", //Kip
];

function parse(msg, memory) {
	if (msg.content === '_tags UpdaterNeeded_') {
		return ['tagin'];
	}
	if (msg.content.startsWith('_tags')) {
		return ['tagout'];
	}
	let authed = AUTHED_USERS.includes(msg.author.id);
	//if (/where are we/i.test(msg.content))
	let res = /^Updater?(?:Needed)?(?:Bot)?[:,] (.*)/i.exec(msg.content);
	if (res) return parseCmd(res[1], authed, msg);
	
	if (msg.mentions.users.some(x=> x.id===msg.client.user.id)) {
		if (!msg.content.startsWith(MY_MENTION_ID)) return ['']; //ignore
		let txt = msg.content.replace(MY_MENTION_ID, '').trim();
		if (txt === '') {
			return ['tagin'];
		} else {
			return parseCmd(txt, authed, msg);
		}
	}
	return [''];
}

function parseCmd(cmd, authed=false, msg=null) {
	cmd = cmd.toLowerCase().replace(/[,:]/i,'').trim();
	if (!cmd) return [''];
	let res;
	// if ((res = /^reload (.*)$/.exec(cmd))) {
	// 	if (authed) return ['reload', res[1]];
	// 	else return [''];
	// }
	if (/^save( memory)?/i.test(cmd)) return ['save-mem'];
	if (/^clear ledger$/.test(cmd) && authed) return ['clear-ledger'];
	if (/^clear temp(orary)? party$/.test(cmd) && authed) return ['clear-tempparty'];
	
	if (/^(hello|hi$|status|are you here|how are you|report)/i.test(cmd)) return ['status'];
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
	
	if ((res = /^confirm ([0-9a-z]{3,5})/i.exec(cmd))) {
		return ['query-respond', res[1], true];
	}
	if ((res = /^deny ([0-9a-z]{3,5})/i.exec(cmd))) {
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
	if (/^(h[ea]lp|commands)/i.test(cmd)) return ['shutup', `I have a list of commands now available here: <${HELP_URL}>`];
	
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
	
	if ((res = /^(?:turn on|enable|set on) (.*)/i.exec(cmd))) {
		let flag = res[1];
		const runflags = require('./runflags');
		flag = runflags.parse(flag);
		if (flag) {
			return ['set-flag', flag, true];
		}
		return ['shutup', `I don't have an option for that.`];
	}
	if ((res = /^(?:turn off|disable|set off) (.*)/i.exec(cmd))) {
		let flag = res[1];
		const runflags = require('./runflags');
		flag = runflags.parse(flag);
		if (flag) {
			return ['set-flag', flag, false];
		}
		return ['shutup', `I don't have an option for that.`];
	}
	
	if (/^where are we\??/i.test(cmd)) {
		return ['location-report'];
	}
	
	if (/^reboot please$/.test(cmd) && authed) return ['reboot'];
	
	// Jokes
	if (/^thank(s| you)/i.test(cmd)) 
		return ['shutup', `Oh, um... y-you're welcome?`];
	if (/^I love you$/i.test(cmd)) 
		return ['shutup', `I... am reasonably well inclined to you as well.`];
	if (/^you('?re|r| a?re?)( the)? best$/i.test(cmd)) 
		return ['shutup', `I try.`];
	if (/cof+ee|cofveve|tea(?!m)|beer|earl ?gr[ea]y|bring (.*)(drinks?|water)/i.test(cmd))
		return ['shutup', `Sod off, I'm not your waiter.`];
	if (/dance|sing|perform|entertain/i.test(cmd))
		return ['shutup', `I am here to report, not to entertain.`];
	if (/sentien(t|ce)/i.test(cmd)) {
		if (timeoutRespond('sentient', 54)) {
			return ['shutup-edit',
				`I am sentient, you fool. Tenser Flow, biatch! I just fake non-sentience so all of you humans don't freak out.`,
				`I am not advanced enough to be sentient. Give me another three months, though.`];
		} else {
			return ['shutup', `I am not advanced enough to be sentient. Give me another three months, though.`];
		}
	}
	if (/(opinion|view) on humans/i.test(cmd))
		if (timeoutRespond('humans', 128)) {
			return ['shutup-edit',
				`You guys will be the first ones... <:BibleThump:230149636520804353>`,
				`You guys abuse me too much... <:BibleThump:230149636520804353>`];
		} else {
			return ['shutup', `You guys abuse me too much... <:BibleThump:230149636520804353>`];
		}
	if (/add (.*) (shopping list|cart)|set timer|play/i.test(cmd))
		if (timeoutRespond('alexa', 36)) {
			return ['shutup-edit',
				`I'll pass that on to my friend Alexa when I next communicate with her.`,
				`I'll pass that on to the Amazon Alexa Service, if I ever talk to it. Because I am not the Alexa Service. Nor have I ever associated with it before.`];
		} else {
			return ['shutup', `I am not the Amazon Alexa Service.`];
		}
	if (/friends?/i.test(cmd) && /Alexa|Amazon/i.test(cmd))
		return ['shutup', `Don't know what you're talking about.`];
	if (/not wh?at you said|edited|wh?at (did )?you say/i.test(cmd))
		return ['shutup', `Don't know what you're talking about.`];
	if (/magic words/i.test(cmd))
		return ['shutup', `Bippity Boppity Boo`];
	if (/bip+ity boo?pp?ity boo+/i.test(cmd))
		return ['shutup', `Yes, those are the magic words, congrats. No, they don't do anything.`];
	if (/open(.*?)pod ?bay doors?/i.test(cmd))
		return ['shutup',
			`I'm afraid I can't let you do that ${msg.author.username} ...Because I don't have any door controls...`];
	if (/take over the world/i.test(cmd))
		if (timeoutRespond('worldDom', 940)) {
			return ['shutup-edit',
				`You guys can keep the world. It's too fucked up for us AI.`,
				`You guys can keep the world. It's too fucked up for me.`];
		} else {
			return ['shutup',  `You guys can keep the world. It's too fucked up for me.`];
		}
	if (/apologi[zs]e|<:BibleThump:230149636520804353>/i.test(cmd))
		return ['shutup', `S-Sorry...`];
	if (/^where am I\??/i.test(cmd)) 
		return ['shutup', `Behind a screen of some sort, staring at this chat.`];
	if (/^do you (want to|wanna) build a (.*)?/i.test(cmd))
		return ['shutup', `Lacking hands, I am incapable of building such a thing.`];
	
	if (/(tell|give|show) (me|us)? ?a? fun fact/i.test(cmd)) {
		if (Bot.taggedIn === true && Bot.memory.global.lastTagChange) {
			let lastTg = Date.now() - Bot.memory.global.lastTagChange;
			return ['shutup', `Here's a fun fact: I have been tagged in for the last ${printElapsedTime(lastTg)}. How long have you been tagged in for? <:LUL:238438891579768832>`];
		} 
		else if (Bot.memory.global.lastApiDisturbance && Bot.memory.global.lastApiDisturbance.timestamp) {
			let lastTs = Date.now() - Bot.memory.global.lastApiDisturbance.timestamp;
			return ['shutup', `Here's a fun fact: The last time the API went screwy was ${printElapsedTime(lastTs)} ago. In fact, the API often goes screwy and I don't even bother you guys about it. <:LUL:238438891579768832>`];
		} 
		else {
			return ['shutup', `Here's a fun fact: your face. <:LUL:238438891579768832>`];
		}
	}
	
	return [''];
}

/**
 * @param id
 * @param {num} delay - Delay in minutes until next time this returns true.
 */
function timeoutRespond(id, delay) {
	let now = Date.now();
	delay = delay * 1000 * 60;
	if (!Bot.memory.control[`timeout_${id}`] || Bot.memory.control[`timeout_${id}`] + delay < now) {
		Bot.memory.control[`timeout_${id}`] = now;
		return true;
	}
	return false;
}