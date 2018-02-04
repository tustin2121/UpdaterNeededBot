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
	constructor(obj) {
		super(1);
		this.obj = obj;
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
class TestItem1 extends LedgerItem {
	constructor(a) {
		super(1);
		this.a = a;
	}
}
class TestItem2 extends LedgerItem {
	constructor(a, b) {
		super(1);
		this.a = a;
		this.b = b;
	}
}
class TestItem3 extends LedgerItem {
	constructor(a) {
		super(1);
		this.a = a;
	}
}
class TestItem4 extends LedgerItem {
	constructor(a) {
		super(1);
		this.a = a;
	}
}
class TestContextItem extends LedgerItem {
	constructor(type) {
		super(0);
		this.type = type;
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
	describe('Construction', function(){
		it('should create', function(){
			let rule = new Rule('New Rule');
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'New Rule');
		});
		
		it('allows chained conditions', function(){
			const c1 = sinon.stub().returns(true);
			
			let rule = new Rule('Hello World')
				.when(c1);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(1);
			rule.should.have.property('resultBlocks').with.length(0);
			c1.should.not.have.been.called();
		});
		
		it('allows chained results', function(){
			const r1 = sinon.stub();
			
			let rule = new Rule('Hello World')
				.then(r1);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(0);
			rule.should.have.property('resultBlocks').with.length(1);
			r1.should.not.have.been.called();
		});
		
		it('allows chained creation', function(){
			const c1 = sinon.stub().returns(true);
			const r1 = sinon.stub();
			
			let rule = new Rule('Hello World')
				.when(c1)
				.then(r1);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(1);
			rule.should.have.property('resultBlocks').with.length(1);
			c1.should.not.have.been.called();
			r1.should.not.have.been.called();
		});
		
		it('allows multiple conditions and result blocks', function(){
			const c1 = sinon.stub().returns(true);
			const c2 = sinon.stub().returns(true);
			const r1 = sinon.stub();
			const r2 = sinon.stub();
			
			let rule = new Rule('Hello World')
				.when(c1)
				.when(c2)
				.then(r1)
				.then(r2);
			
			rule.should.be.an.instanceOf(Rule);
			rule.should.have.property('name', 'Hello World');
			rule.should.have.property('conditions').with.length(2);
			rule.should.have.property('resultBlocks').with.length(2);
			c1.should.not.have.been.called();
			c2.should.not.have.been.called();
			r1.should.not.have.been.called();
			r2.should.not.have.been.called();
		});
	});
	
	describe('RuleInstance#has', function(){
		let ledger;
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItem1(),
				new TestItem1(),
				new TestItem2(),
				new TestItem3(),
				new TestItemA(),
				new TestItemA(),
			]);
		});
		
		it('selects items of a given name from the ledger', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([ledger.list[2]]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem2'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		it('can select multiple items', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([ledger.list[0], ledger.list[1]]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
	});
	
	describe('RuleInstance#with', function(){
		let ledger;
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItem1('hello'), //0
				new TestItem1({'c':'world'}), //1
				new TestItem1({'c':'help'}), //2
				new TestItem1('hello'), //3
				new TestItem1('world'), //4
				new TestItem1({'c':'world'}), //5
				new TestItem1(0), //6
				new TestItem1('hello'), //7
			]);
		});
		
		it('filters items found with has()', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([ledger.list[4]]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1').with('a','world'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		it('works with falsy values', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([ledger.list[6]]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1').with('a',0))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		it('can take multiple values (as params)', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([
					ledger.list[0],
					ledger.list[3],
					ledger.list[4],
					ledger.list[7],
				]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1').with('a','world','hello'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		it('can take multiple values (as array)', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([
					ledger.list[0],
					ledger.list[3],
					ledger.list[4],
					ledger.list[7],
				]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1').with('a',['world','hello']))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		it('can take dotted properties', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([
					ledger.list[1],
					ledger.list[5],
				]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1').with('a.c','world','hello'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
	});
	
	describe('RuleInstance#withSame', function(){
		let ledger;
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItem1('hello'), //0
				new TestItem1('hello'), //1
				new TestItem1('world'), //2
				new TestItem1('hello'), //3
				new TestItem2('hello', 2), //4
				new TestItem2('world', 8), //5
				new TestItem2('pikachu', 5), //6
			]);
		});
		
		it('filters items found with has()', function(){
			const r1 = sinon.spy((lgr)=>{
				lgr.ledger.should.equal(ledger);
				lgr.get(0).should.be.an.Array().and.containDeepOrdered([ledger.list[2]]);
				lgr.get(1).should.be.an.Array().and.containDeepOrdered([ledger.list[5]]);
			});
			
			const rule = new Rule('Rule')
				.when((lg)=>lg.has('TestItem1'))
				.when((lg)=>lg.has('TestItem2').withSame('a'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
	});
	
	describe('In general, a rule', function(){
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
		
		it('checks conditions in order until false', function(){
			const c1 = sinon.spy((lg)=>lg.has('TestItemA'));
			const c2 = sinon.stub().returns(true);
			const c3 = sinon.stub().returns(false);
			const c4 = sinon.stub().returns(true);
			const r1 = sinon.stub();
			
			const rule = new Rule('Condition check')
				.when(c1)
				.when(c2)
				.when(c3)
				.when(c4)
				.then(r1);
			
			rule.apply(ledger);
			
			should.ok(c1.called, 'Condition 1 was not called!');
			should.ok(c2.called, 'Condition 2 was not called!');
			should.ok(c3.called, 'Condition 3 was not called!');
			should.ok(c4.notCalled, 'Condition 4 was called!');
			
			should.ok(c1.calledBefore(c2), 'Condition 1 and 2 called out of order!');
			should.ok(c2.calledBefore(c3), 'Condition 2 and 3 called out of order!');
			should.ok(r1.notCalled, 'Result block was run!');
		});
		
		it('runs all result blocks in order', function(){
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
		
		it('can access condition matches in the result blocks', function(){
			const r1 = sinon.spy((lgr)=>{
				let m1 = lgr.get(0);
				let m2 = lgr.get(1);
				
				lgr.ledger.should.equal(ledger);
				m1.should.be.an.Array().and.containDeepOrdered([ledger.list[0]]);
				m2.should.be.an.Array().and.containDeepOrdered([ledger.list[1]]);
			});
			
			const rule = new Rule('Condition check')
				.when((ledger)=>ledger.has('TestItemA'))
				.when((ledger)=>ledger.has('TestItemB'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.called();
		});
	});
	
	describe('With a simple ledger, a rule', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemA(),
				new TestItemB(),
			]);
		});
		
		it('can add ledger items', function(){
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.add(new TestItemC());
				});
			
			rule.apply(ledger);
			
			ledger.list.should.be.length(3);
			ledger.list[0].should.be.an.instanceOf(TestItemA);
			ledger.list[1].should.be.an.instanceOf(TestItemB);
			ledger.list[2].should.be.an.instanceOf(TestItemC);
		});
		
		it('can remove ledger items', function(){
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemB'))
				.then((ledger)=>{
					ledger.remove(0);
				});
			
			rule.apply(ledger);
			
			ledger.list.should.be.length(1);
			ledger.list[0].should.be.an.instanceOf(TestItemA);
		});
		
		it('can affect existing ledger items', function(){
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.get(0)[0].flavor = 'hello';
				});
			
			rule.apply(ledger);
			
			ledger.list.should.be.length(2);
			ledger.list[0].should.be.an.instanceOf(TestItemA)
				.and.have.property('flavor', 'hello');
			ledger.list[1].should.be.an.instanceOf(TestItemB)
				.and.have.property('flavor', null);
		});
		
		it('can replace ledger items', function(){
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then((ledger)=>{
					ledger.getAndRemove(0);
					ledger.add(new TestItemC());
				});
			
			rule.apply(ledger);
			
			ledger.list.should.be.length(2);
			ledger.list[0].should.be.an.instanceOf(TestItemB);
			ledger.list[1].should.be.an.instanceOf(TestItemC);
		});
		
		it('can check multiple ledger items', function(){
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.when((ledger)=>ledger.has('TestItemB'))
				.then((ledger)=>{
					ledger.get(0)[0].flavor = 'hello';
					ledger.get(1)[0].flavor = 'world';
				});
			
			rule.apply(ledger);
			
			ledger.list.should.be.length(2);
			ledger.list[0].should.be.an.instanceOf(TestItemA)
				.and.have.property('flavor', 'hello');
			ledger.list[1].should.be.an.instanceOf(TestItemB)
				.and.have.property('flavor', 'world');
		});
		
		it('can run multiple result blocks', function(){
			const r1 = sinon.stub();
			const r2 = sinon.stub();
			
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then(r1)
				.then(r2);
			
			rule.apply(ledger);
			
			r1.should.have.been.called();
			r2.should.have.been.called();
		});
		
		it('will do nothing if no items are selected', function(){
			const r1 = sinon.stub();
			
			const rule = new Rule('Simple Rule')
				.when((ledger)=>ledger.has('TestItemD'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.not.have.been.called();
		});
	});
	
	describe('With repeated items, a rule', function(){
		let ledger;
		
		beforeEach(function(){
			ledger = createTestLedger([
				new TestItemA(),
				new TestItemA(),
				new TestItemB(),
				new TestItemD(0),
				new TestItemD(1),
				new TestItemA(),
				new TestItemD(3),
				new TestItemB({'hello':'hello'}),
				new TestItemB({'hello':'world'}),
				new TestItemD(1),
			]);
		});
		
		it('will select all items with ".has()"', function(){
			const r1 = sinon.spy((ledger)=>{
				let m = ledger.get(0);
				m.should.be.an.Array().with.length(3);
				m[0].should.be.an.instanceOf(TestItemA);
				m[1].should.be.an.instanceOf(TestItemA);
				m[2].should.be.an.instanceOf(TestItemA);
			});
			
			const rule = new Rule('Repeating Rule')
				.when((ledger)=>ledger.has('TestItemA'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		
		it('will select all items regardless of parameters without ".with()"', function(){
			const r1 = sinon.spy((ledger)=>{
				let m = ledger.get(0);
				m.should.be.an.Array().with.length(4);
				m[0].should.be.an.instanceOf(TestItemD);
				m[1].should.be.an.instanceOf(TestItemD);
				m[2].should.be.an.instanceOf(TestItemD);
				m[3].should.be.an.instanceOf(TestItemD);
			});
			
			const rule = new Rule('Complex Rule')
				.when((ledger)=>ledger.has('TestItemD'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		
		it('can differentiate items based on parameters', function(){
			const r1 = sinon.spy((ledger)=>{
				let m = ledger.get(0);
				m.should.be.an.Array().with.length(1);
				m[0].should.be.an.instanceOf(TestItemD);
				m[0].should.have.property('hello', 3);
			});
			
			const rule = new Rule('Complex Rule')
				.when((ledger)=>ledger.has('TestItemD').with('hello', 3))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		
		it('can differentiate items based on parameters with a falsy value', function(){
			const r1 = sinon.spy((ledger)=>{
				let m = ledger.get(0);
				m.should.be.an.Array().with.length(1);
				m[0].should.be.an.instanceOf(TestItemD);
				m[0].should.have.property('hello', 0);
			});
			
			const rule = new Rule('Complex Rule')
				.when((ledger)=>ledger.has('TestItemD').with('hello', 0))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		
		it('can differentiate items based on parameters inside objects', function(){
			const r1 = sinon.spy((ledger)=>{
				let m = ledger.get(0);
				m.should.be.an.Array().with.length(1);
				m[0].should.be.an.instanceOf(TestItemB);
				m[0].should.have.property('obj');
				m[0]['obj'].should.have.property('hello', 'world');
			});
			
			const rule = new Rule('Complex Rule')
				.when((ledger)=>ledger.has('TestItemB').with('obj.hello', 'world'))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
		
		it('will not run if it cannot find an item based on parameters', function(){
			const r1 = sinon.stub();
			
			const rule = new Rule('Complex Rule')
				.when((ledger)=>ledger.has('TestItemD').with('hello', 2))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.not.have.been.called();
		});
		
		it('can select multiple items based on parameters', function(){
			const r1 = sinon.spy((ledger)=>{
				let m = ledger.get(0);
				m.should.be.an.Array().with.length(2);
				m[0].should.be.an.instanceOf(TestItemD);
				m[0].should.have.property('hello', 1);
				m[1].should.be.an.instanceOf(TestItemD);
				m[1].should.have.property('hello', 1);
			});
			
			const rule = new Rule('Complex Rule')
				.when((ledger)=>ledger.has('TestItemD').with('hello', 1))
				.then(r1);
			
			rule.apply(ledger);
			
			r1.should.have.been.calledOnce();
		});
	});
	
});
