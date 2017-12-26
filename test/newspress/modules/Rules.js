// test newspress/modules/Rules.js
// Unit test cases for the second-pass Rules system

const { should, sinon } = require('../../common');

const { Ledger, LedgerItem } = require('../../../src/newspress/ledger');
const { Rule } = require('../../../src/newspress/modules/_base');

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
	constructor() {
		super(1);
		this.hello = 0;
	}
}

// Mock Ledger
function createTestLedger(items=[]) {
	let ledger = new Ledger();
	for (let item of items) {
		ledger.add(item);
	}
	sinon.spy(ledger, 'findAllItemsWithName');
	sinon.spy(ledger, 'addItem');
	sinon.spy(ledger, 'removeItem');
	return ledger;
}

describe('Rule', function(){
	describe('construction', function(){
		it('should create', function(){
			let rule = new Rule('New Rule');
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'New Rule');
		});
		
		it('allows chained conditions', function(){
			const cond = sinon.stub().returns(true);
			
			let rule = new Rule('Hello World')
				.when(cond);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(1);
			rule.should.have.property('resultBlocks').with.length(0);
			cond.should.not.be.called();
		});
		
		it('allows chained results', function(){
			const resb = sinon.stub();
			
			let rule = new Rule('Hello World')
				.then(resb);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(0);
			rule.should.have.property('resultBlocks').with.length(1);
			resb.should.not.be.called();
		});
		
		it('allows chained creation', function(){
			const cond = sinon.stub().returns(true);
			const resb = sinon.stub();
			
			let rule = new Rule('Hello World')
				.when(cond)
				.then(resb);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(1);
			rule.should.have.property('resultBlocks').with.length(1);
			cond.should.not.be.called();
			resb.should.not.be.called();
		});
		
		it('allows multiple conditions and result blocks', function(){
			const cond1 = sinon.stub().returns(true);
			const cond2 = sinon.stub().returns(true);
			const resb1 = sinon.stub();
			const resb2 = sinon.stub();
			
			let rule = new Rule('Hello World')
				.when(cond1)
				.when(cond2)
				.then(resb1)
				.then(resb2);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(2);
			rule.should.have.property('resultBlocks').with.length(2);
			cond1.should.not.be.called();
			cond2.should.not.be.called();
			resb1.should.not.be.called();
			resb2.should.not.be.called();
		});
	});
	
	describe('in general, a rule', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemA(),
				new TestItemB(),
				new TestItemC(),
			]);
		});
		
		it('runs when empty', function(){
			const rule = new Rule('Empty Rule');
			
			rule.apply(ledger);
			
			ledger.list[0].should.be.an.instanceOf(TestItemA);
			ledger.list[1].should.be.an.instanceOf(TestItemB);
			ledger.list[2].should.be.an.instanceOf(TestItemC);
		});
		
		it('checks conditions until false', function(){
			const c1 = sinon.spy((lg)=>lg.has('TestItemA'));
			const c2 = sinon.stub().returns(true);
			const c3 = sinon.stub().returns(false);
			const c4 = sinon.stub().returns(true);
			
			const rule = new Rule('Condition check')
				.when(c1)
				.when(c2)
				.when(c3)
				.when(c4);
			
			rule.apply(ledger);
			
			should.ok(c1.called, 'Condition 1 was not called!');
			should.ok(c2.called, 'Condition 2 was not called!');
			should.ok(c3.called, 'Condition 3 was not called!');
			should.ok(c4.notCalled, 'Condition 4 was called!');
			
			should.ok(c1.calledBefore(c2), 'Condition 1 and 2 called out of order!');
			should.ok(c2.calledBefore(c3), 'Condition 2 and 3 called out of order!');
		});
		
		it('runs all result blocks', function(){
			const r1 = sinon.stub();
			const r2 = sinon.stub();
			const r3 = sinon.stub();
			
			const rule = new Rule('Condition check')
				.when(()=>true)
				.then(r1)
				.then(r2)
				.then(r3);
			
			rule.apply(ledger);
			
			should.ok(r1.called, 'Result block 1 was not called!');
			should.ok(r2.called, 'Result block 2 was not called!');
			should.ok(r3.called, 'Result block 3 was not called!');
			
			should.ok(r1.calledBefore(r2), 'Result block 1 and 2 called out of order!');
			should.ok(r2.calledBefore(r3), 'Result block 1 and 2 called out of order!');
		});
		
		it('can access condition finds in the result blocks', function(){
			const c1 = sinon.spy((ledger)=>ledger.has('TestItemA'));
			const c2 = sinon.spy((ledger)=>ledger.has('TestItemB'));
			
			const rule = new Rule('Condition check')
				.when(c1)
				.when(c2)
				.then((lgr)=>{
					let m1 = lgr.get(0);
					let m2 = lgr.get(1);
					
					lgr.ledger.should.equal(ledger);
					m1.should.be.an.Array().and.containDeepOrdered([ledger.list[0]]);
					m2.should.be.an.Array().and.containDeepOrdered([ledger.list[1]]);
				});
			
			rule.apply(ledger);
			
		});
	});
	
	describe('with a simple ledger, a rule', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemA(),
				new TestItemB(),
			]);
		});
		
		it('can add ledger items', function(){
			const rule = new Rule('Empty Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.add(new TestItemC());
				});
			
			rule.apply(ledger);
			
			ledger.list[0].should.be.an.instanceOf(TestItemA);
			ledger.list[1].should.be.an.instanceOf(TestItemB);
			ledger.list[2].should.be.an.instanceOf(TestItemC);
		});
		
		it('can affect existing ledger items', function(){
			const rule = new Rule('Empty Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.get(0)[0].flavor = 'hello';
				});
			
			rule.apply(ledger);
			
			ledger.list[0].should.be.an.instanceOf(TestItemA)
				.and.have.property('flavor', 'hello');
			ledger.list[1].should.be.an.instanceOf(TestItemB)
				.and.have.property('flavor', null);
		});
		
		it('can replace ledger items', function(){
			const rule = new Rule('Empty Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.getAndRemove(0);
					ledger.add(new TestItemC());
				});
			
			rule.apply(ledger);
			
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemC);
		});
		
		it('can check multiple ledger items', function(){
			const rule = new Rule('Empty Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.when((ledger)=>ledger.has('TestItemB'))
				.then((ledger)=>{
					ledger.get(0)[0].flavor = 'hello';
					ledger.get(1)[0].flavor = 'world';
				});
			
			rule.apply(ledger);
			
			ledger.list[0].should.be.an.instanceOf(TestItemA)
				.and.have.property('flavor', 'hello');
			ledger.list[1].should.be.an.instanceOf(TestItemB)
				.and.have.property('flavor', 'world');
		});
		
		it('can run multiple result blocks', function(){
			const rule = new Rule('Empty Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.add(new TestItemC());
				})
				.then((ledger)=>{
					ledger.add(new TestItemD());
				});
			
			rule.apply(ledger);
			
			ledger.list[0].should.be.an.instanceOf(TestItemA);
			ledger.list[1].should.be.an.instanceOf(TestItemB);
			ledger.list[2].should.be.an.instanceOf(TestItemC);
			ledger.list[3].should.be.an.instanceOf(TestItemD);
		});
		
		
	});
});
