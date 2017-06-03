// discordcmd.js
//

module.exports = function(msg, memory) {
	if (msg.content === '_tags UpdaterNeeded_') {
		return ['tagin'];
	}
	if (msg.content.startsWith('_tags')) {
		return ['tagout'];
	}
	//if (/where are we/i.test(msg.content))
	let res = /^Updater?(?:Needed)?(?:Bot)?[:,] (.*)/i.exec(msg.content);
	if (res) return parseCmd(res[1]);
	
	if (msg.mentions.users.some(x=> x.id===msg.client.user.id)) {
		if (msg.content.trim() === '') {
			return ['tagin'];
		} else {
			return parseCmd(msg.content);
		}
	}
	
	return [''];
};

function parseCmd(cmd) {
	cmd = cmd.toLowerCase().replace(/[,:]/i,'').trim();
	if (!cmd) return [''];
	if (/tag ?in|start/i.test(cmd)) return ['tagin'];
	if (/tag ?out|stop/i.test(cmd)) return ['tagout'];
	let res;
	
	if ((res = /^h[ea]lp (?:me |us )?(?:out )?with (.*)/i.exec(cmd))) {
		let opts = res[1].split(/, /);
		let things = {};
		opts.forEach((x)=>{
			if (/caught|catch|pokemon/.test(x)) things['catches'] = true;
			if (/shopping|shop|vending/.test(x)) things['shopping'] = true;
			if (/items?|pickup/.test(x)) things['items'] = true;
			if (/levelup|levels?/.test(x)) things['level'] = true;
			if (/moves?|learn/.test(x)) things['moves'] = true;
		});
		if (!Object.keys(things).length) return ['helpout-help'];
		return ['helpout', things];
	}
}

