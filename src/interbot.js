// interbot.js
// The definition of the intermission bot

/* global getLogger */
const path = require('path');
const BaseBot = require('./bot');

const MEMORY_DIR = path.resolve(__dirname, '../memory');

const LOGGER = getLogger('UpdaterBot');

const MINUTES = 1000*60;
const HOURS = MINUTES*60;
const DAYS = HOURS*24;

class IntermissionUpdaterBot extends BaseBot {
	constructor(nextRunTS) {
		super(MEMORY_DIR);
		this.nextRun = nextRunTS;
		
		this.memory.reminders; //ensure this is created
	}
	
	run() {
		const now = Date.now();
		const until = this.nextRun - now;
		
		if (this.checkReminders(now, until)) {
			this.saveMemory();
		}
		
		//TODO create newspress-like modules for intermission time checking?
		//TODO create a ReminderModule, which checks the time?
		//TODO create a PostingModule, which can post things to the intermission live updater?
		
		if (until < 1 * MINUTES) {
			this.memory.global.rebootRequested = true;
			this.alertUpdaters(`Run is less than a minute away. Now rebooting into run mode, please wait...`, { bypassTagCheck:true });
			setTimeout(()=>this.shutdown(), 500);
			return;
		}
		
		let timeout;
		if (until > 7 * DAYS) { //If the run is more than 7 days away
			timeout = 1 * HOURS; //check every 1 hour
		} else if (until > 1 * DAYS) { //If the run is more than 1 day away
			timeout = 30 * MINUTES; //check every 30 minutes
		} else if (until > 1 * DAYS) { //If the run is more than an hour away
			timeout = 10 * MINUTES; //check every 10 minutes
		} else if (until > 5 * MINUTES) { //If the run is more than 5 minutes away
			timeout = 1 * MINUTES; //check every minute
		} else { //If the run is less than 5 minutes away
			timeout = 5000; //check every 5 seconds
		}
		setTimeout(()=>this.run(), timeout);
	}
	
	get taggedIn() { return false; }
	
	getStatusString() {
		let uptime = printElapsedTime(Math.floor(require("process").uptime()), false);
		let version = require('../package.json').version;
		return `Intermission-Time UpdaterNeeded Bot ${version} present.\nUptime: ${uptime}`;
	}
	
	checkReminders(now, until) {
		const mem = this.memory.reminders;
		if (!mem.oneWeek && until < 7 * DAYS) {
			this.alertUpdaters(`This is a reminder: The next run starts in one week's time. If you think you can update this run, please inform the moderators.`, { ping:true, bypassTagCheck:true });
			mem.oneWeek = true;
			return true;
		}
		if (!mem.meme && until < 4 * DAYS) {
			this.alertUpdaters(`This is a reminder: The next run starts in four day's time. If there isn't a Flareon's butt meme on the next run's updater yet, y'all are slacking.`, { bypassTagCheck:true });
			mem.meme = true;
			return true;
		}
		if (!mem.oneDay && until < 1 * DAYS) {
			this.alertUpdaters(`This is a reminder: The next run starts tomorrow at this time!`, { bypassTagCheck:true });
			mem.oneDay = true;
			return true;
		}
		if (!mem.twoHours && until < 2 * HOURS) {
			this.alertUpdaters(`The next run starts in TWO HOURS. Please ensure timescripts are updated!`, { ping:true, bypassTagCheck:true });
			mem.twoHours = true;
			return true;
		}
		if (!mem.oneHour && until < 1 * HOURS) {
			this.alertUpdaters(`One hour HYPE!`, { bypassTagCheck:true });
			mem.oneHour = true;
			return true;
		}
		if (!mem.tenMin && until < 10 * MINUTES) {
			this.alertUpdaters(`10 minutes HYPE!!`, { bypassTagCheck:true });
			mem.tenMin = true;
			return true;
		}
	}
}
module.exports = IntermissionUpdaterBot;
