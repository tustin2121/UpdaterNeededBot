// test newspress/typesetter/TypeSetter.js
// Unit test cases for the TypeSetter system

const { should, sinon } = require('../../common');

const LEDGER_ITEMS = require('../../../src/newspress/ledger');
const POKEDATA = require('../../../src/api/pokedata');

const { LocationChanged, MonLeveledUp, } = LEDGER_ITEMS;
const { SortedLocation, Pokemon } = POKEDATA;

const TYPESET = require('../../../src/newspress/typesetter');

const log = {
	typesetterInput(){},
	typesetterFormat(){},
	typesetterOutput(){},
};

describe('TypeSetter', function(){
	let typesetter;
	beforeEach(function(){
		let curr = new POKEDATA.SortedData({ data:{party:[], pc:{}} });
		typesetter = new TYPESET.TypeSetter(curr, log);
	});
	function setRandom(...val){
		let i = 0;
		typesetter.rand = (len)=>{
			//fix the random outcome
			return val[(i++)%val.length] % len;
		};
	}
	
	describe('#fillText', function(){
		it('should replace tags in text', function(){
			const exp = `The quick brown fox jumps over the lazy dog.`;
			const pre = `The {{@mon1.adj}} {{@mon1.name}} {{@verb}} over the {{@mon_2.adj}} {{@mon_2.name}}.`;
			const item = {
				verb: 'jumps',
				mon1: {
					name: 'fox',
					adj: 'quick brown',
				},
				mon_2: {
					name: 'dog',
					adj: 'lazy',
				},
			};
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('runs printDefiniteNoun functions', function(){
			const exp = `An apple a day keeps a doctor at bay.`;
			const pre = `{{An item|@prop}} a day keeps {{a noun|@person}} at bay.`;
			const item = {
				prop: 'apple',
				person: 'doctor',
			};
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('sets subject and runs pronoun functions (object)', function(){
			const exp = `Bulbasaur scratches himself behind the ear with his foot. He yawns and claims a patch of grass as his.`;
			const pre = `{{meta|$@mon}}{{@mon.species}} scratches {{them}}self behind the ear with {{their}} foot. {{They}} yawn{{*s}} and claim{{*s}} a patch of grass as {{theirs}}.`;
			const item = {
				mon: {
					species: 'Bulbasaur',
					gender: 'Male',
				},
			};
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
			should(typesetter.subject).equal(item.mon);
			should(typesetter.noun).be.null();
		});
		
		it('sets noun and runs pronoun functions (Pokemon w/gender)', function(){
			Bot.setOpt('gender',true);
			const exp = `Bulbasaur scratches himself behind the ear with his foot. He yawns and claims a patch of grass as his. He is content.`;
			const pre = `{{Mon|#@mon}} scratches {{them}}self behind the ear with {{their}} foot. {{They}} yawn{{*s}} and claim{{*s}} a patch of grass as {{theirs}}. {{They}} {{verb|is|are}} content.`;
			
			const mon = new Pokemon();
			mon.species = 'Bulbasaur';
			mon._gender = 'Male';
			const item = { mon };
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('runs pronoun functions (Pokemon w/o gender)', function(){
			Bot.setOpt('gender',false);
			const exp = `Bulbasaur scratches itself behind the ear with its foot. It stretches and claims a patch of grass as its.`;
			const pre = `{{Mon|@mon}} scratches {{them|@mon}}self behind the ear with {{their|@mon}} foot. {{They|@mon}} {{verb|stretches|stretch|@mon}} and claim{{*s|@mon}} a patch of grass as {{theirs|@mon}}.`;
			
			const mon = new Pokemon();
			mon.species = 'Bulbasaur';
			mon._gender = 'Male';
			const item = { mon };
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		// it('throws on unset pronouns', function(){
		// 	const pre = `There is {{|an}} item.`;
		// 	const item = { dummy:'' };
        //
		// 	(()=>{ typesetter.fillText(pre, item) }).should.throw(TypeError);
		// });
		
		// it('throws on malformatted replacements.', function(){
		// 	const pre = `There is {{dummy|an][,,]}} item.`;
		// 	const item = { dummy:'' };
		//
		// 	// (()=>{ typesetter.fillText(pre, item) }).should.throw(TypeError);
		// 	let res = typesetter.fillText(pre, item);
		//
		// 	res.should.equal(false);
		// });
		
		it('LocationChanged typesetter bug', function(){
			const exp = `We have moved to Route 101!`;
			const pre = `We have moved to {{the location|@curr}}!`;
			const item = new LocationChanged(
				new SortedLocation({ map_name:'Olivine City', map_bank:5, map_id:5, }),
				new SortedLocation({ map_name:'Route 101', map_bank:6, map_id:3, }));
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('MonLeveledUp output bug', function(){
			const exp = `Bulby (Ivysaur) has lost -10 levels, and is now level 5!`;
			const pre = `{{@target}} has lost {{some|@deltaLevel}} levels, and is now level {{@level}}!`;
			let pkmn = new Pokemon();
			{
				pkmn.name = 'Bulby';
				pkmn.species = 'Ivysaur'
				pkmn.level = 5;
			}
			const item = new MonLeveledUp(pkmn, 15);
			
			let res = typesetter.fillText(pre, item);
			
			res.should.equal(exp);
		});
	});
	
	describe('formatFor', function(){
		const formatReddit = TYPESET.formatFor.reddit;
		const formatDiscord = TYPESET.formatFor.discord;
		
		it('should handle <b>bold</b> tags (Reddit)', function(){
			const exp = `Hello world **and all** good people **faces**.`;
			const pre = `Hello world <b>and all</b> good people <b>faces</b>.`;
			
			let res = formatReddit(pre);
			
			res.should.be.an.Object().with.key('text');
			res.text.should.equal(exp);
		});
		
		it('should handle <b>bold</b> tags (Discord)', function(){
			const exp = `Hello world **and all** good people **faces**.`;
			const pre = `Hello world <b>and all</b> good people <b>faces</b>.`;
			
			let res = formatDiscord(pre);
			
			res.should.be.an.Object().with.keys('text', 'embeds');
			res.text.should.equal(exp);
			res.embeds.should.be.an.Array().with.length(0);
		});
		
		it('should handle <i>italics</i> tags (Reddit)', function(){
			const exp = `Hello world *and all* good people *faces*.`;
			const pre = `Hello world <i>and all</i> good people <i>faces</i>.`;
			
			let res = formatReddit(pre);
			
			res.should.be.an.Object().with.key('text');
			res.text.should.equal(exp);
		});
		
		it('should handle <i>italics</i> tags (Discord)', function(){
			const exp = `Hello world *and all* good people *faces*.`;
			const pre = `Hello world <i>and all</i> good people <i>faces</i>.`;
			
			let res = formatDiscord(pre);
			
			res.should.be.an.Object().with.keys('text', 'embeds');
			res.text.should.equal(exp);
			res.embeds.should.be.an.Array().with.length(0);
		});
		
		it('should handle <info>info</info> tags (Reddit)', function(){
			const exp = `This is a [test](#info "of the emergency broadcast system").`;
			const pre = `This is a <info ext="of the emergency broadcast system">test</info>.`;
			
			let res = formatReddit(pre);
			
			res.should.be.an.Object().with.key('text');
			res.text.should.equal(exp);
		});
		
		it('should handle <info>info</info> tags (Discord)', function(){
			const exp1 = `This is a test.`;
			const exp2 = [{ name:'test', value:'of the emergency broadcast system' }];
			const pre = `This is a <info ext="of the emergency broadcast system">test</info>.`;
			
			let res = formatDiscord(pre);
			
			res.should.be.an.Object().with.keys('text', 'embeds');
			res.text.should.equal(exp1);
			res.embeds.should.be.an.Array().with.length(1);
			res.embeds.should.deepEqual(exp2);
		});
		
		it('should handle <info>info</info> inside <b>bold</b> tags (Reddit)', function(){
			const exp = `**This is a [test](#info "of the emergency broadcast system").**`;
			const pre = `<b>This is a <info ext="of the emergency broadcast system">test</info>.</b>`;
			
			let res = formatReddit(pre);
			
			res.should.be.an.Object().with.key('text');
			res.text.should.equal(exp);
		});
		
		it('should handle <info>info</info> inside <b>bold</b> tags (Discord)', function(){
			const exp1 = `**This is a test.**`;
			const exp2 = [{ name:'test', value:'of the emergency broadcast system' }];
			const pre = `<b>This is a <info ext="of the emergency broadcast system">test</info>.</b>`;
			
			let res = formatDiscord(pre);
			
			res.should.be.an.Object().with.keys('text', 'embeds');
			res.text.should.equal(exp1);
			res.embeds.should.be.an.Array().with.length(1);
			res.embeds.should.deepEqual(exp2);
		});
		
		it('should handle <info>multiline info</info> inside <b>bold</b> tags (Reddit)', function(){
			const exp = `**This is a [test](#info "of the emergency\nbroadcast\nsystem").**`;
			const pre = `<b>This is a <info ext="of the emergency\nbroadcast\nsystem">test</info>.</b>`;
			
			let res = formatReddit(pre);
			
			res.should.be.an.Object().with.key('text');
			res.text.should.equal(exp);
		});
		
		it('should handle <info>multiline info</info> inside <b>bold</b> tags (Discord)', function(){
			const exp1 = `**This is a test.**`;
			const exp2 = [{ name:'test', value:'of the emergency\nbroadcast\nsystem' }];
			const pre = `<b>This is a <info ext="of the emergency\nbroadcast\nsystem">test</info>.</b>`;
			
			let res = formatDiscord(pre);
			
			res.should.be.an.Object().with.keys('text', 'embeds');
			res.text.should.equal(exp1);
			res.embeds.should.be.an.Array().with.length(1);
			res.embeds.should.deepEqual(exp2);
		});
	});
	
	describe('#typesetItems', function(){
		it('E4HallOfFame', function(){
			const { E4HallOfFame } = LEDGER_ITEMS;
			{
				const exp = `<b>We enter the HALL OF FAME!</b> ヽ༼ຈل͜ຈ༽ﾉ VICTORY RIOT ヽ༼ຈل͜ຈ༽ﾉ`;
				const item = new E4HallOfFame({ e4Attempts:42, champAttempts:6, rematchCount:0 });
				const str = typesetter.typesetItems([item]);
				str.should.be.exactly(exp);
			}{
				const exp = `<b>We enter the HALL OF FAME! Yet again!</b> ╰〳 ಠ 益 ಠೃ 〵╯ ELEVENTH VICTORY RIOT ╰〳 ಠ 益 ಠೃ 〵╯`;
				const item = new E4HallOfFame({ e4Attempts:42, champAttempts:6, rematchCount:10 });
				const str = typesetter.typesetItems([item]);
				str.should.be.exactly(exp);
			}
		});
		
		it('GainItem', function(){
			const { GainItem } = LEDGER_ITEMS;
			const { Item } = POKEDATA;
			setRandom(0);
        
			const exp = `<b>Acquired 5 Great Balls, 8 Potions, and an Antidote!</b>`;
			const items = [
				new GainItem(new Item({name:'Great Ball'}), 5),
				new GainItem(new Item({name:'Potion'}), 8),
				new GainItem(new Item({name:'Antidote'}), 1),
			];
        
			const str = typesetter.typesetItems(items);
        
			str.should.be.exactly(exp);
		});
		
		it('UsedBallInBattle : trainer (Trainer Class Lists)', function(){
			const { UsedBallInBattle } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			Bot.setOpt('trainerClasses', { m:{4:true}, f:{}, p:{}, });
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 4,
					class_name: 'Youngster',
					name: 'Joey',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Rattata' },
					}
				],
			});
			battle.isImportant = true; //hack
        	setRandom(0);
			
			const exp = `We toss a Poke Ball at the trainer's pokemon, but he blocks the ball. Don't be a thief!`;
			const item = new UsedBallInBattle({name:'Poke Ball'}, battle);
			item.flavor = 'trainer';
        
			const str = typesetter.typesetItems([item]);
        
			str.should.be.exactly(exp);
		});
		
		it('UsedBallInBattle : trainer (Individual Class Info)', function(){
			const { UsedBallInBattle } = LEDGER_ITEMS;
			const { SortedBattle } = POKEDATA;
			Bot.setOpt('trainerClasses', { info:[ {}, {}, {}, {},
				{ id:4, gender:'m', name: "Youngster", important:true, } 
			] });
			const battle = new SortedBattle({
				enemy_trainer: {
					class_id: 4,
					class_name: 'Youngster',
					name: 'Joey',
				},
				enemy_party: [
					{
						active: true,
						health: [10,10],
						species: { id:5, name:'Rattata' },
					}
				],
			});
        	setRandom(0);
			
			const exp = `We toss a Poke Ball at the trainer's pokemon, but he blocks the ball. Don't be a thief!`;
			const item = new UsedBallInBattle({name:'Poke Ball'}, battle);
			item.flavor = 'trainer';
        
			const str = typesetter.typesetItems([item]);
        
			str.should.be.exactly(exp);
		});
		
		it('multiple PokemonGained', function(){
			const { PokemonGained } = LEDGER_ITEMS;
			Bot._gameInfo = { trainer:{id:46212,secret:49132}, gen:4 };
			Bot.setOpt('gender', true);
			Bot.setOpt('heldItem', true);
			Bot.setOpt('caughtInfo', true);
			Bot.setOpt('shiny', true);
			Bot.setOpt('specialSplit', true);
			Bot.setOpt('abilities', true);
			Bot.setOpt('natures', true);
			Bot.setOpt('characteristics', true);
			
			const exp = `<b>Caught a <info ext="Bug | Item: [NoItem] | Ability: Sturdy | Nature: Lax, Alert to sounds
Caught In: Poké Ball | Moves: Protect, Selfdestruct, Bug Bite, Take Down
HP: 0 | ATK: 0 | DEF: 0 | SPA: 0 | SPD: 0 | SPE: 0">male Lv. 14 Pineco</info>!</b> Nickname: \`A\` <b>Caught a <info ext="Bug | Item: [NoItem] | Ability: Sturdy | Nature: Lax, Alert to sounds
Caught In: Poké Ball | Moves: Protect, Selfdestruct, Bug Bite, Take Down
HP: 0 | ATK: 0 | DEF: 0 | SPA: 0 | SPD: 0 | SPE: 0">male Lv. 14 Pineco</info>!</b> Nickname: \`A\``;
			const items = [
				new PokemonGained(new Pokemon({
					"ability":"Sturdy","box_slot":25,"checksum":"8A9B","condition":{"beauty":0,"coolness":0,"cuteness":0,"feel":0,"smartness":0,"toughness":0},"evs":{"attack":0,"defense":0,"hp":0,"special_attack":0,"special_defense":0,"speed":0},"experience":{"current":2744,"next_level":3375,"this_level":2744,"remaining":631},"form":0,"friendship":70,"gender":"Male","held_item":{"id":0,"name":"None"},"is_egg":false,"is_nicknamed":1,"ivs":{"attack":12,"defense":1,"hp":7,"special_attack":23,"special_defense":11,"speed":26},"language":2,"leaves":0,"markings":0,"met":{"area_id":185,"area_id_egg":0,"caught_in":"Poké Ball","date":"2018-04-17","encounter_type":0,"game":8,"level":14,"area_name":"Route 37"},"moves":[{"id":182,"pp":10,"pp_up":0,"name":"Protect","accuracy":0,"base_power":0,"type":"Normal"},{"id":120,"pp":5,"pp_up":0,"name":"Selfdestruct","accuracy":100,"base_power":200,"type":"Normal"},{"id":450,"pp":20,"pp_up":0,"name":"Bug Bite","accuracy":100,"base_power":60,"type":"Bug"},{"id":36,"pp":20,"pp_up":0,"name":"Take Down","accuracy":85,"base_power":90,"type":"Normal"}],"name":"A","original_trainer":{"gender":"Male","id":46212,"name":"AAEFFFF","secret":49132},"personality_value":783310009,"pokerus":{"cured":false,"days_left":0,"infected":false,"strain":0},"ribbons":[],"shiny":false,"shiny_value":31073,"species":{"id":204,"name":"Pineco","national_dex":204,"type1":"Bug","type2":"Bug","egg_cycles":19,"gender_ratio":127,"growth_rate":"Medium Fast","catch_rate":190,"abilities":["Sturdy","-"]},"was_fateful_encounter":false,"level":14,"nature":"Lax","characteristic":"Alert to sounds"
				})),
				new PokemonGained(new Pokemon({
					"ability":"Sturdy","box_slot":25,"checksum":"8A9B","condition":{"beauty":0,"coolness":0,"cuteness":0,"feel":0,"smartness":0,"toughness":0},"evs":{"attack":0,"defense":0,"hp":0,"special_attack":0,"special_defense":0,"speed":0},"experience":{"current":2744,"next_level":3375,"this_level":2744,"remaining":631},"form":0,"friendship":70,"gender":"Male","held_item":{"id":0,"name":"None"},"is_egg":false,"is_nicknamed":1,"ivs":{"attack":12,"defense":1,"hp":7,"special_attack":23,"special_defense":11,"speed":26},"language":2,"leaves":0,"markings":0,"met":{"area_id":185,"area_id_egg":0,"caught_in":"Poké Ball","date":"2018-04-17","encounter_type":0,"game":8,"level":14,"area_name":"Route 37"},"moves":[{"id":182,"pp":10,"pp_up":0,"name":"Protect","accuracy":0,"base_power":0,"type":"Normal"},{"id":120,"pp":5,"pp_up":0,"name":"Selfdestruct","accuracy":100,"base_power":200,"type":"Normal"},{"id":450,"pp":20,"pp_up":0,"name":"Bug Bite","accuracy":100,"base_power":60,"type":"Bug"},{"id":36,"pp":20,"pp_up":0,"name":"Take Down","accuracy":85,"base_power":90,"type":"Normal"}],"name":"A","original_trainer":{"gender":"Male","id":46212,"name":"AAEFFFF","secret":49132},"personality_value":783310009,"pokerus":{"cured":false,"days_left":0,"infected":false,"strain":0},"ribbons":[],"shiny":false,"shiny_value":31073,"species":{"id":204,"name":"Pineco","national_dex":204,"type1":"Bug","type2":"Bug","egg_cycles":19,"gender_ratio":127,"growth_rate":"Medium Fast","catch_rate":190,"abilities":["Sturdy","-"]},"was_fateful_encounter":false,"level":14,"nature":"Lax","characteristic":"Alert to sounds"
				})),
			];
			
			let res = typesetter.typesetItems(items);
			
			res.should.equal(exp);
		});
		
		it('OptionsChanged', function(){
			const { Ledger, OptionsChanged } = LEDGER_ITEMS;
			
			let co = {
				"battle_style": "Set",
				"battle_scene": "On",
				"text_speed": "Med"
			};
			let item = new OptionsChanged(co);
			
			setRandom(0, 0, 0);
			let res = typesetter.typesetItems([ item ]);
			
			res.should.equal('We take a tour through the options screen and disallow battle switching, turn battle animations on, and adjust the text speed to med.');
		});
	});
});
