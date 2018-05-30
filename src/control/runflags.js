// control/runflags.js
// A list of run flags that can be set on the bot, separated from commands for readability.

const FLAGS = {
	alert_battles: {
		name: 'Battle Alerts',
		purpose: `I will notify #staff with alerts of legendary, rival, or gym battles.`,
		match: /(battle|legendary|rival) (alerts?|pings?)/i,
	},
	
	alert_badges: {
		name: 'Badge-Get Alerts',
		purpose: `I will print a remainder to #staff about a new badge aquisition.`,
		match: /(badge) (alerts?|pings?)/i,
	},
	
	in_democracy: {
		name: 'In Democracy',
		purpose: `I will report as if democracy is on. Usually I can detect this myself, but you can turn it on and off if I miss something.`,
		match: /demo(cracy)?/i,
	},
};

module.exports = {
	FLAGS,
	parse(txt) {
		for (let flag in FLAGS) {
			if (FLAGS[flag].match.test(txt)) {
				return flag;
			}
		}
		return undefined;
	}
};