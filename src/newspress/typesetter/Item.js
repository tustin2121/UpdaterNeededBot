// newspress/typesetter/Pokemon.js
// The phrasebook for Pokemon-related LedgerItems

module.exports = {
	GainItem: {
		// item = the item in question
		default: {
			single: [
				`<b>{{rand|Acquired|Obtained|Picked up|Got}} {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>{{rand|Acquired|Obtained|Picked up|Got}} {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
		report: `{{@report}}`,
		shopping: {
			single: [
				`<b>{{rand|Bought|Purchased|Paid for}} {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>{{rand|Bought|Purchased|Paid for}} {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
		freepromo: {
			__meta__: { sort:-10 }, //after other GainItems
			single: [
				`<b>We got {{two items|@item|@amount}} for free!</b>`,
				`<b>We got {{two items|@item|@amount}} as a free promotion!</b>`,
				`<b>{{Two items|@item|@amount}} gets thrown in as a package deal!</b>`,
			],
		},
		rotoloto: [
			`Roto Loto nets us <b>{{some items|@item|@amount}}</b>.`,
			`Rotom decides to hand us <b>{{some items|@item|@amount}}</b>.`,
			`Rotom interrupts us to give us <b>{{some items|@item|@amount}}</b>.`,
		],
	},
	LostItem: {
		// item = the item in question
		default: {
			single: [
				`<b>{{rand|Threw away|Tossed|Got rid of|Pitched|Discarded|Disposed of|Scrapped}} {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>{{rand|Threw away|Tossed|Got rid of|Pitched|Discarded|Disposed of|Scrapped}} {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
		shopping: {
			single: [
				`<b>Sold {{an item|@item|@amount}}!</b>`,
			],
			multi: [
				`<b>Sold {{a comma-separated list of|an item|@item|@amount}}!</b>`,
			],
		},
	},
	
	StoredItemInPC: {
		default: {
			single: [
				`<b>{{rand|Stored|Deposited|Put away|Stashed}} {{an item|@item|@amount}} in the PC!</b>`,
			],
			multi: [
				`<b>{{rand|Stored|Deposited|Put away|Stashed}} {{a comma-separated list of|an item|@item|@amount}} in the PC!</b>`,
			],
		},
	},
	RetrievedItemFromPC: {
		default: {
			single: [
				`<b>{{rand|Retrieved|Fetched|Salvaged}} {{an item|@item|@amount}} from the PC!</b>`,
			],
			multi: [
				`<b>{{rand|Retrieved|Fetched|Salvaged}} {{a comma-separated list of|an item|@item|@amount}} from the PC!</b>`,
			],
		},
	},
	MoneyValueChanged: null,
	HeldItemGained: null,
	HeldItemLost: null,
	
	ShoppingContext: null,
	ShoppingReport: { //TODO
		// __meta__: { helpingOnly:true },
		default: function({ cart }) {
			/* 
			Cart is: {
				buy: { itemId : { id:itemId, name:itemName, count:numBought }, }
				sell: { itemId : { id:itemId, name:itemName, count:numSold }, }
				money: currentMoneyAmount,
				transactions: number of times this cart has been updated
			}  */
			if (!cart || cart.transactions === 0) return null;
			const oldItemList = this._itemList;
			
			let res = [`{{rand|During our shopping trip|Results of our shopping trip:|In the mart}} we`];
			
			let items = Object.values(cart.sell);
			if (items.length) {
				this._itemList = items;
				res.push(this.fillText(`<b>sold {{a comma-separated list of|an item|@name|@count}}</b>.`));
			}
			
			items = Object.values(cart.buy);
			if (items.length) {
				if (res.length > 1) res.push('{{rand|Then we|We then|And we}}');
				this._itemList = items;
				res.push(this.fillText(`<b>bought {{a comma-separated list of|an item|@name|@count}}</b>.`));
			}
			
			res.push(`We have ₽${cart.money} {{rand|left|left over|remaining}}.`);
			this._itemList = oldItemList;
			return res.join(' ');
		},
	},
	
	UsedBallInBattle: {
		__meta__: { sort:180 }, //before PokemonGained, during "our turn" in BattleState
		default: {
			single: [
				`We {{rand|toss|throw|fling}} {{some items|@item|@amount}} at a wild {{Mon|@enemy}}.`,
				`We try catching a wild {{Mon|@enemy}} with {{some items|@item|@amount}}.`,
			],
			multi: [
				`We {{rand|toss|throw|fling}} {{a comma-separated list of|some items|@item|@amount}} at a wild {{Mon|@enemy}} that has our eye.`,
			],
		},
		trainer: [
			`We toss {{some items|@item|@amount}} at the trainer's pokemon, but {{they|@trainer}} block{{*s|@trainer}} the ball. Don't be a thief!`,
			`We throw {{some items|@item|@amount}} at the opponents's pokemon, to no avail.`,
			`We attempt to {{rand|steal|take|snag}} {{$@trainer}}'s {{Mon|@enemy}}. {{They}} {{rand|yell{{*s}} at us|scold{{*s}} us|tell{{*s}} us off|tell{{*s}} us where we can shove our {{@item}}}}.`,
			`We attempt to be a thief. The game tells us off.`,
		],
	},
	UsedBerryInBattle: {
		// item = the item involved
		// target = the pokemon involved
		default: [
			`{{$@target}} munches on {{his}} {{@item}}.`,
			`{{$@target}} eats {{his}} {{@item}}.`,
			`{{$@target}} eats {{his}} {{@item}} in the heat of battle.`,
		],
	},
	UsedItemOnMon: {
		__meta__: { sort:180 }, //before move learns and stuff
		//
		default: [
			`<b>We use {{an item|@item}} on {{@target}}!</b>`,
		],
		hpheal: [
			`<b>We heal {{@target}} with {{an item|@item}}!</b>`,
			`<b>We use {{an item|@item}} to heal {{@target}}!</b>`,
			`<b>We heal up {{@target}} by using {{an item|@item}} on {{them|@target}}.</b>`,
			`{{if mon is full health|$@target}}<b>We heal {{$}} to full health with {{an item|@item}}!</b>`,
		],
		ppheal: [
			`We restore the PP of {{@target}}'s {{@move}} with <b>{{an item|@item}}!</b>`,
			`We restore {{@target}}'s {{@move}} PP with <b>{{an item|@item}}!</b>`,
		],
		pphealAll: [
			`We restore the PP of {{@target}}'s moves with <b>{{an item|@item}}!</b>`,
			`We restore {{@target}}'s move PP with <b>{{an item|@item}}!</b>`,
		],
		evostone: [
			`<b>We use {{an item|@item}} on {{@target}}!</b>`,
		],
		tm: [
			`We boot up {{an item|@item}}.`,
		],
	},
};