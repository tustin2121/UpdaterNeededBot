// control/runflags.js
// A list of run flags that can be set on the bot, separated from commands for readability.

const FLAGS = {
	alert_battles: {
		name: 'Battle Alerts',
		default: true,
		purpose: `I will notify #staff with alerts of legendary, rival, or gym battles.`,
		match: /(battle|legendary|rival) (alerts?|pings?)/i,
	},
	
	alert_badges: {
		name: 'Badge-Get Alerts',
		default: true,
		purpose: `I will print a remainder to #staff about a new badge aquisition.`,
		match: /(badge) (alerts?|pings?)/i,
	},
	
	alert_temp: {
		name: 'Temporary Party Alerts',
		default: true,
		purpose: `I will print a message when I think the current party is a temporary party.`,
		match: /temp(orary)?( party)? (alerts?|pings?)/i,
	},
	
	e4_rematch: {
		name: 'E4 Rematch Levels',
		default: false,
		purpose: `I will make note if we're running against higher level Rematch E4 in my E4 rematch count if this is turned on.`,
		match: /(e4 ?)?rematch( levels)?/i,
	},
	
	query_missing: {
		name: 'Missing Pokemon Queries',
		default: true,
		purpose: `I will ask updaters if a missing pokemon has been released. If this is off, I will assume it's been released after a few minutes.`,
		match: /missing( pokemon)?(questions|queries)?/,
	},
	
	trading_enabled: {
		name: 'Pokemon Trade Watch',
		default: false,
		purpose: `I will try and report traded pokemon. Trying to look for this can cause other errors, though, so only turn it on if it's possible.`,
		match: /trad(e|ing)( watch)?/i,
	},
	
	fly_logic: {
		name: 'Flight Calculations',
		default: true,
		purpose: `I will try and determine when we're flying to a town instead of walking in. If I'm getting this wrong too often, feel free to turn it off.`,
		match: /flying|flight|flycalc/i,
	},
	
	play_by_play: { 
		name: 'Play-By-Play',
		default: false,
		purpose: `I will attempt to play-by-play important battles to the best of my ability.`,
		match: /play(\-by\-play)?|battle ?state/,
	},
	
	force_important: { 
		name: 'Force Important',
		default: false,
		purpose: `I will consider all battles important.`,
		match: /force ?important/,
	},
	
	in_democracy: {
		name: 'In Democracy',
		default: false,
		purpose: `I will report as if democracy is on. Usually I can detect this myself, but you can turn it on and off if I miss something.`,
		match: /demo(cracy)?/i,
	},
	
	pv_patch: {
		name: 'Personality Value Patch',
		default: false,
		purpose: `In Gen 1 and 2 games, the API fakes the Personality Value, and so there's a higher chance of it clashing. Enable this to "patch" that.`,
		match: /(pv ?)?patch/i,
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