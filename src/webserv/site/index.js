// webserv site/index.js
//
/* global io, $, atob */

const sock = io();

sock.on('ledger', (i, xml)=>{
	let $updatePage = $('.centerColumn'); //TODO create new pages perhaps?
	$updatePage.html(xml);
	$updatePage.find('api').wrap(`<div class="view api">`);
	$updatePage.find('modules').wrap(`<div class="view module">`);
	$updatePage.find('rules').wrap(`<div class="view rule">`);
	$updatePage.find('ledger').wrap(`<div class="view ledger">`);
	$updatePage.find('postledger').wrap(`<div class="view ledger-post">`);
	$updatePage.find('typesetter').wrap(`<div class="view typesetter">`);
	$updatePage.find('update').wrap(`<div class="view update">`);
	
	$updatePage.find('update')
		.prepend(`<time>just now</time>`)
		.append(`<a href="#" class="author">/u/UpdaterNeeded</a>`);
	
	$updatePage.find('pokemon').each((i, e)=>{
		let $e = $(e);
		let mon = JSON.parse(atob($e.text()));
		console.log(mon);
		$e.data('data', mon);
		$e.empty().append(`<span prop='name'>${mon.name} (${mon.species})</span>`);
		
		$e.append(`<span prop='types'>${mon.types.join('/')}</span>`);
		$e.append(`<span prop='moves'>${mon.moves.join(', ')}</span>`);
		if (mon.item) $e.append(`<span prop='item'>${mon.item.name}</span>`)
		if (mon.ability) $e.append(`<span prop='ability'>${mon.ability}</span>`)
		if (mon.nature) $e.append(`<span prop='nature'>${mon.nature}</span>`)
		$e.append(
			`<span prop='stats'>`+Object.keys(mon.stats).map(x=>`<span stat="${x}">${mon.stats[x]}</span>`).join('')+'</span>'
		);
		if (mon.pokerus) $e.append('<span>PokeRus</span>');
		if (mon.shiny) $e.append('<span>Shiny</span>');
		if (mon.sparkly) $e.append('<span>Sparkly</span>');
	})
});
