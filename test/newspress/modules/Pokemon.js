// test newspress/modules/Pokemon.js
// Unit test cases for the Pokemon module

const { should, sinon } = require('../../common');

const { Ledger, ApiDisturbance } = require('../../../src/newspress/ledger');
const { SortedPokemon, Pokemon } = require('../../../src/api/pokedata');

const PokemonModule = require('../../../src/newspress/modules/Pokemon');

/** Create the minumum amount of data for a Pokemon Object. */
function createPokemonData(args={}) {
	let data = {
		personality_value: args.hash || 21,
		name: args.name || 'Ethan',
		species: {
			name: args.species || 'Quilava',
			type1: args.type || 'Fire',
			type2:'Ground',
		},
		moves: [],
	};
	delete args.name;
	delete args.hash;
	delete args.species;
	return Object.assign(data, args);
}

/** Create a SortedPokemon object with the given data. */
function createSortedPokemon({ party=[], pc=[], daycare=[] }={}) {
	let data = {
		party,
		daycare,
		pc: {
			boxes: [
				{ box_contents:pc, box_name:'Box', box_number:1 },
			],
		},
	};
	if (pc === null) data.pc.boxes[0] = null;
	return new SortedPokemon(data);
}

describe('PokemonModule', function(){
	const module = new PokemonModule({},{});
	
	// Test if the assumptions we make and the tools we use in these unit tests work
	describe('[Unit Test Assumptions]', function(){
		it(`createPokemonData()`, function() {
			const p = new Pokemon(createPokemonData());
			p.name.should.equal('Ethan');
			p.species.should.equal('Quilava');
		});
		it(`createSortedPokemon() empty`, function() {
			const p = createSortedPokemon();
			p.party.should.be.an.Array().of.length(0);
			p.all.should.be.an.Object().of.size(0);
		});
		it(`createSortedPokemon()`, function() {
			const p = createSortedPokemon({
				party: [createPokemonData()],
			});
			
			
			p.party.should.be.an.Array().of.length(1);
			p.all.should.be.an.Object().of.size(1);
			// console.log(p);
			p._map[21].should.be.an.instanceOf(Pokemon);
		});
	});
	
	describe('#firstPass', function(){
		let prev_api, curr_api, ledger;
		
		beforeEach(function(){
			ledger = new Ledger();
			prev_api = { pokemon:createSortedPokemon({
				party: [
					createPokemonData({ name:'Alice', species:'Eevee' }),
					createPokemonData({ name:'Bob', species:'Meowth' }),
					createPokemonData({ name:'Charlie', species:'Ralts' }),
					createPokemonData({ name:'Dina', species:'Doublade' }),
					createPokemonData({ name:'Ethan', species:'Quilava' }),
				],
				pc: [
					
				],
			}) };
			curr_api = { pokemon:createSortedPokemon({
				party: [
					createPokemonData(),
				],
				pc: [
					
				],
			}) };
		});
		
		
		it(`does nothing when nothing changes in the API`, function(){
			module.firstPass(ledger, { prev_api, curr_api });
			
			ledger.should.have.length(0);
		});
		// it(`If a box is missing, it generates an ApiDisturbance`, function(){
		// 	const ledger = new Ledger();
		// 	const prev_api = { pokemon:createSortedPokemon({
		// 		party: [createPokemonData()],
		// 	}) };
		// 	const curr_api = { pokemon:createSortedPokemon({
		// 		party: [createPokemonData()],
		// 	}), pc:null, };
        //
        //
		// 	module.firstPass(ledger, { prev_api, curr_api });
        //
		// 	ledger.should.have.length(1);
		// 	ledger.list[0].should.be.an.instanceOf(ApiDisturbance);
		// });
	});
});