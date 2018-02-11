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
});
