// test newspress/Ledger.js
// Unit test cases for the Ledger

const { should, sinon } = require('../common');

const { Ledger, LedgerItem } = require('../../src/newspress/ledger');

// Mock LedgerItems
class TestItemA extends LedgerItem {
	constructor() {
		super(1, { sort:1 });
	}
}
class TestItemB extends LedgerItem {
	constructor() {
		super(1, { sort:0 });
	}
}
class TestItemC extends LedgerItem {
	constructor() {
		super(2, { sort:-1 });
	}
}
class TestItemD extends LedgerItem {
	constructor(hello) {
		super(1);
		this.hello = hello;
	}
}
class TestContextItem extends LedgerItem {
	constructor(type) {
		super(0);
		this.type = type;
	}
}

function createTestLedger(items=[]) {
	let ledger = new Ledger();
	ledger.list.push(...items);
	return ledger;
}

describe('Ledger', function(){
	it('can be constructed without error', function(){
		let ledger = new Ledger();
		
		should.exist(ledger);
		should.exist(ledger.log);
		ledger.length.should.be.exactly(0);
	});
	
	describe('#addItem', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemA(),
			]);
		});
		
		it('allows LedgerItems', function(){
			ledger.addItem(new TestItemB());
			
			ledger.length.should.be.exactly(2);
			ledger.list[0].should.be.an.instanceOf(TestItemA);
			ledger.list[1].should.be.an.instanceOf(TestItemB);
		});
		
		it('disallows other types', function(){
			(()=>{ ledger.addItem(5); }).should.throw(TypeError);
			(()=>{ ledger.addItem({}); }).should.throw(TypeError);
			(()=>{ ledger.addItem('Hello'); }).should.throw(TypeError);
			(()=>{ ledger.addItem(null); }).should.throw(TypeError);
			(()=>{ ledger.addItem(undefined); }).should.throw(TypeError);
		});
	});
	describe('#removeItem', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemB(),
				new TestItemA(),
			]);
		});
		
		it('removes items', function(){
			let i1 = ledger.list[0];
			
			ledger.removeItem(i1);
			
			ledger.length.should.be.exactly(1);
			ledger.list[0].should.be.an.instanceOf(TestItemA);
		});
		
		it('does nothing if it cannot find the item', function(){
			let i1 = new TestItemA();
			
			ledger.removeItem(i1);
			
			ledger.length.should.be.exactly(2);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemA);
		});
		
		it('does nothing if passed null', function(){
			ledger.removeItem(null);
			
			ledger.length.should.be.exactly(2);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemA);
		});
	});
	describe('#findAllItemsWithName', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemA(),
				new TestItemB(),
				new TestItemB(),
				new TestItemC(),
			]);
		});
		
		it('finds all items with a given name', function(){
			let items = ledger.findAllItemsWithName('TestItemB');
			
			items.should.be.an.Array().with.length(2);
			items[0].should.be.an.instanceOf(TestItemB);
			items[1].should.be.an.instanceOf(TestItemB);
		});
	});
	describe('#finalize', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemB(),
				new TestItemD('world'),
				new TestItemB(),
				new TestContextItem(),
				new TestItemC(),
				new TestItemA(),
				new TestItemB(),
				new TestItemD('hello'),
				new TestContextItem(),
			]);
		});
		
		it('sorts items and drops items with less than 1 importance', function(){
			ledger.finalize();
			
			ledger.list.should.have.length(7);
			ledger.list[0].should.be.an.instanceOf(TestItemC);
			ledger.list[1].should.be.an.instanceOf(TestItemA);
			ledger.list[2].should.be.an.instanceOf(TestItemB);
			ledger.list[3].should.be.an.instanceOf(TestItemD);
			ledger.list[4].should.be.an.instanceOf(TestItemB);
			ledger.list[5].should.be.an.instanceOf(TestItemB);
			ledger.list[6].should.be.an.instanceOf(TestItemD);
		});
	});
	
	describe('#hash', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemB(),
				new TestItemD('world'),
				new TestItemB(),
				new TestContextItem(),
				new TestItemC(),
				new TestItemA(),
				new TestItemB(),
				new TestItemD('hello'),
				new TestContextItem(),
			]);
		});
		
		it('should generate a hex string', function(){
			let h = ledger.hash();
			
			h.should.be.a.String();
			for(let i = 0; i < h.length; i+=4) {
				let n = Number.parseInt(h.substr(i, 4), 16);
				n.should.be.a.Number();
			}
		});
		
		it('should generate the same hash each time', function(){
			let h = ledger.hash();
			
			should.ok(h === ledger.hash(), `Hash does not match!`);
		});
	});
});
