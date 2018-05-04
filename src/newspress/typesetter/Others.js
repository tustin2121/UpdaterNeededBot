// newspress/typesetter/Options.js
// The phrasebook for Options-related LedgerItems

let singular = {
	'battle_scene': {
		'on': [
			`We turn on battle animations again.`,
			`We decide we like battle animations, and turn them on.`,
			`Animations are nice; we turn them back on.`,
		],
		'off': [
			`Deciding we want to go fast, we turn off battle animations in the options.`,
			`We're fed up with battle animations, and turn them off.`,
			`Battle animations have been nixed.`,
		],
	},
	'frame': [
		`We're tired of the current frame style, and switch it up in the options menu.`,
		`We redecorate our textboxes in the options.`,
		`I kinda like the new textbox frame we just chose.`,
		`Out with the old, in with the new textbox frame style; gotta keep up with fashion trends.`,
	],
	'menu_account': null,
	'print': null,
	'sound': {
		'mono': [
			`In the options menu, we decide that mono is the better way to listen to the game's music.`,
			`This game now presented to you in mono.`,
			`We switch to mono sound in the options.`,
		],
		'stereo': [
			`We switch the game to stereo sound.`,
			`This game now presented to you in stereo.`,
			`The music suddenly sounds better switched to stereo.`,
		],
	},
	'text_speed': {
		'fast': [
			`Text speed is now fast.`,
			`Text was too slow; now it is fast.`,
			`We switch the text speed back to fast.`,
		],
		'med': [
			`Text speed is now medium.`,
		],
		'slow': [
			`Text speed is now slow.`,
			`The text speed was too fast for us, so we slow it all the way down.`,
		],
	},
	'box_mode': {
		'automatic': [
			`We change the box mode to 'automatic'.`,
			`We decide hencefourth to send all caught pokemon to the PC without being prompted.`,
			`In the options, the box mode has been set to 'automatic'.`,
		],
		'manual': [
			`We change the box mode to 'manual'.`,
			`We decide that it's better to choose manually where newly caught pokemon go from here out.`,
			`In the options, the box mode has been set to 'manual'.`,
		],
	},
};
let plural = {
	'__main__': [
		`We take a tour through the options screen and {{@val}}.`,
		`We examine the options and decide to {{@val}}.`,
		`During a visit to the options screen, we {{@val}}.`,
		`We decided to {{@val}}.`,
	],
	'battle_scene': [
		`turn battle animations {{@val}}`,
		`turn {{@val}} the battle animations`,
		`set battle scene to {{@val}}`,
	],
	'battle_style': {
		'set': [
			`disallow battle switching`,
			`adopt a 'set' battle style`,
			`set battle style to 'set'`,
		],
		'switch': [
			`allow switching in battles`,
			`allow ourselves to switch pokemon in battle`,
			`set battle style to 'switch'`,
		],
	},
	'frame': [
		`change the frame style`,
		`choose a different frame style`,
	],
	'menu_account': null,
	'print': null,
	'sound': [
		`change the sound to {{@val}}`,
		`change the music to {{@val}}`,
		`listen to {{@val}} music`,
	],
	'text_speed': [
		`adjust the text speed to {{@val}}`,
		`change the text speed to {{@val}}`,
		`make the text {{@val}}`,
	],
	'box_mode': {
		'automatic': [
			`change the box mode to 'automatic'`,
			`switch the box mode to 'automatic'`,
			`switch to automatic handling of freshly caught pokemon`,
			`send newly caught pokemon automatically to the box`,
		],
		'manual': [
			`change the box mode to 'manual'`,
			`switch the box mode to 'manual'`,
			`switch to manual handling of freshly caught pokemon`,
			`choose to decide what to do with newly caught pokemon when we catch them`,
		],
	},
};

let OptionsChanged = {
	// opts = the changed options
	default: function(item) {
		let keys = Object.keys(item.changes);
		if (keys.length === 1) {
			return get(singular, keys[0], item[keys[0]]);
		} else {
			let list = [];
			for (let key of keys) {
				let phrase = get(plural, key, item[key]);
				if (!phrase) continue;
				list.push(phrase);
			}
			if (list.length === 0) return null;
			if (list.length === 1) return get(plural, '__main__', list[0]);
			list[list.length-1] = 'and '+list[list.length-1];
			if (list.length === 2) {
				list = list.join(' ');
			} else {
				list = list.join(', ');
			}
			return get(plural, '__main__', list);
		}
		// return;
		
		function get(arr, key, val='') {
			val = val.toLowerCase();
			let p = arr[key];
			if (!p) return null;
			if (p[val]) p = p[val];
			if (Array.isArray(p)) {
				p = p[this.rand(p.length)];
			}
			p = this.fillText(p, { val });
			return p;
		}
	},
};

module.exports = {
	OptionsChanged,
	
	TimeChanged: {
		dawn: [
			``,
		],
		noon: [
			``,
		],
		dusk: [
			``,
		],
		rday: [ `` ],
		rmorning: [ `` ],
		rnight: [ `` ],
	},
	
	PhonebookAdd: {
		default: [
			`<b>We register {{@contact}} in our {{phone}}!</b>`,
			`<b>We add {{@contact}} to our phonebook!</b>`,
			`<b>{{$@contact}} give{{*s}} us {{their}} number, and we add it to our {{phone}}!</b>`,
			`We liked battling {{@contact}} so much, <b>we decide to add {{them|@contact}} to our contacts!</b>`,
		],
	},
	PhonebookRemove: {
		default: [
			`Tired of all the constant calls from {{them|@contact}}, <b>we delete {{@contact}} from our phonebook!</b>`,
			`We make a snap decision and <b>delete {{@contact}} from our {{phone}}.</b>`,
			`We decide that we're better without {{@contact}} in our lives. <b>We delete {{them|@contact}} from our contact list!</b>`,
		],
	},
};