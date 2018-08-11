// control/runflags.js
// A list of run flags that can be set on the bot, separated from commands for readability.

const FLAGS = {
	alert_battles: { //default: true
		name: 'Battle Alerts',
		purpose: `I will notify #staff with alerts of legendary, rival, or gym battles.`,
		match: /(battle|legendary|rival) (alerts?|pings?)/i,
	},
	
	alert_badges: { //default: true
		name: 'Badge-Get Alerts',
		purpose: `I will print a remainder to #staff about a new badge aquisition.`,
		match: /(badge) (alerts?|pings?)/i,
	},
	
	alert_temp: { //default: true
		name: 'Temporary Party Alerts',
		purpose: `I will print a message when I think the current party is a temporary party.`,
		match: /temp(orary)?( party)? (alerts?|pings?)/i,
	},
	
	query_missing: { //default: true
		name: 'Missing Pokemon Queries',
		purpose: `I will ask updaters if a missing pokemon has been released. If this is off, I will assume it's been released after a few minutes.`,
		match: /missing( pokemon)?(questions|queries)?/,
	},
	
	trading_enabled: { //default: false
		name: 'Pokemon Trade Watch',
		purpose: `I will try and report traded pokemon. Trying to look for this can cause other errors, though, so only turn it on if it's possible.`,
		match: /trad(e|ing)( watch)?/i,
	},
	
	in_democracy: { //default: false
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