// test newspress/typesetter/TypeSetter.js
// Unit test cases for the TypeSetter system

const { should, sinon } = require('../../common');

const { LocationChanged } = require('../../../src/newspress/ledger');
const { SortedLocation } = require('../../../src/api/pokedata');
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
