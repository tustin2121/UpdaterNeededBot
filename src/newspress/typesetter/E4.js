// newspress/typesetter/E4.js
// The phrasebook for E4-related LedgerItems

module.exports = {
	E4RunContext: null,
	
	E4BeginRun: {
		// attempt = the e4 attempt number
		first: null, //The region should supply the first attempt's E4 announcement from the room announcement.
		default: [
			`<b>We're locked into the E4 for Attempt #{{@attempt}}!</b>`,
			`<b>We're in for E4 Attempt #{{@attempt}}!</b>`,
			`<b>Welcome back to the E4! Attempt #{{@attempt}}!</b>`,
			`<b>The door slams shut behind us! E4 Attempt #{{@attempt}}!</b>`,
			`<b>We stroll boldly into the E4 chambers and are locked inside! Attempt #{{@attempt}}!</b>`,
		],
		rematch: [
			`<b>We're locked into the E4 for Rematch Attempt #{{@attempt}}!</b>`,
			`<b>We're in for E4 Rematch Attempt #{{@attempt}}!</b>`,
			`<b>Welcome back to the E4! Rematch Attempt #{{@attempt}}!</b>`,
			`<b>The door slams shut behind us! E4 Rematch Attempt #{{@attempt}}!</b>`,
			`<b>We stroll boldly into the E4 chambers and are locked inside! Rematch Attempt #{{@attempt}}!</b>`,
		],
		quick: [
			`<b>Right back in for Attempt #{{@attempt}}!</b>`,
			`<b>We turn right around and run back in for E4 Attempt #{{@attempt}}!</b>`,
			`<b>We rush back in for E4 Attempt #{{@attempt}}!</b>`,
			`<b>They barely kicked us out when we go back in for E4 Attempt #{{@attempt}}!</b>`,
		],
	},
	E4ReachChampion: {
		// attempt = the champion attempt number
		default: [
			`<b>WE'RE HEADING TO THE CHAMPION!!</b> Champion attempt #{{@attempt}} incoming!!\n\n{{team status}}`,
		],
		rematch: [
			`<b>WE'RE HEADING TO THE CHAMPION!!</b> Champion rematch attempt #{{@attempt}} incoming!!\n\n{{team status}}`,
		],
	},
	E4EndRun: {
		// attempt = the e4 attempt number
		default: [
			`rip E4 Attempt #{{@attempt}}`,
		],
		rematch: [
			`rip E4 Rematch Attempt #{{@attempt}}.`,
		],
	},
	E4HallOfFame: {
		// attempt = the e4 attempt number
		// champAttempt = the champion attempt number
		default: {
			select: (item)=> Math.max(item.rematch, 15),
			0: `<b>We enter the HALL OF FAME!</b> ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`,
			1: `<b>We enter the HALL OF FAME again!</b> ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`,
			2: `<b>We enter the HALL OF FAME a third time!</b> ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`,
			3: `<b>We enter the HALL OF FAME yet again!</b> ヽ༽ຈل͜ຈ༼ﾉ VICTORY RIOT ヽ༽ຈل͜ຈ༼ﾉ`,
			4: `<b>We enter the HALL OF FAME yet again!</b> ヽ༼ ͠ ͠° ͜ʖ ͠ ͠° ༽ﾉ VICTORY RIOT ヽ༼ ͠ ͠° ͜ʖ ͠ ͠° ༽ﾉ`,
			5: `<b>We enter the HALL OF FAME yet again...!</b> ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`,
			6: `<b>We enter the HALL OF FAME!</b> I've lost count how many times! └༼ •́ ͜ʖ •̀ ༽┘ VICTORY RIOT └༼ •́ ͜ʖ •̀ ༽┘`,
			7: `<b>We enter the HALL OF FAME!</b> Woo! ヽ༼ ◉  ͜  ◉༽ﾉ VICTORY RIOT ヽ༼ ◉  ͜  ◉༽ﾉ`,
			8: `<b>We enter the HALL OF FAME!</b> I think that's nine now! ╰༼ ❛ ʖ̫ ❛ ༽╯ VICTORY RIOT ╰༼ ❛ ʖ̫ ❛ ༽╯`,
			9: `<b>We enter the HALL OF FAME!</b> omg my arms are getting heavy from rioting. woo! └( ՞ ~ ՞ )┘ VICTORY RIOT └( ՞ ~ ՞ )┘`,
			10: `<b>We enter the HALL OF FAME! Yet again!</b> ╰〳 ಠ 益 ಠೃ 〵╯ ELEVENTH VICTORY RIOT ╰〳 ಠ 益 ಠೃ 〵╯`,
			11: `<b>We enter the HALL OF FAME! For the twlefth time!</b> (:ㄏ■ Д ■ :)ㄏ VICTORY RIOT (:ㄏ■ Д ■ :)ㄏ`,
			12: `<b>We enter the HALL OF FAME!</b> └( ͡° ︿ °͡ )┘ VICTORY RIOT └( ͡° ︿ °͡ )┘ (Sorry, my arms are tired)`,
			13: `<b>We enter the HALL OF FAME!</b> └| ಠ ‸ ಠ |┘ VICTORY RIOT └| ಠ ‸ ಠ |┘`,
			14: `<b>We enter the Hall of Fame!</b> ┌༼ – _ – ༽┐ VICTORY ┌༼ – _ – ༽┐`,
			15: `<b>We enter the Hall of Fame.</b> (╭ರ_⊙)`,
		},
	}
};