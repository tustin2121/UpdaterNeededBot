// test newspress/typesetter/RealTests.js
// Unit test cases for real-world scenarios

const { should, sinon } = require('../../common');

const LEDGER_ITEMS = require('../../../src/newspress/ledger');
const POKEDATA = require('../../../src/api/pokedata');
const MAPNODE = require('../../../src/api/mapnode');
const TYPESET = require('../../../src/newspress/typesetter');
const { Rule } = require('../../../src/newspress/modules/_base');

const { Ledger } = LEDGER_ITEMS;
const { TypeSetter } = TYPESET;
TypeSetter.prototype.setRandom = function(...val) {
	let i = 0;
	this.rand = (len)=>{
		//fix the random outcome
		return val[(i++)%val.length] % len;
	};
};

describe('Real-World Tests', function(){
	describe('Phrase Sorting', function(){
		
		it('blackout order', function(){
			let api = getData();
			let ledger = new Ledger();
			ledger.add(new LEDGER_ITEMS.MonFainted(api.party[0]));
			ledger.add(new LEDGER_ITEMS.Blackout());
			
			let typesetter = new TypeSetter({ curr_api:api, debugLog:ledger.log, });
			typesetter.setRandom(1, 0);
			
			let res = typesetter.typesetLedger(ledger);
			
			res.should.equal(`<b>222 (Quilava) has fainted!</b> <b>BLACKED OUT!</b>`);
		});
	});
	
	describe('Selecting Item Flavors', function(){
		const log = {
			typesetterInput(){},
			typesetterFormat(){},
			typesetterOutput(){},
		};
		let typesetter;
		beforeEach(function(){
			let curr = new POKEDATA.SortedData({ data:{party:[], pc:{}} });
			typesetter = new TYPESET.TypeSetter(curr, log);
		});
		
		it('BattleStarted (Leader, Trainer Class Lists)', function(){
			const { BattleStarted } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			Bot.setOpt('trainerClasses', { leader:{12:true}, m:{}, f:{12:true}, p:{}, });
			
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 12,
					class_name: 'Leader',
					name: 'Misty',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Starmie' },
					}
				],
			});
			
			const exp = `<b>Vs Leader Misty!</b> Attempt #5!`;
			const item = new BattleStarted(battle, 5);
			item.importance.should.be.exactly(2);
			
			const str = typesetter.typesetItems([item]);
			
			str.should.be.exactly(exp);
		});
		
		it('BattleStarted (Leader, Individual Class Info)', function(){
			const { BattleStarted } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			Bot.setOpt('trainerClasses', { info:[ {}, {}, 
				{ id:2, gender:'f', name: "Leader", important:'leader', } 
			] });
			
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 2,
					class_name: 'Leader',
					name: 'Misty',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Starmie' },
					}
				],
			});
			
			const exp = `<b>Vs Leader Misty!</b> Attempt #5!`;
			const item = new BattleStarted(battle, 5);
			item.importance.should.be.exactly(2);
			
			const str = typesetter.typesetItems([item]);
			
			str.should.be.exactly(exp);
		});
		
		it('BattleStarted (Trainer, Trainer Class Lists)', function(){
			const { BattleStarted } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			Bot.setOpt('trainerClasses', { m:{6:true}, f:{}, p:{}, });
			
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 6,
					class_name: 'Bug Catcher',
					name: 'Wade',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Weedle' },
					}
				],
			});
			
			typesetter.setRandom(1, 1);
			
			const exp = `We get spotted by an eager Bug\xA0Catcher named Wade, and begin a battle against his Weedle.`;
			const item = new BattleStarted(battle, 0);
			item.importance.should.be.exactly(0.9);
			item.flavor.should.be.exactly('unimportant');
			
			item.importance = 1;
			const str = typesetter.typesetItems([item]);
			
			str.should.be.exactly(exp);
		});
		
		it('BattleStarted (Trainer, Individual Class Info)', function(){
			const { BattleStarted } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			Bot.setOpt('trainerClasses', { info:[ {}, {}, 
				{ id:2, gender:'m', name: "Bug Catcher", } 
			] });
			
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 2,
					class_name: 'Bug Catcher',
					name: 'Wade',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Weedle' },
					}
				],
			});
			
			typesetter.setRandom(1, 1);
			
			const exp = `We get spotted by an eager Bug\xA0Catcher named Wade, and begin a battle against his Weedle.`;
			const item = new BattleStarted(battle, 0);
			item.importance.should.be.exactly(0.9);
			item.flavor.should.be.exactly('unimportant');
			
			item.importance = 1;
			const str = typesetter.typesetItems([item]);
			
			str.should.be.exactly(exp);
		});
		
		it('BattleContext', function(){
			const { BattleStarted, BattleContext } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 5,
					class_name: 'Youngster',
					name: 'Joey',
					gender: 'Male',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Weedle' },
					}
				],
			});
			
			typesetter.setRandom(1, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			
			const exp = `We get spotted by a wandering Youngster named Joey, and begin a battle against his Weedle.`;
			const item = new BattleContext(battle);
			item.importance = 1;
			const str = typesetter.typesetItems([item]);
			
			str.should.be.exactly(exp);
		});
	});
	
	describe('Typesetting', function(){
		const prevInfo = `{"party":[{"personality_value":3948487629,"name":"!!!!!qqquulk","gender":"Male","species":{"id":708,"name":"Phantump","national_dex":708,"type1":"Ghost","type2":"Grass","egg_cycles":20,"gender_ratio":127,"growth_rate":"Medium Fast","catch_rate":120,"abilities":null},"form":0,"nature":"Brave","held_item":{"id":0,"name":""},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":12,"moves":[{"id":194,"pp":2,"max_pp":5,"name":"Destiny Bond","accuracy":101,"base_power":0,"type":"Ghost"},{"id":150,"pp":40,"max_pp":40,"name":"Splash","accuracy":101,"base_power":0,"type":"Normal"},{"id":71,"pp":14,"max_pp":25,"name":"Absorb","accuracy":100,"base_power":20,"type":"Grass"},{"id":450,"pp":18,"max_pp":20,"name":"Bug Bite","accuracy":100,"base_power":60,"type":"Bug"}],"shiny":false,"experience":{"current":2115,"next_level":2197,"this_level":1728,"remaining":82},"friendship":180,"ability":"Cursed Body","evs":{"hp":4,"attack":9,"defense":14,"speed":2,"special_attack":3,"special_defense":11},"ivs":{"hp":6,"attack":25,"defense":17,"speed":28,"special_attack":16,"special_defense":19},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":10,"caught_in":"Poké Ball","level":5,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[0,33],"stats":{"hp":33,"attack":27,"defense":18,"speed":15,"special_attack":18,"special_defense":21},"status":"","affection":0,"fullness":0,"enjoyment":160,"encryption_key":205020294,"checksum":391,"next_move":{"name":"Heart Swap","id":391,"basePower":0,"basePP":10,"accuracy":101,"type":"Psychic","level":13},"characteristic":"Somewhat of a clown"},{"personality_value":1840625263,"name":"Kabuto","gender":"Male","species":{"id":140,"name":"Kabuto","national_dex":140,"type1":"Rock","type2":"Water","egg_cycles":30,"gender_ratio":31,"growth_rate":"Medium Fast","catch_rate":45,"abilities":null},"form":0,"nature":"Adamant","held_item":{"id":0,"name":""},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":11,"moves":[{"id":55,"pp":25,"max_pp":25,"name":"Water Gun","accuracy":100,"base_power":40,"type":"Water"},{"id":594,"pp":20,"max_pp":20,"name":"Water Shuriken","accuracy":100,"base_power":15,"type":"Water"},{"id":157,"pp":10,"max_pp":10,"name":"Rock Slide","accuracy":90,"base_power":75,"type":"Rock"},{"id":212,"pp":5,"max_pp":5,"name":"Mean Look","accuracy":101,"base_power":0,"type":"Normal"}],"shiny":false,"experience":{"current":1433,"next_level":1728,"this_level":1331,"remaining":295},"friendship":174,"ability":"No Guard","evs":{"hp":7,"attack":16,"defense":4,"speed":1,"special_attack":2,"special_defense":0},"ivs":{"hp":12,"attack":19,"defense":23,"speed":14,"special_attack":5,"special_defense":8},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":4,"area_name":""},"is_egg":false,"is_nicknamed":false,"language":2,"health":[29,29],"stats":{"hp":29,"attack":27,"defense":27,"speed":18,"special_attack":15,"special_defense":15},"status":"","affection":0,"fullness":0,"enjoyment":80,"encryption_key":1151978697,"checksum":2104,"next_move":{"name":"Water Sport","id":346,"basePower":0,"basePP":15,"accuracy":101,"type":"Water","level":16},"characteristic":"Good endurance"},{"personality_value":1889685012,"name":"Drifloon!es8","gender":"Female","species":{"id":425,"name":"Drifloon","national_dex":425,"type1":"Ghost","type2":"Flying","egg_cycles":30,"gender_ratio":127,"growth_rate":"Fluctuating","catch_rate":125,"abilities":null},"form":0,"nature":"Mild","held_item":{"id":498,"name":"Moon Ball"},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":8,"moves":[{"id":64,"pp":35,"max_pp":35,"name":"Peck","accuracy":100,"base_power":35,"type":"Flying"},{"id":106,"pp":30,"max_pp":30,"name":"Harden","accuracy":101,"base_power":0,"type":"Normal"},{"id":194,"pp":5,"max_pp":5,"name":"Destiny Bond","accuracy":101,"base_power":0,"type":"Ghost"},{"id":313,"pp":20,"max_pp":20,"name":"Fake Tears","accuracy":100,"base_power":0,"type":"Dark"}],"shiny":false,"experience":{"current":276,"next_level":393,"this_level":276,"remaining":117},"friendship":151,"ability":"Infiltrator","evs":{"hp":0,"attack":1,"defense":0,"speed":1,"special_attack":0,"special_defense":0},"ivs":{"hp":9,"attack":29,"defense":24,"speed":15,"special_attack":7,"special_defense":18},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":4,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[33,33],"stats":{"hp":30,"attack":14,"defense":9,"speed":15,"special_attack":14,"special_defense":12},"status":"","affection":0,"fullness":0,"enjoyment":80,"encryption_key":1917791750,"checksum":52695,"next_move":{"name":"Lick","id":122,"basePower":30,"basePP":30,"accuracy":100,"type":"Ghost","level":13},"characteristic":"Quick tempered"},{"personality_value":3736786935,"name":"Silcoon1666","gender":"Female","species":{"id":266,"name":"Silcoon","national_dex":266,"type1":"Bug","type2":"Bug","egg_cycles":15,"gender_ratio":127,"growth_rate":"Medium Fast","catch_rate":120,"abilities":null},"form":0,"nature":"Mild","held_item":{"id":0,"name":""},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":4,"moves":[{"id":141,"pp":15,"max_pp":15,"name":"Leech Life","accuracy":100,"base_power":20,"type":"Bug"},{"id":324,"pp":15,"max_pp":15,"name":"Signal Beam","accuracy":100,"base_power":75,"type":"Bug"}],"shiny":false,"experience":{"current":85,"next_level":125,"this_level":64,"remaining":40},"friendship":163,"ability":"Hydration","evs":{"hp":0,"attack":0,"defense":0,"speed":1,"special_attack":0,"special_defense":0},"ivs":{"hp":28,"attack":14,"defense":20,"speed":6,"special_attack":20,"special_defense":2},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":2,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[19,19],"stats":{"hp":19,"attack":8,"defense":9,"speed":6,"special_attack":7,"special_defense":7},"status":"","affection":0,"fullness":0,"enjoyment":0,"encryption_key":3264411874,"checksum":35017,"characteristic":"Scatters things often"},{"personality_value":2708703042,"name":"Kabuto","gender":"Male","species":{"id":140,"name":"Kabuto","national_dex":140,"type1":"Rock","type2":"Water","egg_cycles":30,"gender_ratio":31,"growth_rate":"Medium Fast","catch_rate":45,"abilities":null},"form":0,"nature":"Lonely","held_item":{"id":277,"name":"Metronome"},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":9,"moves":[{"id":55,"pp":25,"max_pp":25,"name":"Water Gun","accuracy":100,"base_power":40,"type":"Water"},{"id":594,"pp":20,"max_pp":20,"name":"Water Shuriken","accuracy":100,"base_power":15,"type":"Water"},{"id":157,"pp":10,"max_pp":10,"name":"Rock Slide","accuracy":90,"base_power":75,"type":"Rock"},{"id":212,"pp":5,"max_pp":5,"name":"Mean Look","accuracy":101,"base_power":0,"type":"Normal"}],"shiny":false,"experience":{"current":950,"next_level":1000,"this_level":729,"remaining":50},"friendship":157,"ability":"No Guard","evs":{"hp":5,"attack":1,"defense":5,"speed":4,"special_attack":1,"special_defense":3},"ivs":{"hp":29,"attack":20,"defense":17,"speed":28,"special_attack":24,"special_defense":14},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":4,"area_name":""},"is_egg":false,"is_nicknamed":false,"language":2,"health":[27,27],"stats":{"hp":27,"attack":23,"defense":19,"speed":17,"special_attack":17,"special_defense":14},"status":"","affection":0,"fullness":0,"enjoyment":0,"encryption_key":111714061,"checksum":43127,"next_move":{"name":"Water Sport","id":346,"basePower":0,"basePP":15,"accuracy":101,"type":"Water","level":16},"characteristic":"Likes to relax"},{"personality_value":2721179863,"name":"!!  777     ","gender":"","species":{"id":344,"name":"Claydol","national_dex":344,"type1":"Ground","type2":"Psychic","egg_cycles":20,"gender_ratio":255,"growth_rate":"Medium Fast","catch_rate":90,"abilities":null},"form":0,"nature":"Gentle","held_item":{"id":316,"name":"Full Incense"},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":7,"moves":[{"id":100,"pp":20,"max_pp":20,"name":"Teleport","accuracy":101,"base_power":0,"type":"Psychic"},{"id":56,"pp":5,"max_pp":5,"name":"Hydro Pump","accuracy":80,"base_power":110,"type":"Water"},{"id":76,"pp":10,"max_pp":10,"name":"Solar Beam","accuracy":100,"base_power":120,"type":"Grass"},{"id":91,"pp":10,"max_pp":10,"name":"Dig","accuracy":100,"base_power":80,"type":"Ground"}],"shiny":false,"experience":{"current":408,"next_level":512,"this_level":343,"remaining":104},"friendship":150,"ability":"Harvest","evs":{"hp":2,"attack":0,"defense":0,"speed":3,"special_attack":0,"special_defense":0},"ivs":{"hp":23,"attack":8,"defense":4,"speed":11,"special_attack":9,"special_defense":10},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":3,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[27,27],"stats":{"hp":27,"attack":15,"defense":17,"speed":16,"special_attack":15,"special_defense":24},"status":"","affection":0,"fullness":0,"enjoyment":0,"encryption_key":953739445,"checksum":45638,"next_move":{"name":"Psycho Boost","id":354,"basePower":140,"basePP":5,"accuracy":90,"type":"Psychic","level":10},"characteristic":"Scatters things often"}]}`;
		const currInfo = `{"party":[{"personality_value":3948487629,"name":"!!!!!qqquulk","gender":"Male","species":{"id":708,"name":"Phantump","national_dex":708,"type1":"Ghost","type2":"Grass","egg_cycles":20,"gender_ratio":127,"growth_rate":"Medium Fast","catch_rate":120,"abilities":null},"form":0,"nature":"Brave","held_item":{"id":0,"name":""},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":12,"moves":[{"id":194,"pp":2,"max_pp":5,"name":"Destiny Bond","accuracy":101,"base_power":0,"type":"Ghost"},{"id":150,"pp":40,"max_pp":40,"name":"Splash","accuracy":101,"base_power":0,"type":"Normal"},{"id":71,"pp":14,"max_pp":25,"name":"Absorb","accuracy":100,"base_power":20,"type":"Grass"},{"id":450,"pp":18,"max_pp":20,"name":"Bug Bite","accuracy":100,"base_power":60,"type":"Bug"}],"shiny":false,"experience":{"current":2115,"next_level":2197,"this_level":1728,"remaining":82},"friendship":180,"ability":"Cursed Body","evs":{"hp":4,"attack":9,"defense":14,"speed":2,"special_attack":3,"special_defense":11},"ivs":{"hp":6,"attack":25,"defense":17,"speed":28,"special_attack":16,"special_defense":19},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":10,"caught_in":"Poké Ball","level":5,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[0,33],"stats":{"hp":33,"attack":27,"defense":18,"speed":15,"special_attack":18,"special_defense":21},"status":"","affection":0,"fullness":0,"enjoyment":160,"encryption_key":205020294,"checksum":391,"next_move":{"name":"Heart Swap","id":391,"basePower":0,"basePP":10,"accuracy":101,"type":"Psychic","level":13},"characteristic":"Somewhat of a clown"},{"personality_value":1840625263,"name":"Kabuto","gender":"Male","species":{"id":140,"name":"Kabuto","national_dex":140,"type1":"Rock","type2":"Water","egg_cycles":30,"gender_ratio":31,"growth_rate":"Medium Fast","catch_rate":45,"abilities":null},"form":0,"nature":"Adamant","held_item":{"id":0,"name":""},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":11,"moves":[{"id":55,"pp":25,"max_pp":25,"name":"Water Gun","accuracy":100,"base_power":40,"type":"Water"},{"id":594,"pp":20,"max_pp":20,"name":"Water Shuriken","accuracy":100,"base_power":15,"type":"Water"},{"id":157,"pp":10,"max_pp":10,"name":"Rock Slide","accuracy":90,"base_power":75,"type":"Rock"},{"id":212,"pp":5,"max_pp":5,"name":"Mean Look","accuracy":101,"base_power":0,"type":"Normal"}],"shiny":false,"experience":{"current":1433,"next_level":1728,"this_level":1331,"remaining":295},"friendship":174,"ability":"No Guard","evs":{"hp":7,"attack":16,"defense":4,"speed":1,"special_attack":2,"special_defense":0},"ivs":{"hp":12,"attack":19,"defense":23,"speed":14,"special_attack":5,"special_defense":8},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":4,"area_name":""},"is_egg":false,"is_nicknamed":false,"language":2,"health":[29,29],"stats":{"hp":29,"attack":27,"defense":27,"speed":18,"special_attack":15,"special_defense":15},"status":"","affection":0,"fullness":0,"enjoyment":80,"encryption_key":1151978697,"checksum":2104,"next_move":{"name":"Water Sport","id":346,"basePower":0,"basePP":15,"accuracy":101,"type":"Water","level":16},"characteristic":"Good endurance"},{"personality_value":1889685012,"name":"Drifloon!es8","gender":"Female","species":{"id":425,"name":"Drifloon","national_dex":425,"type1":"Ghost","type2":"Flying","egg_cycles":30,"gender_ratio":127,"growth_rate":"Fluctuating","catch_rate":125,"abilities":null},"form":0,"nature":"Mild","held_item":{"id":498,"name":"Moon Ball"},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":9,"moves":[{"id":64,"pp":35,"max_pp":35,"name":"Peck","accuracy":100,"base_power":35,"type":"Flying"},{"id":106,"pp":30,"max_pp":30,"name":"Harden","accuracy":101,"base_power":0,"type":"Normal"},{"id":194,"pp":5,"max_pp":5,"name":"Destiny Bond","accuracy":101,"base_power":0,"type":"Ghost"},{"id":313,"pp":20,"max_pp":20,"name":"Fake Tears","accuracy":100,"base_power":0,"type":"Dark"}],"shiny":false,"experience":{"current":437,"next_level":540,"this_level":393,"remaining":103},"friendship":159,"ability":"Infiltrator","evs":{"hp":3,"attack":1,"defense":0,"speed":1,"special_attack":0,"special_defense":0},"ivs":{"hp":9,"attack":29,"defense":24,"speed":15,"special_attack":7,"special_defense":18},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":4,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[36,36],"stats":{"hp":36,"attack":16,"defense":11,"speed":18,"special_attack":17,"special_defense":14},"status":"","affection":0,"fullness":0,"enjoyment":80,"encryption_key":1917791750,"checksum":52917,"next_move":{"name":"Lick","id":122,"basePower":30,"basePP":30,"accuracy":100,"type":"Ghost","level":13},"characteristic":"Quick tempered"},{"personality_value":3736786935,"name":"Silcoon1666","gender":"Female","species":{"id":266,"name":"Silcoon","national_dex":266,"type1":"Bug","type2":"Bug","egg_cycles":15,"gender_ratio":127,"growth_rate":"Medium Fast","catch_rate":120,"abilities":null},"form":0,"nature":"Mild","held_item":{"id":0,"name":""},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":6,"moves":[{"id":141,"pp":15,"max_pp":15,"name":"Leech Life","accuracy":100,"base_power":20,"type":"Bug"},{"id":324,"pp":15,"max_pp":15,"name":"Signal Beam","accuracy":100,"base_power":75,"type":"Bug"}],"shiny":false,"experience":{"current":296,"next_level":343,"this_level":216,"remaining":47},"friendship":171,"ability":"Hydration","evs":{"hp":3,"attack":0,"defense":0,"speed":1,"special_attack":0,"special_defense":0},"ivs":{"hp":28,"attack":14,"defense":20,"speed":6,"special_attack":20,"special_defense":2},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":2,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[23,23],"stats":{"hp":23,"attack":10,"defense":10,"speed":7,"special_attack":9,"special_defense":8},"status":"","affection":0,"fullness":0,"enjoyment":0,"encryption_key":3264411874,"checksum":35239,"characteristic":"Scatters things often"},{"personality_value":2708703042,"name":"Kabuto","gender":"Male","species":{"id":140,"name":"Kabuto","national_dex":140,"type1":"Rock","type2":"Water","egg_cycles":30,"gender_ratio":31,"growth_rate":"Medium Fast","catch_rate":45,"abilities":null},"form":0,"nature":"Lonely","held_item":{"id":277,"name":"Metronome"},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":10,"moves":[{"id":55,"pp":25,"max_pp":25,"name":"Water Gun","accuracy":100,"base_power":40,"type":"Water"},{"id":594,"pp":20,"max_pp":20,"name":"Water Shuriken","accuracy":100,"base_power":15,"type":"Water"},{"id":157,"pp":10,"max_pp":10,"name":"Rock Slide","accuracy":90,"base_power":75,"type":"Rock"},{"id":212,"pp":5,"max_pp":5,"name":"Mean Look","accuracy":101,"base_power":0,"type":"Normal"}],"shiny":false,"experience":{"current":1161,"next_level":1331,"this_level":1000,"remaining":170},"friendship":161,"ability":"No Guard","evs":{"hp":8,"attack":1,"defense":5,"speed":4,"special_attack":1,"special_defense":3},"ivs":{"hp":29,"attack":20,"defense":17,"speed":28,"special_attack":24,"special_defense":14},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":4,"area_name":""},"is_egg":false,"is_nicknamed":false,"language":2,"health":[29,29],"stats":{"hp":29,"attack":25,"defense":21,"speed":18,"special_attack":18,"special_defense":15},"status":"","affection":0,"fullness":0,"enjoyment":0,"encryption_key":111714061,"checksum":43345,"next_move":{"name":"Water Sport","id":346,"basePower":0,"basePP":15,"accuracy":101,"type":"Water","level":16},"characteristic":"Likes to relax"},{"personality_value":2721179863,"name":"!!  777     ","gender":"","species":{"id":344,"name":"Claydol","national_dex":344,"type1":"Ground","type2":"Psychic","egg_cycles":20,"gender_ratio":255,"growth_rate":"Medium Fast","catch_rate":90,"abilities":null},"form":0,"nature":"Gentle","held_item":{"id":316,"name":"Full Incense"},"original_trainer":{"id":44691,"secret":42453,"name":"266","gender":"Female"},"level":8,"moves":[{"id":100,"pp":20,"max_pp":20,"name":"Teleport","accuracy":101,"base_power":0,"type":"Psychic"},{"id":56,"pp":5,"max_pp":5,"name":"Hydro Pump","accuracy":80,"base_power":110,"type":"Water"},{"id":76,"pp":10,"max_pp":10,"name":"Solar Beam","accuracy":100,"base_power":120,"type":"Grass"},{"id":91,"pp":10,"max_pp":10,"name":"Dig","accuracy":100,"base_power":80,"type":"Ground"}],"shiny":false,"experience":{"current":512,"next_level":729,"this_level":512,"remaining":217},"friendship":150,"ability":"Harvest","evs":{"hp":5,"attack":0,"defense":0,"speed":3,"special_attack":0,"special_defense":0},"ivs":{"hp":23,"attack":8,"defense":4,"speed":11,"special_attack":9,"special_defense":10},"condition":{"coolness":0,"beauty":0,"cuteness":0,"smartness":0,"toughness":0,"feel":0},"met":{"game":25,"date":"2018-8-11","area_id":14,"caught_in":"Poké Ball","level":3,"area_name":""},"is_egg":false,"is_nicknamed":true,"language":2,"health":[29,29],"stats":{"hp":29,"attack":16,"defense":19,"speed":17,"special_attack":16,"special_defense":27},"status":"","affection":0,"fullness":0,"enjoyment":0,"encryption_key":953739445,"checksum":45745,"next_move":{"name":"Psycho Boost","id":354,"basePower":140,"basePP":5,"accuracy":90,"type":"Psychic","level":10},"characteristic":"Scatters things often"}]}`;
		
		it('multiple MonLeveledUp', function(){
			const { MonLeveledUp } = LEDGER_ITEMS;
			const PartyModule = require('../../../src/newspress/modules/Party');
			Bot._gameInfo = { trainer:{id:46212,secret:49132}, gen:6 };
			
			let prev_api = getData(JSON.parse(prevInfo));
			let curr_api = getData(JSON.parse(currInfo));
			
			let ledger = new Ledger();
			let module = new PartyModule({}, {});
			
			module.firstPass(ledger, { prev_api, curr_api });
			module.secondPass(ledger);
			module.finalPass(ledger);
			ledger.finalize();
			
			let typesetter = new TypeSetter({ curr_api, debugLog:ledger.log, });
			typesetter.setRandom(0, 0, 0, 0, 0, 0, 0, 0, 0);
			let res = typesetter.typesetLedger(ledger);
			
			res.replace(/\xA0/g,' ').should.equal(`<b>Drifloon!es8 (Drifloon) leveled up to 9!</b> <b>Silcoon1666 (Silcoon) has grown two levels to level 6!</b> <b>Kabuto (Kabuto) leveled up to 10!</b> <b>!!  777      (Claydol) leveled up to 8!</b>`);
		});
		
		it('multiple MonLeveledUp, exluding level 100', function(){
			const { MonLeveledUp } = LEDGER_ITEMS;
			const PartyModule = require('../../../src/newspress/modules/Party');
			Bot._gameInfo = { trainer:{id:46212,secret:49132}, gen:6 };
			
			let prev_api = getData(JSON.parse(prevInfo));
			let curr_api = getData(JSON.parse(currInfo));
			
			let ledger = new Ledger();
			let module = new PartyModule({}, {});
			
			module.firstPass(ledger, { prev_api, curr_api });
			module.secondPass(ledger);
			module.finalPass(ledger);
			
			curr_api.pokemon.party[0].level = 100;
			ledger.add(new MonLeveledUp(curr_api.pokemon.party[0], 99));
			ledger.finalize();
			
			let typesetter = new TypeSetter({ curr_api, debugLog:ledger.log, });
			typesetter.setRandom(0, 0, 0, 0, 0, 0, 0, 0, 0);
			let res = typesetter.typesetLedger(ledger);
			
			res.replace(/\xA0/g,' ').should.equal(`<i><b>!!!!!qqquulk (Phantump) HAS HIT LEVEL 100!!!</b></i> ヽ༼ຈل͜ຈ༽ﾉ LEVEL 100 RIOT ヽ༼ຈل͜ຈ༽ﾉ <b>Drifloon!es8 (Drifloon) leveled up to 9!</b> <b>Silcoon1666 (Silcoon) has grown two levels to level 6!</b> <b>Kabuto (Kabuto) leveled up to 10!</b> <b>!!  777      (Claydol) leveled up to 8!</b>`);
		});
		
		it('checkpoints', function(){
			const { CheckpointContext, CheckpointUpdated } = LEDGER_ITEMS;
			const { MapRegion } = MAPNODE;
			
			const rule = new Rule(`When fully healing at a center, set a checkpoint`)
				.when(ledger=>ledger.has('CheckpointContext').with('isCurrent', false).unmarked())
				.then(ledger=>{
					let item = ledger.mark(0).get(0)[0];
					item.isCurrent = true;
					ledger.add(new CheckpointUpdated(item.loc));
				});
			
			let region = new MapRegion({
				name: "Test", types: {}, reports:[], nodes: [[{
					"bank": 0,
					"id": 0,
					"name": "Petalburg City",
					"areaId": 7,
					"areaName": "Petalburg City",
					"type": "city",
					"width": 30,
					"height": 30,
					"attrs": {},
					"areas": [],
				}]]
			});
			let ledger = new Ledger();
			ledger.addItem(new CheckpointContext(region.nodes[0][0], false));
			
			rule.apply(ledger, {});
			
			ledger.list.should.have.lengthOf(2);
			ledger.list[1].should.be.an.instanceof(CheckpointUpdated);
			ledger.list[1].should.have.property('areaName', 'Petalburg City');
			
			let typesetter = new TypeSetter({ curr_api:null, debugLog:ledger.log, });
			typesetter.setRandom(0, 0, 0, 0, 0, 0, 0, 0, 0);
			let res = typesetter.typesetLedger(ledger);
			
			res.should.equal('<b>Checkpoint Petalburg City!</b>')
		});
	});
	
	describe('Cancellation', function(){
		it('MonGiveItem and MonTakeItem', function(){
			const { MonGiveItem, MonTakeItem } = LEDGER_ITEMS;
			const { Pokemon, Item } = POKEDATA;
			const mon1 = new Pokemon(), mon2 = new Pokemon();
			mon1.name = 'Qualava'; mon2.name = 'Honedge';
			
			let prevItems = [
				new MonTakeItem(mon1, new Item({ name:'Berry', id:22 })),
				new MonGiveItem(mon2, new Item({ name:'Everstone', id:26 })),
			];
			
			let ledger = new Ledger();
			ledger.addItem(new MonGiveItem(mon1, new Item({ name:'Berry', id:22 })));
			ledger.addItem(new MonTakeItem(mon2, new Item({ name:'Everstone', id:26 })));
			
			Ledger.mergeItems(prevItems, ledger.list, ledger.log);
			
			ledger.list.should.be.empty();
		});
	});
});


