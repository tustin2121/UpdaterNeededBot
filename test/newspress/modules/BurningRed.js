// test newspress/modules/BurningRed.js
// Unit test cases for real-world scenarios

const { should, sinon } = require('../../common');

const LEDGER_ITEMS = require('../../../src/newspress/ledger');
const POKEDATA = require('../../../src/api/pokedata');
const { Ledger } = LEDGER_ITEMS;

const ItemModule = require('../../../src/newspress/modules/Item');
const BurningRedModule = require('../../../src/newspress/modules/BurningRed');

const BEFORE = require('../../../samples/burningred/20190213_R_beforeWarp.json');
const AFTER = require('../../../samples/burningred/20190213_FR_afterWarp.json');

describe('Burning Red Tests', function(){
	let ledger;
	const prev_api = new POKEDATA.SortedData({ data:BEFORE });
	const curr_api = new POKEDATA.SortedData({ data:AFTER });
	
	const itemmodule = new ItemModule({},{});
	const brmodule = new BurningRedModule({},{});
	
	beforeEach(function(){
		ledger = new Ledger();
	});
	
	it('should run the burning rules right (FR->R)', function(){
		itemmodule.firstPass(ledger, { prev_api, curr_api })
		ledger.should.have.length(10);
		
		brmodule.firstPass(ledger, { prev_api, curr_api })
		ledger.should.have.length(13);
		
		// Second Pass: Modify the ledger items into more useful things
		let hash = ledger.hash();
		for (let i = 0; i < 10; i++) {
			brmodule.secondPass(ledger);
			itemmodule.secondPass(ledger);
			
			let nhash = ledger.hash();
			if (hash === nhash) break; //If the ledger hasn't changed, break
			i.should.be.lessThan(9);
			hash = nhash;
		}
		
		ledger.should.have.length(3);
		
	});
});