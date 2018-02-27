// test newspress/typesetter/TypeSetter.js
// Unit test cases for the TypeSetter system

const { should, sinon } = require('../../common');

const { LocationChanged, MonLeveledUp, } = require('../../../src/newspress/ledger');
const { SortedLocation, Pokemon } = require('../../../src/api/pokedata');
const TypeSetter = require('../../../src/newspress/typesetter');

describe('TypeSetter', function(){
	describe('fillText', function(){
		const fillText = TypeSetter._methods.fillText;
		
		it('should replace tags in text', function(){
			const exp = `The quick brown fox jumps over the lazy dog.`;
			const pre = `The {{mon1.adj}} {{mon1.name}} {{verb}} over the {{mon_2.adj}} {{mon_2.name}}.`;
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
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('runs {{an}} functions', function(){
			const exp = `An apple a day keeps a doctor at bay.`;
			const pre = `{{prop|An}} {{prop}} a day keeps {{person|an}} {{person}} at bay.`;
			const item = {
				prop: 'apple',
				person: 'doctor',
			};
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('runs {{them}} functions (object)', function(){
			const exp = `Bulbasaur scratches himself behind the ear with his foot. He yawns and claims a patch of grass as his.`;
			const pre = `{{mon.species}} scratches {{mon|them}}self behind the ear with {{mon|their}} foot. {{mon|They}} yawn{{mon|s}} and claim{{mon|s}} a patch of grass as {{mon|theirs}}.`;
			const item = {
				mon: {
					species: 'Bulbasaur',
					gender: 'Male',
				},
			};
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('runs {{them}} functions (Pokemon w/gender)', function(){
			Bot.setOpt('gender',true);
			const exp = `Bulbasaur scratches himself behind the ear with his foot. He yawns and claims a patch of grass as his. He is content.`;
			const pre = `{{mon.species}} scratches {{mon|them}}self behind the ear with {{|their}} foot. {{|They}} yawn{{|s}} and claim{{|s}} a patch of grass as {{|theirs}}. {{|They}} {{|verb[is/are]}} content.`;
			
			const mon = new Pokemon();
			mon.species = 'Bulbasaur';
			mon._gender = 'Male';
			const item = { mon };
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('runs {{them}} functions (Pokemon w/o gender)', function(){
			Bot.setOpt('gender',false);
			const exp = `Bulbasaur scratches itself behind the ear with its foot. It stretches and claims a patch of grass as its.`;
			const pre = `{{mon.species}} scratches {{mon|them}}self behind the ear with {{mon|their}} foot. {{mon|They}} stretch{{|es}} and claim{{mon|s}} a patch of grass as {{mon|theirs}}.`;
			
			const mon = new Pokemon();
			mon.species = 'Bulbasaur';
			mon._gender = 'Male';
			const item = { mon };
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		// it('throws on unset pronouns', function(){
		// 	const pre = `There is {{|an}} item.`;
		// 	const item = { dummy:'' };
        //
		// 	(()=>{ fillText(pre, item) }).should.throw(TypeError);
		// });
		
		it('throws on malformatted replacements.', function(){
			const pre = `There is {{dummy|an][,,]}} item.`;
			const item = { dummy:'' };
			
			(()=>{ fillText(pre, item) }).should.throw(TypeError);
		});
		
		// it('runs {{pronoun}} functions', function(){
		// 	const exp = `He said that she said that `;
		// 	const pre = ``;
		// 	const item = {
		// 	};
        //
		// 	let res = fillText(pre, item);
        //
		// 	res.should.equal(exp);
		// });
		
		it('LocationChanged typesetter bug', function(){
			const exp = `We have moved to Route 101!`;
			const pre = `We have moved to {{curr}}!`;
			const item = new LocationChanged(
				new SortedLocation({ map_name:'Olivine City', map_bank:5, map_id:5, }),
				new SortedLocation({ map_name:'Route 101', map_bank:6, map_id:3, }));
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
		
		it('MonLeveledUp output bug', function(){
			const exp = `Bulby (Ivysaur) has lost -10 levels, and is now level 5!`;
			const pre = `{{target}} has lost {{deltaLevel|some}} levels, and is now level {{level}}!`;
			let pkmn = new Pokemon();
			{
				pkmn.name = 'Bulby';
				pkmn.species = 'Ivysaur'
				pkmn.level = 5;
			}
			const item = new MonLeveledUp(pkmn, 15);
			
			let res = fillText(pre, item);
			
			res.should.equal(exp);
		});
	});
	
	describe('formatFor', function(){
		const formatReddit = TypeSetter.formatFor.reddt;
		const formatDiscord = TypeSetter.formatFor.discord;
		
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
});
