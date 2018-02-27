
/* eslint-disable no-console */
global.getLogger = require('../../src/logging');
global.Bot = {
	runConfig: {
		run: {
			controlChannel: '412122002162188289',
			controlRole: '148087914360864768',
		}
	}
};

const Discord = require("discord.js");
const LOGGER = getLogger('QueryTest');

if (typeof chrome !== 'undefined') {
	chrome.developerPrivate.openDevTools({
	    renderViewId: -1,
	    renderProcessId: -1,
	    extensionId: chrome.runtime.id
	})
}
try {
	require('nw.gui').Window.get().showDevTools()
} catch (e) {
	LOGGER.error('No nw.gui');
}

let staff = global.staff = require('../../src/control');

const EMOJI_CONFIRM = '\u2705'; //':white_check_mark:';
const EMOJI_DENY = '\u274E'; //':negative_squared_cross_mark:';

staff.isReady().then(()=>{
	const staffChannel = staff.dbot.channels.get(Bot.runConfig.run.controlChannel);

	const filter = (reaction, user)=> {
		if (user.id === staff.dbot.user.id) return false;
		if (Bot.runConfig.run.controlRole) {
			let guild = reaction.message.guild;
			let member = guild.members.get(user.id);
			if (!member || !member.roles.has(Bot.runConfig.run.controlRole)) return false;
		}
		if (reaction.emoji.name === EMOJI_CONFIRM) return true;
		if (reaction.emoji.name === EMOJI_DENY) return true;
		return false;
		// return true;
	};
	
	require('repl').start({ prompt:'> ', useGlobal:true, })
	
	staffChannel.send("Test 2: Electric Boogalo").catch(LOGGER.error)
		.then((msg)=>{
			msg.react(EMOJI_CONFIRM).then(()=>msg.react(EMOJI_DENY)).then(()=>{
				let _interval = null;
				let confirms = 0;
				let denies = 0;
    
				const col = msg.createReactionCollector(filter);
				const close = ()=>{
					clearTimeout(_interval); _interval = null;
					//TODO resolve promise
				};
				const checkClose = ()=>{
					clearTimeout(_interval); _interval = null;
					confirms = col.collected.get(EMOJI_CONFIRM).count;
					denies = col.collected.get(EMOJI_DENY).count;
					if (confirms === denies) {
						_interval = setTimeout(close, 60*1000);
						return;
					}
					close();
				};
				col.on('collect', (reaction)=>{
					confirms = col.collected.get(EMOJI_CONFIRM).count;
					denies = col.collected.get(EMOJI_DENY).count;
					if (Math.abs(confirms - denies) > 3) { //end polling immedeately
						close(); return;
					}
					_interval = setTimeout(checkClose, 5*1000);
				});
				_interval = setTimeout(close, 60*1000);
    
				// const coll = msg.createReactionCollector(filter, { time: 20000, maxUsers: 1 });
				// coll.on('collect', (r)=>LOGGER.log(`collect:=>`, r.count, r.emoji));
				// coll.on('end', (c, r)=>LOGGER.log(`end:=>`, r, c));
			});
    
		});
	
	// staffChannel.send("Test 2: Electric Boogalo").catch(LOGGER.error)
	// 	.then((msg)=>{
	// 		msg.react(EMOJI_CONFIRM).then(()=>msg.react(EMOJI_DENY)).then(()=>{
	// 			const coll = msg.createReactionCollector(filter, { time: 20000, maxUsers: 1 });
	// 			coll.on('collect', (r)=>LOGGER.log(`collect:=>`, r.count, r.emoji));
	// 			coll.on('end', (c, r)=>LOGGER.log(`end:=>`, r, c));
	// 		});
    //
	// 	});

	// staffChannel.send("Test").catch(LOGGER.error)
	// 	.then((msg)=>{
	// 		msg.react(EMOJI_CONFIRM).then(()=>msg.react(EMOJI_DENY));
    //
	// 		msg.awaitReactions(filter, { time:10000, maxUsers:2, })
	// 			.then((collected)=>{
	// 				LOGGER.log(collected);
    //
	// 				let confirm = collected.get(EMOJI_CONFIRM).count;
	// 				let deny    = collected.get(EMOJI_DENY).count;
    //
	// 				if (confirm > deny) {
	// 					LOGGER.log('confirm');
	// 					// resolve({ res:true, msg });
	// 				} else if (confirm < deny) {
	// 					LOGGER.log('deny');
	// 					// resolve({ res:false, msg });
	// 				} else {
	// 					// resolve({ res:null, msg });
	// 				}
	// 			})
	// 			.catch(LOGGER.error);
	// 	});

}).catch(LOGGER.error);