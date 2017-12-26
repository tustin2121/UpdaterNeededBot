// test newspress/Ledger.js
// Unit test cases for the Ledger

const { should, sinon } = require('../common');

const { Ledger, LedgerItem } = require('../../src/newspress/ledger');

// Mock LedgerItems
class TestItemA extends LedgerItem {
	constructor() {
		super(1);
	}
}
class TestItemB extends LedgerItem {
	constructor() {
		super(1);
	}
}
class TestItemC extends LedgerItem {
	constructor() {
		super(2);
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

describe('Ledger', function(){
	it('can be constructed without error', function(){
		let ledger = new Ledger();
		
		should.exist(ledger);
		should.exist(ledger.log);
		ledger.length.should.be.exactly(0);
	});
	
	it('can hold LedgerItems', function(){
		let ledger = new Ledger();
		ledger.addItem(new TestItemA());
		ledger.addItem(new TestItemB());
		
		ledger.length.should.be.exactly(2);
		ledger.list[0].should.be.an.instanceOf(TestItemA);
		ledger.list[1].should.be.an.instanceOf(TestItemB);
	});
	
	it('cannot hold other types', function(){
		let ledger = new Ledger();
		(()=>{ ledger.addItem(5); }).should.throw(TypeError);
		(()=>{ ledger.addItem({}); }).should.throw(TypeError);
		(()=>{ ledger.addItem('Hello'); }).should.throw(TypeError);
		(()=>{ ledger.addItem(null); }).should.throw(TypeError);
		(()=>{ ledger.addItem(undefined); }).should.throw(TypeError);
	});
	
	it('allows items to be removed', function(){
		let ledger = new Ledger();
		let i1 = new TestItemB();
		ledger.addItem(i1);
		ledger.addItem(new TestItemA());
		
		ledger.length.should.be.exactly(2);
		ledger.list[0].should.be.an.instanceOf(TestItemB);
		ledger.list[1].should.be.an.instanceOf(TestItemA);
		
		ledger.removeItem(i1);
		
		ledger.length.should.be.exactly(1);
		ledger.list[0].should.be.an.instanceOf(TestItemA);
	});
	
	it('allows searching for items with a given name', function(){
		let ledger = new Ledger();
		ledger.addItem(new TestItemA());
		ledger.addItem(new TestItemB());
		ledger.addItem(new TestItemB());
		ledger.addItem(new TestItemC());
		
		let items = ledger.findAllItemsWithName('TestItemB');
		items.should.be.an.Array().with.length(2);
		items[0].should.be.an.instanceOf(TestItemB);
		items[1].should.be.an.instanceOf(TestItemB);
	});
});
