// newspress/typesetter/E4.js
// The phrasebook for E4-related LedgerItems

module.exports = {
	E4RunContext: null,
	
	E4BeginRun: {
		// attempt = the e4 attempt number
		first: null, //The region should supply the first attempt's E4 announcement from the room announcement.
		default: [
			`<b>We're locked into the E4 for Attempt #{{attempt}}!</b>`,
			`<b>We're in for E4 Attempt #{{attempt}}!</b>`,
			`<b>Welcome back to the E4! Attempt #{{attempt}}!</b>`,
			`<b>The door slams shut behind us! E4 Attempt #{{attempt}}!</b>`,
			`<b>We stroll boldly into the E4 chambers and are locked inside! Attempt #{{attempt}}!</b>`,
		],
		quick: [
			`<b>Right back in for Attempt #{{attempt}}!</b>`,
			`<b>We turn right around and run back in for E4 Attempt #{{attempt}}!</b>`,
			`<b>We rush back in for E4 Attempt #{{attempt}}!</b>`,
			`<b>They barely kicked us out when we go back in for E4 Attempt #{{attempt}}!</b>`,
		],
	},
	E4ReachChampion: {
		// attempt = the champion attempt number
		default: [
			`<b>WE'RE HEADING TO THE CHAMPION!!</b> Champion attempt #{{attempt}} incoming!!`,
		],
	},
	E4EndRun: {
		// attempt = the e4 attempt number
		default: [
			`rip E4 Attempt #{{attempt}}`,
		],
	},
	E4HallOfFame: {
		// attempt = the e4 attempt number
		// champAttempt = the champion attempt number
		default: [
			`<b>We enter the HALL OF FAME!</b> ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`,
		],
	}
};