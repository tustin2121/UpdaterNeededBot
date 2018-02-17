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

function createTestLedger(items=[], postponed=[]) {
	let ledger = new Ledger();
	ledger.list.push(...items);
	ledger.postponeList.push(...postponed);
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
	describe('#postponeItem', function(){
		
		it('postpones an item already in the ledger', function(){
			const item = new TestItemA();
			const ledger = createTestLedger([ item ]);
			
			ledger.postponeItem(item);
			
			ledger.length.should.be.exactly(0);
			ledger.postponeList.should.be.length(1);
			ledger.postponeList[0].should.be.exactly(item);
		});
		
		it('should not postpone items which do not wish to be', function(){
			class PostponeItem extends LedgerItem {
				constructor() {
					super(0);
				}
				canPostpone() {
					return false;
				}
			}
			
			const item = new PostponeItem('hello');
			const ledger = createTestLedger([ item ]);
			
			ledger.postponeItem(item);
			
			ledger.length.should.be.exactly(1);
			ledger.postponeList.should.have.length(0);
			ledger.list[0].should.be.exactly(item);
		});
		
		it('should postpone a different item when given it', function(){
			class TestPostponeItem extends LedgerItem {
				constructor() {
					super(0);
				}
				canPostpone() {
					return this.pitem = new TestItemA();
				}
			}
			
			const item = new TestPostponeItem('hello');
			const ledger = createTestLedger([ item ]);
			
			ledger.postponeItem(item);
			
			ledger.length.should.be.exactly(1);
			ledger.postponeList.should.have.length(1);
			ledger.list[0].should.be.exactly(item);
			ledger.postponeList[0].should.be.exactly(item.pitem);
		});
	});
	describe('#addPostponedItems', function(){
		class TestMergeItem extends LedgerItem {
			constructor() {
				super(0);
			}
			cancelsOut(other) {
				if (other.name !== 'TestMergeItem') return false;
				return this;
			}
		}
		class TestCancelItem extends LedgerItem {
			constructor() {
				super(1);
			}
			cancelsOut(other) {
				if (other.name !== 'TestCancelItem') return false;
				return true;
			}
		}
		class TestPostponeItem extends LedgerItem {
			constructor() {
				super(0);
			}
			canPostpone() {
				return this.pitem = new TestItemA();
			}
		}
		
		it('should add postponed items from the previous ledger into the current', function(){
			const prevLedger = createTestLedger([
				new TestItemA(),
			], [
				new TestItemC(),
			]);
			const ledger = createTestLedger([
				new TestItemB(),
				new TestItemB(),
			]);
        
			ledger.addPostponedItems(prevLedger);
        
			ledger.length.should.be.exactly(3);
			ledger.postponeList.should.have.length(0);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemB);
			ledger.list[2].should.be.an.instanceOf(TestItemC);
		});
		it('should cancel items that cancel out', function(){
			const prevLedger = createTestLedger([
				new TestItemA(),
			], [
				new TestCancelItem(),
			]);
			const ledger = createTestLedger([
				new TestItemB(),
				new TestItemC(),
				new TestCancelItem(),
			]);
        
			ledger.addPostponedItems(prevLedger);
        
			ledger.length.should.be.exactly(2);
			ledger.postponeList.should.have.length(0);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemC);
		});
		it('should merge items that merge together', function(){
			let item;
			const prevLedger = createTestLedger([
				new TestItemA(),
			], [
				new TestMergeItem(),
			]);
			const ledger = createTestLedger([
				new TestItemB(),
				new TestItemC(),
				item = new TestMergeItem(),
			]);
        
			ledger.addPostponedItems(prevLedger);
        
			ledger.length.should.be.exactly(3);
			ledger.postponeList.should.have.length(0);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemC);
			ledger.list[2].should.be.an.exactly(item);
		});
		it('should not be affected by custom postpones', function(){
			let item;
			const prevLedger = createTestLedger([
				new TestItemA(),
			], [
				item = new TestPostponeItem(),
			]);
			const ledger = createTestLedger([
				new TestItemB(),
				new TestItemC(),
			]);
        
			ledger.addPostponedItems(prevLedger);
        
			ledger.length.should.be.exactly(3);
			ledger.postponeList.should.have.length(0);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemC);
			ledger.list[2].should.be.an.exactly(item);
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
