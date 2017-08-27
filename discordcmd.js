// discordcmd.js
//

const MY_MENTION_ID = '<@303732710185369601>';

module.exports = function(msg, memory) {
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
	if (/^(tag ?in|start)/i.test(cmd)) return ['tagin'];
	if (/^(tag ?out|stop)/i.test(cmd)) return ['tagout'];
	if (/^(post|update|show) (team|party)( (info|stats?))?/i.test(cmd)) return ['reqUpdate', 'team'];
	
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
	if (/cof+ee|cofveve|tea|earl ?gr[ea]y/i.test(cmd)) return ['shutup', 'coffee'];
	return [''];
}