function getData(data={}) {
	return new POKEDATA.SortedData({ data:Object.assign({
		"name": "AAEFFFF",
		"id": 46212, "secret": 49132,
		
		"rival_name": "AAA22 ♀",
		"x": 0, "y": 0, "z": 0,
		"map_id": 186, "map_name": "Radio Tower",
		"money": 1840,
		"caught": 115, "seen": 337,
		"ball_count": 109,
		"level_cap": 100,
		"badges": 127,
		
		"party": [
			{
				"ability": "Flash Fire",
				"capsule": 0,
				"checksum": "6E87",
				"condition": { "beauty": 0, "coolness": 0, "cuteness": 0, "feel": 0, "smartness": 0, "toughness": 0 },
				"evs": { "attack": 120, "defense": 77, "hp": 77, "special_attack": 86, "special_defense": 42, "speed": 108 },
				"experience": {
					"current": 277905,
					"next_level": 286115,
					"this_level": 272535,
					"remaining": 8210
				},
				"form": 0,
				"friendship": 254,
				"gender": "Male",
				"health": [ 201, 201 ],
				"held_item": { "id": 146, "name": "Air Mail" },
				"is_egg": false,
				"is_nicknamed": 1,
				"ivs": { "attack": 22, "defense": 11, "hp": 19, "special_attack": 13, "special_defense": 11, "speed": 16 },
				"language": 2,
				"leaves": 0,
				"level": 65,
				"markings": 0,
				"met": {
					"area_id": 126,
					"area_id_egg": 0,
					"caught_in": "Poké Ball",
					"date": "2018-04-14",
					"encounter_type": 12,
					"game": 8,
					"level": 5,
					"area_name": "New Bark Town"
				},
				"moves": [
					{ "id": 53, "pp": 15, "pp_up": 0, "name": "Flamethrower", "accuracy": 100, "base_power": 95, "type": "Fire" },
					{ "id": 52, "pp": 25, "pp_up": 0, "name": "Ember", "accuracy": 100, "base_power": 40, "type": "Fire" },
					{ "id": 38, "pp": 15, "pp_up": 0, "name": "Double-Edge", "accuracy": 100, "base_power": 120, "type": "Normal" },
					{ "id": 205, "pp": 20, "pp_up": 0, "name": "Rollout", "accuracy": 90, "base_power": 30, "type": "Rock" }
				],
				"name": "222",
				"original_trainer": {
					"gender": "Male",
					"id": 46212,
					"name": "AAEFFFF",
					"secret": 49132
				},
				"personality_value": 3136071007,
				"pokerus": {
					"cured": false,
					"days_left": 0,
					"infected": false,
					"strain": 0
				},
				"ribbons": [],
				"shiny": false,
				"shiny_value": 5339,
				"species": {
					"id": 156,
					"name": "Quilava",
					"national_dex": 156,
					"type1": "Fire",
					"type2": "Fire",
					"egg_cycles": 19,
					"gender_ratio": 31,
					"growth_rate": "Medium Slow",
					"catch_rate": 45,
					"abilities": [
						"Blaze",
						"Flash Fire"
					]
				},
				"stats": { "attack": 148, "defense": 137, "hp": 201, "special_attack": 168, "special_defense": 129, "speed": 145 },
				"status": 0,
				"was_fateful_encounter": false,
				"nature": "Relaxed",
				"characteristic": "A little quick tempered"
			},
			{
				"ability": "Sturdy",
				"capsule": 0,
				"checksum": "97D",
				"condition": { "beauty": 0, "coolness": 0, "cuteness": 0, "feel": 0, "smartness": 0, "toughness": 0 },
				"evs": { "attack": 14, "defense": 2, "hp": 3, "special_attack": 3, "special_defense": 5, "speed": 19 },
				"experience": { "current": 60308, "next_level": 63316, "this_level": 58320, "remaining": 3008 },
				"form": 0,
				"friendship": 105,
				"gender": "Female",
				"health": [ 93, 93 ],
				"held_item": { "id": 141, "name": "Tunnel Mail" },
				"is_egg": false,
				"is_nicknamed": 1,
				"ivs": { "attack": 2, "defense": 4, "hp": 11, "special_attack": 16, "special_defense": 29, "speed": 15 },
				"language": 2,
				"leaves": 0,
				"level": 36,
				"markings": 0,
				"met": {
					"area_id": 216,
					"area_id_egg": 0,
					"caught_in": "Heal Ball",
					"date": "2018-04-19",
					"encounter_type": 5,
					"game": 8,
					"level": 33,
					"area_name": "Mt. Mortar"
				},
				"moves": [
					{ "id": 334, "pp": 15, "pp_up": 0, "name": "Iron Defense", "accuracy": 0, "base_power": 0, "type": "Steel" },
					{ "id": 182, "pp": 10, "pp_up": 0, "name": "Protect", "accuracy": 0, "base_power": 0, "type": "Normal" },
					{ "id": 36, "pp": 20, "pp_up": 0, "name": "Take Down", "accuracy": 85, "base_power": 90, "type": "Normal" },
					{ "id": 442, "pp": 15, "pp_up": 0, "name": "Iron Head", "accuracy": 100, "base_power": 80, "type": "Steel" }
				],
				"name": "ALLlmMOm·V",
				"original_trainer": {
					"gender": "Male",
					"id": 46212,
					"name": "AAEFFFF",
					"secret": 49132
				},
				"personality_value": 4230291734,
				"pokerus": {
					"cured": false,
					"days_left": 0,
					"infected": false,
					"strain": 0
				},
				"ribbons": [],
				"shiny": false,
				"shiny_value": 54875,
				"species": {
					"id": 305,
					"name": "Lairon",
					"national_dex": 305,
					"type1": "Steel",
					"type2": "Rock",
					"egg_cycles": 34,
					"gender_ratio": 127,
					"growth_rate": "Slow",
					"catch_rate": 90,
					"abilities": [
						"Sturdy",
						"Rock Head"
					]
				},
				"stats": { "attack": 71, "defense": 117, "hp": 93, "special_attack": 46, "special_defense": 45, "speed": 40 },
				"status": 0,
				"was_fateful_encounter": false,
				"nature": "Lax",
				"characteristic": "Somewhat stubborn"
			},
		],
		"pc": {
			"boxes": [
				{
					"box_address": 36223236,
					"box_contents": [
						{
							"ability": "Run Away",
							"box_slot": 1,
							"checksum": "5DA3",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 125,
								"next_level": 216,
								"this_level": 125,
								"remaining": 91
							},
							"form": 0,
							"friendship": 70,
							"gender": "Female",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 1,
							"ivs": {
								"attack": 11,
								"defense": 3,
								"hp": 18,
								"special_attack": 8,
								"special_defense": 24,
								"speed": 3
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 178,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 2,
								"game": 8,
								"level": 5,
								"area_name": "Route 30"
							},
							"moves": [
								{
									"id": 40,
									"pp": 35,
									"pp_up": 0,
									"name": "Poison Sting",
									"accuracy": 100,
									"base_power": 15,
									"type": "Poison"
								},
								{
									"id": 81,
									"pp": 40,
									"pp_up": 0,
									"name": "String Shot",
									"accuracy": 95,
									"base_power": 0,
									"type": "Bug"
								},
								{
									"id": 450,
									"pp": 20,
									"pp_up": 0,
									"name": "Bug Bite",
									"accuracy": 100,
									"base_power": 60,
									"type": "Bug"
								}
							],
							"name": "----",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 3277893405,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 26389,
							"species": {
								"id": 13,
								"name": "Weedle",
								"national_dex": 13,
								"type1": "Bug",
								"type2": "Poison",
								"egg_cycles": 14,
								"gender_ratio": 127,
								"growth_rate": "Medium Fast",
								"catch_rate": 255,
								"abilities": [
									"Shield Dust",
									"Run Away"
								]
							},
							"was_fateful_encounter": false,
							"level": 5,
							"nature": "Bold",
							"characteristic": "Somewhat stubborn"
						},
						{
							"ability": "Levitate",
							"box_slot": 2,
							"checksum": "FBC2",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 560,
								"next_level": 742,
								"this_level": 560,
								"remaining": 182
							},
							"form": 0,
							"friendship": 70,
							"gender": "Male",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 0,
							"ivs": {
								"attack": 9,
								"defense": 30,
								"hp": 15,
								"special_attack": 1,
								"special_defense": 5,
								"speed": 11
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 10,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 122,
									"pp": 30,
									"pp_up": 0,
									"name": "Lick",
									"accuracy": 100,
									"base_power": 20,
									"type": "Ghost"
								},
								{
									"id": 101,
									"pp": 15,
									"pp_up": 0,
									"name": "Night Shade",
									"accuracy": 100,
									"base_power": 1,
									"type": "Ghost"
								},
								{
									"id": 180,
									"pp": 10,
									"pp_up": 0,
									"name": "Spite",
									"accuracy": 100,
									"base_power": 0,
									"type": "Ghost"
								},
								{
									"id": 212,
									"pp": 5,
									"pp_up": 0,
									"name": "Mean Look",
									"accuracy": 0,
									"base_power": 0,
									"type": "Normal"
								}
							],
							"name": "Gastly",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 1005353381,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 18721,
							"species": {
								"id": 92,
								"name": "Gastly",
								"national_dex": 92,
								"type1": "Ghost",
								"type2": "Poison",
								"egg_cycles": 19,
								"gender_ratio": 127,
								"growth_rate": "Medium Slow",
								"catch_rate": 190,
								"abilities": [
									"Levitate",
									"-"
								]
							},
							"was_fateful_encounter": false,
							"level": 10,
							"nature": "Docile",
							"characteristic": "Sturdy body"
						},
						{
							"ability": "Unaware",
							"box_slot": 3,
							"checksum": "D994",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 1331,
								"next_level": 1728,
								"this_level": 1331,
								"remaining": 397
							},
							"form": 0,
							"friendship": 70,
							"gender": "Female",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 1,
							"ivs": {
								"attack": 29,
								"defense": 17,
								"hp": 31,
								"special_attack": 14,
								"special_defense": 21,
								"speed": 7
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 11,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 33,
									"pp": 35,
									"pp_up": 0,
									"name": "Tackle",
									"accuracy": 100,
									"base_power": 50,
									"type": "Normal"
								},
								{
									"id": 111,
									"pp": 40,
									"pp_up": 0,
									"name": "Defense Curl",
									"accuracy": 0,
									"base_power": 0,
									"type": "Normal"
								},
								{
									"id": 45,
									"pp": 40,
									"pp_up": 0,
									"name": "Growl",
									"accuracy": 100,
									"base_power": 0,
									"type": "Normal"
								}
							],
							"name": "BBBAAAQQQ ",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 3212609389,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 13177,
							"species": {
								"id": 399,
								"name": "Bidoof",
								"national_dex": 399,
								"type1": "Normal",
								"type2": "Normal",
								"egg_cycles": 14,
								"gender_ratio": 127,
								"growth_rate": "Medium Fast",
								"catch_rate": 255,
								"abilities": [
									"Simple",
									"Unaware"
								]
							},
							"was_fateful_encounter": false,
							"level": 11,
							"nature": "Naive",
							"characteristic": "Often dozes off"
						},
						{
							"ability": "Guts",
							"box_slot": 4,
							"checksum": "F0B5",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 1000,
								"next_level": 1331,
								"this_level": 1000,
								"remaining": 331
							},
							"form": 0,
							"friendship": 70,
							"gender": "Male",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 0,
							"ivs": {
								"attack": 28,
								"defense": 4,
								"hp": 16,
								"special_attack": 2,
								"special_defense": 14,
								"speed": 3
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 10,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 39,
									"pp": 30,
									"pp_up": 0,
									"name": "Tail Whip",
									"accuracy": 100,
									"base_power": 0,
									"type": "Normal"
								},
								{
									"id": 98,
									"pp": 30,
									"pp_up": 0,
									"name": "Quick Attack",
									"accuracy": 100,
									"base_power": 40,
									"type": "Normal"
								},
								{
									"id": 116,
									"pp": 30,
									"pp_up": 0,
									"name": "Focus Energy",
									"accuracy": 0,
									"base_power": 0,
									"type": "Normal"
								},
								{
									"id": 44,
									"pp": 25,
									"pp_up": 0,
									"name": "Bite",
									"accuracy": 100,
									"base_power": 60,
									"type": "Dark"
								}
							],
							"name": "Rattata",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 769238013,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 34124,
							"species": {
								"id": 19,
								"name": "Rattata",
								"national_dex": 19,
								"type1": "Normal",
								"type2": "Normal",
								"egg_cycles": 14,
								"gender_ratio": 127,
								"growth_rate": "Medium Fast",
								"catch_rate": 255,
								"abilities": [
									"Hustle",
									"Guts"
								]
							},
							"was_fateful_encounter": false,
							"level": 10,
							"nature": "Jolly",
							"characteristic": "Likes to fight"
						},
						{
							"ability": "Simple",
							"box_slot": 5,
							"checksum": "D69F",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 1000,
								"next_level": 1331,
								"this_level": 1000,
								"remaining": 331
							},
							"form": 0,
							"friendship": 70,
							"gender": "Male",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 1,
							"ivs": {
								"attack": 16,
								"defense": 20,
								"hp": 6,
								"special_attack": 17,
								"special_defense": 26,
								"speed": 21
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 10,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 33,
									"pp": 35,
									"pp_up": 0,
									"name": "Tackle",
									"accuracy": 100,
									"base_power": 50,
									"type": "Normal"
								},
								{
									"id": 45,
									"pp": 40,
									"pp_up": 0,
									"name": "Growl",
									"accuracy": 100,
									"base_power": 0,
									"type": "Normal"
								},
								{
									"id": 111,
									"pp": 40,
									"pp_up": 0,
									"name": "Defense Curl",
									"accuracy": 0,
									"base_power": 0,
									"type": "Normal"
								}
							],
							"name": "U0Z M5OW N",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 2234363846,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 8579,
							"species": {
								"id": 399,
								"name": "Bidoof",
								"national_dex": 399,
								"type1": "Normal",
								"type2": "Normal",
								"egg_cycles": 14,
								"gender_ratio": 127,
								"growth_rate": "Medium Fast",
								"catch_rate": 255,
								"abilities": [
									"Simple",
									"Unaware"
								]
							},
							"was_fateful_encounter": false,
							"level": 10,
							"nature": "Gentle",
							"characteristic": "Somewhat vain"
						},
						{
							"ability": "Unburden",
							"box_slot": 6,
							"checksum": "BD1B",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 967,
								"next_level": 1230,
								"this_level": 967,
								"remaining": 263
							},
							"form": 0,
							"friendship": 70,
							"gender": "Male",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 1,
							"ivs": {
								"attack": 1,
								"defense": 20,
								"hp": 30,
								"special_attack": 12,
								"special_defense": 8,
								"speed": 3
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 12,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 132,
									"pp": 35,
									"pp_up": 0,
									"name": "Constrict",
									"accuracy": 100,
									"base_power": 10,
									"type": "Normal"
								},
								{
									"id": 107,
									"pp": 20,
									"pp_up": 0,
									"name": "Minimize",
									"accuracy": 0,
									"base_power": 0,
									"type": "Normal"
								},
								{
									"id": 310,
									"pp": 15,
									"pp_up": 0,
									"name": "Astonish",
									"accuracy": 100,
									"base_power": 30,
									"type": "Ghost"
								},
								{
									"id": 16,
									"pp": 35,
									"pp_up": 0,
									"name": "Gust",
									"accuracy": 100,
									"base_power": 40,
									"type": "Flying"
								}
							],
							"name": "AAaaaaa-a",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 3626791603,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 41463,
							"species": {
								"id": 425,
								"name": "Drifloon",
								"national_dex": 425,
								"type1": "Ghost",
								"type2": "Flying",
								"egg_cycles": 29,
								"gender_ratio": 127,
								"growth_rate": "Fluctuating",
								"catch_rate": 125,
								"abilities": [
									"Aftermath",
									"Unburden"
								]
							},
							"was_fateful_encounter": false,
							"level": 12,
							"nature": "Adamant",
							"characteristic": "Loves to eat"
						},
						{
							"ability": "Tangled Feet",
							"box_slot": 7,
							"checksum": "558",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 1,
								"defense": 0,
								"hp": 0,
								"special_attack": 1,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 853,
								"next_level": 973,
								"this_level": 742,
								"remaining": 120
							},
							"form": 0,
							"friendship": 112,
							"gender": "Male",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 0,
							"ivs": {
								"attack": 10,
								"defense": 5,
								"hp": 17,
								"special_attack": 17,
								"special_defense": 15,
								"speed": 3
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 10,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 355,
									"pp": 10,
									"pp_up": 0,
									"name": "Roost",
									"accuracy": 0,
									"base_power": 0,
									"type": "Flying"
								},
								{
									"id": 16,
									"pp": 35,
									"pp_up": 0,
									"name": "Gust",
									"accuracy": 100,
									"base_power": 40,
									"type": "Flying"
								},
								{
									"id": 28,
									"pp": 15,
									"pp_up": 0,
									"name": "Sand-Attack",
									"accuracy": 100,
									"base_power": 0,
									"type": "Ground"
								},
								{
									"id": 365,
									"pp": 20,
									"pp_up": 0,
									"name": "Pluck",
									"accuracy": 100,
									"base_power": 60,
									"type": "Flying"
								}
							],
							"name": "Pidgey",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 393083027,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 58518,
							"species": {
								"id": 16,
								"name": "Pidgey",
								"national_dex": 16,
								"type1": "Normal",
								"type2": "Flying",
								"egg_cycles": 14,
								"gender_ratio": 127,
								"growth_rate": "Medium Slow",
								"catch_rate": 255,
								"abilities": [
									"Keen Eye",
									"Tangled Feet"
								]
							},
							"was_fateful_encounter": false,
							"level": 11,
							"nature": "Brave",
							"characteristic": "Often scatters things"
						},
						{
							"ability": "Hustle",
							"box_slot": 8,
							"checksum": "4DD9",
							"condition": {
								"beauty": 0,
								"coolness": 0,
								"cuteness": 0,
								"feel": 0,
								"smartness": 0,
								"toughness": 0
							},
							"evs": {
								"attack": 0,
								"defense": 0,
								"hp": 0,
								"special_attack": 0,
								"special_defense": 0,
								"speed": 0
							},
							"experience": {
								"current": 729,
								"next_level": 1000,
								"this_level": 729,
								"remaining": 271
							},
							"form": 0,
							"friendship": 105,
							"gender": "Male",
							"held_item": {
								"id": 0,
								"name": "None"
							},
							"is_egg": false,
							"is_nicknamed": 0,
							"ivs": {
								"attack": 30,
								"defense": 20,
								"hp": 19,
								"special_attack": 31,
								"special_defense": 29,
								"speed": 11
							},
							"language": 2,
							"leaves": 0,
							"markings": 0,
							"met": {
								"area_id": 204,
								"area_id_egg": 0,
								"caught_in": "Poké Ball",
								"date": "2018-04-15",
								"encounter_type": 5,
								"game": 8,
								"level": 9,
								"area_name": "Sprout Tower"
							},
							"moves": [
								{
									"id": 33,
									"pp": 35,
									"pp_up": 0,
									"name": "Tackle",
									"accuracy": 100,
									"base_power": 50,
									"type": "Normal"
								},
								{
									"id": 39,
									"pp": 30,
									"pp_up": 0,
									"name": "Tail Whip",
									"accuracy": 100,
									"base_power": 0,
									"type": "Normal"
								},
								{
									"id": 98,
									"pp": 30,
									"pp_up": 0,
									"name": "Quick Attack",
									"accuracy": 100,
									"base_power": 40,
									"type": "Normal"
								},
								{
									"id": 116,
									"pp": 30,
									"pp_up": 0,
									"name": "Focus Energy",
									"accuracy": 0,
									"base_power": 0,
									"type": "Normal"
								}
							],
							"name": "Rattata",
							"original_trainer": {
								"gender": "Male",
								"id": 46212,
								"name": "AAEFFFF",
								"secret": 49132
							},
							"personality_value": 691004140,
							"pokerus": {
								"cured": false,
								"days_left": 0,
								"infected": false,
								"strain": 0
							},
							"ribbons": [],
							"shiny": false,
							"shiny_value": 49323,
							"species": {
								"id": 19,
								"name": "Rattata",
								"national_dex": 19,
								"type1": "Normal",
								"type2": "Normal",
								"egg_cycles": 14,
								"gender_ratio": 127,
								"growth_rate": "Medium Fast",
								"catch_rate": 255,
								"abilities": [
									"Hustle",
									"Guts"
								]
							},
							"was_fateful_encounter": false,
							"level": 9,
							"nature": "Modest",
							"characteristic": "Mischievous"
						}
					],
					"box_count": 8,
					"box_name": "BOX 1",
					"box_number": 1
				},
				{
					"box_address": 36227332,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 2",
					"box_number": 2
				},
				{
					"box_address": 36231428,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 3",
					"box_number": 3
				},
				{
					"box_address": 36235524,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 4",
					"box_number": 4
				},
				{
					"box_address": 36239620,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 5",
					"box_number": 5
				},
				{
					"box_address": 36243716,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 6",
					"box_number": 6
				},
				{
					"box_address": 36247812,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 7",
					"box_number": 7
				},
				{
					"box_address": 36251908,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 8",
					"box_number": 8
				},
				{
					"box_address": 36256004,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 9",
					"box_number": 9
				},
				{
					"box_address": 36260100,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 10",
					"box_number": 10
				},
				{
					"box_address": 36264196,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 11",
					"box_number": 11
				},
				{
					"box_address": 36268292,
					"box_contents": [],
					"box_count": 0,
					"box_name": "BOX 12",
					"box_number": 12
				},
			],
		},
	}, data) });
}