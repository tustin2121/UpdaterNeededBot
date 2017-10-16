// discordcmd.js
//

const MY_MENTION_ID = '<@303732710185369601>';

module.exports = function(msg, memory) {
	if (msg.content === '_tags UpdaterNeeded_') {
		return ['tagin', true];
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
};

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
	if (/^(tag ?in|start)/i.test(cmd)) return ['tagin', false];
	if (/^(tag ?out|stop)/i.test(cmd)) return ['tagout'];
	if (/^(post|update|show) ((current|curr) )?(team|party)( (info|stats?))?/i.test(cmd)) return ['reqUpdate', 'team'];
	
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
	
	if (/^h[ea]lp (?:me |us )?(?:out )?/i.test(cmd)) return ['helpout-help'];
	
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

