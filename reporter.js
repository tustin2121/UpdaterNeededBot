// reporter.js
// A single persistent class which compares previous and current API responses and
// generates reports on the differences.

let discoveries = [
	function mapChange(prev, curr, report) {
		if (prev.location === curr.location) return; // No map change
		report.mapChange = {}; // Submit a report on the map change
		let steps = report.mapChange.steps = curr.location.getStepsTo(prev.location);
		if (steps <= 1) {
			// Simple movement between rooms
			if (curr.location.is('indoors')) {
				if (!prev.location.is('indoors')) report.mapChange.movementType = 'enter';
			} else {
				if (prev.location.is('indoors')) report.mapChange.movementType = 'exit';
				if (curr.location.is('inTown') && !prev.location.is('inTown')) {
					report.mapChange.movementType = 'arrive'; // arrive in town
				}
			}
		} else if (steps > 5) {
			// Swift momvement beyond connections
			if (curr.location.within('flySpot', curr.position)) {
				report.mapChange.movementType = 'fly';
			}
			// TODO check if we're in the pokemon center above these flySpots
			else if (prev.location.is('dungeon') && !curr.location.is('dungeon')) {
				report.mapChange.movementType = 'escape'; // check if used escape rope later
			}
		}
		if (this.prevLocs.includes(curr.location)) {
			report.mapChange.recent = true;
			report.mapChange.last = this.prevLocs[0] === curr.location;
		} else if (curr.location.has('announce')) {
			report.mapChange.announcement = curr.location.has('announce');
		}
		this.prevLocs.pop(); // Pop oldest location
		this.prevLocs.unshift(curr.location); // Put newest location on front of queue
		
		let area = curr.location.getArea();
		if (this.prevAreas[0] !== area) {
			report.mapChange.newArea = true;
			if (this.prevAreas.includes(area)) {
				report.mapChange.newAreaAgain = true;
			}
			
			this.prevAreas.pop(); // Pop oldest location
			this.prevAreas.unshift(curr.location); // Put newest location on front of queue
		}
	},
	//TODO aquire/release pokemon
	//TODO discover party info
	//TODO blackout/heal watch
	//TODO e4/gym watch
	
];

let collators = [
	
	// Location changes
	function mapChange() { // Last
		if (!this.report.mapChange) return;
		let report = this.report.mapChange;
		let currLoc = this.currInfo.location;
		delete this.report.mapChange;
		
		if (report.announcement) {
			return report.announcement;
		}
		if (!currLoc.is('noteworthy')) return;
		
		let area = currLoc.name;
		let back = report.recent?'back ':'';
		let onto = currLoc.is('inTown')?'into':'onto';
		let the = currLoc.has('the');
		if (the === false) the = '';
		else if (the === true) the = 'the ';
		else the += ' ';
		
		switch (report.movementType) {
			case 'enter': {
				let o = [
					`We head ${back}into ${the}${area}.`,
					`We head ${back}inside ${the}${area}.`,
					`We go ${back}into ${the}${area}.`,
					`We duck ${back}inside ${the}${area}.`,
					`We're ${back}in ${the}${area} now.`,
				];
				return this.randA(o);
			}
			case 'exit': {
				let o = [
					`We head ${back}outside ${onto} ${the}${area}.`,
					`We exit ${back}${onto} ${the}${area}.`,
					`We leave, ${back}${onto} ${the}${area}.`,
				];
				if (report.last) o.push(`Nevermind, back outside again.`);
				return this.randA(o);
			}
			case 'arrive': {
				let o = [
					`We arrive in ${the}${area}!`,
					`Welcome to ${the}${area}!`,
				];
				return this.randA(o);
			}
			case 'fly': {
				let o = [
					`We fly to ${the}${area}!`,
					`We hop on our flying Pokemon and arrive ${onto.slice(0,2)} ${the}${area}!`,
				];
				return this.randA(o);
			}
			case 'escape': {
				let o;
				if (false) {//TODO if we are delta down one escape rope...
					o = [
						`**We use an Escape Rope!** Back ${onto.slice(0,2)} ${the}${area}!`,
						`**We escape rope back to the surface!** ${area}.`,
					];
				} else {
					o = [
						`**We dig out!** Back ${onto.slice(0,2)} ${the}${area}!`,
						`**We dig out of here!** ${area}.`,
						`**We dig our way back to ${the}${area}!**`,
					];
				}
				return this.randA(o);
			}
			default: {
				let o = [
					`Now ${onto.slice(0,2)} ${the}${area}.`,
					`${onto.charAt(0).toUpperCase()}${onto.charAt(1)} ${the}${area}.`, // In the Area.
					`${area}.`,
					`Welcome to ${the}${area}.`,
				];
				return this.randA(o);
			}
		}
	},
];


class Reporter {
	constructor(memoryBank={}, currInfo=null) {
		this.pastInfo = {};
		this.prevInfo = null;
		this.currInfo = currInfo;
		
		// Defines information that needs to be kept long-term (over restarts).
		this.memory = memoryBank;
		
		// Defines various information that should be kept short term
		this.pmem = {}; // Progressive text responses memory
		this.prevLocs = [null, null, null, null, null]; // Previous location queue
		this.prevAreas = [null, null, null]; // Previous top-level areas
		this.checkpoint = null;
		
		// Defined variables used for collecting reportable information
		this.report = {};
		this.collatedInfo = null;
	}
	
	/** Takes the passed current API data and compares it to the stored previous API data.
	 *  Generates a report, which is put together with a call to collate(). */
	discover(currInfo) {
		this.prevInfo = this.currInfo;
		this.currInfo = currInfo;
		if (!this.prevInfo) return; // Can't do anything with nothing to compare to
		
		// Step 1, find map changes
		discoveries.forEach(fn=>{
			fn.call(this, this.prevInfo, this.currInfo, this.report);
		});
	}
	
	collate() {
		let texts = [];
		
		//TODO report newly aquired pokemon (report extended information in hover text)
		if (false) { //TODO aquired pokemon loop
			let mon = {}; //TODO pokemon
			let exInfo = `${mon.types.join('/')} | Item: ${mon.item?mon.item:"None"} | Ability: ${mon.ability} | Nature: ${mon.nature}\n`;
			exInfo += `Caught In: ${mon.caughtIn} | Moves: ${mon.moves.join(', ')}`;
			if (mon.pokerus) exInfo += `\nHas PokeRus`;
			
			let announcement = `**Caught a [${(mon.shiny?"shiny ":"")}${lowerCase(x.gender)} Lv. ${x.level} ${x.species}](#info "${exInfo}")!**`+
				` ${(!x.nicknamed)?"No nickname.":"Nickname: `"+x.name+"`"}${(x.storedIn)?" (Sent to Box #"+x.storedIn+")":""}`;
		}
		/*
**Caught a [male Lv. 24 Torterra](#info "Grass/Ground | Item: None | Ability: Sticky Hold | Nature: Lax, Hates to lose
Caught In: Pokeball | Moves: ThunderPunch, Entrainment, Sacred Sword, Synthesis
Has PokeRus")!** No nickname. (Sent to Box #1)
		*/
		
		//TODO
	}
}


/** Compares two arrays to see if everything from arr1 is accounted for in arr2, and returns the difference. */
function differenceBetween(arr1, arr2, hashFn) {
	if (!Array.isArray(arr1) || !Array.isArray(arr2)) throw new TypeError('Pass arrays!');
	let hash2 = {};
	arr2.forEach(x=> hash2[hashFn(x)] = true);
	return arr1.filter(a=> !hash2[hashFn(a)] );
}