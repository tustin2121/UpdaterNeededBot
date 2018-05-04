// webserv site/index.js
//
/* global io, $, atob */

const DISCORD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M297.216 243.2c0 15.616-11.52 28.416-26.112 28.416-14.336 0-26.112-12.8-26.112-28.416s11.52-28.416 26.112-28.416c14.592 0 26.112 12.8 26.112 28.416zm-119.552-28.416c-14.592 0-26.112 12.8-26.112 28.416s11.776 28.416 26.112 28.416c14.592 0 26.112-12.8 26.112-28.416.256-15.616-11.52-28.416-26.112-28.416zM448 52.736V512c-64.494-56.994-43.868-38.128-118.784-107.776l13.568 47.36H52.48C23.552 451.584 0 428.032 0 398.848V52.736C0 23.552 23.552 0 52.48 0h343.04C424.448 0 448 23.552 448 52.736zm-72.96 242.688c0-82.432-36.864-149.248-36.864-149.248-36.864-27.648-71.936-26.88-71.936-26.88l-3.584 4.096c43.52 13.312 63.744 32.512 63.744 32.512-60.811-33.329-132.244-33.335-191.232-7.424-9.472 4.352-15.104 7.424-15.104 7.424s21.248-20.224 67.328-33.536l-2.56-3.072s-35.072-.768-71.936 26.88c0 0-36.864 66.816-36.864 149.248 0 0 21.504 37.12 78.08 38.912 0 0 9.472-11.52 17.152-21.248-32.512-9.728-44.8-30.208-44.8-30.208 3.766 2.636 9.976 6.053 10.496 6.4 43.21 24.198 104.588 32.126 159.744 8.96 8.96-3.328 18.944-8.192 29.44-15.104 0 0-12.8 20.992-46.336 30.464 7.68 9.728 16.896 20.736 16.896 20.736 56.576-1.792 78.336-38.912 78.336-38.912z"/></svg>`;
const REDDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4 0-17.7 3.9-23.8 10-22.4-15.5-52.6-25.5-86.1-26.6l17.4-78.3 55.4 12.5c0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.3 24.9-24.9s-11.1-24.9-24.9-24.9c-9.7 0-18 5.8-22.1 13.8l-61.2-13.6c-3-.8-6.1 1.4-6.9 4.4l-19.1 86.4c-33.2 1.4-63.1 11.3-85.5 26.8-6.1-6.4-14.7-10.2-24.1-10.2-34.9 0-46.3 46.9-14.4 62.8-1.1 5-1.7 10.2-1.7 15.5 0 52.6 59.2 95.2 132 95.2 73.1 0 132.3-42.6 132.3-95.2 0-5.3-.6-10.8-1.9-15.8 31.3-16 19.8-62.5-14.9-62.5zM302.8 331c-18.2 18.2-76.1 17.9-93.6 0-2.2-2.2-6.1-2.2-8.3 0-2.5 2.5-2.5 6.4 0 8.6 22.8 22.8 87.3 22.8 110.2 0 2.5-2.2 2.5-6.1 0-8.6-2.2-2.2-6.1-2.2-8.3 0zm7.7-75c-13.6 0-24.6 11.1-24.6 24.9 0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.1 24.9-24.6 0-13.8-11-24.9-24.9-24.9z"/></svg>`;

const sock = io();
let paused = false;
let pastXmls = [];

sock.on('ledger', (i, xml)=>{
	pastXmls.unshift(xml);
	if (pastXmls.length >= 50) { pastXmls.pop(); }
	if (paused) return;
	displayXml(xml);
});

$('#playpause').on('click', ()=>{
	paused = !paused;
	$('#playpause').toggleClass('paused', !!paused);
});

function displayXml(xml) {
	let $updatePage = $('.updateState');
	$updatePage.html(xml);
	$updatePage.find('api').wrap(`<div class="view api">`);
	$updatePage.find('modules').wrap(`<div class="view module">`);
	$updatePage.find('preledger').wrap(`<div class="view ledger pre">`);
	$updatePage.find('merges').wrap(`<div class="view merges">`);
	$updatePage.find('rules').wrap(`<div class="view rule">`);
	$updatePage.find('postledger').wrap(`<div class="view ledger post">`);
	$updatePage.find('typesetter').wrap(`<div class="view typesetter">`);
	$updatePage.find('update').wrap(`<div class="view update">`);
	
	$updatePage.find('state')
		.append('<dirarrow class="module down">')
		.append('<dirarrow class="ledgerpre right">')
		.append('<dirarrow class="merges down">')
		.append('<dirarrow class="rule right">')
		.append('<dirarrow class="ledgerpost up">')
		.append('<dirarrow class="typesetter down">')
		.append('<dirarrow class="update down">')
	
	$updatePage.find('update')
		.prepend(`<time>just now</time>`)
		.append(`<a href="#" class="author">/u/UpdaterNeeded</a>`);
	
	$updatePage.find('pokemon').each((i, e)=>{
		let $e = $(e);
		let mon = JSON.parse(atob($e.text()));
		$e.data('data', mon);
		$e.empty().append(`<span prop='name'>${mon.name} (${mon.species})</span>`);
		
		$e.append(`<span prop='level'>${mon.level}</span>`);
		if (mon.gender) $e.append(`<span prop='gender'>${mon.gender}</span>`);
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
	});
	
	$updatePage.find('rule,mod,ledgeritem').on('click', function(e){
		$(this).children().toggle();
		e.stopPropagation();
	});
	$updatePage.find('rule,mod,ledgeritem').children().on('click', function(e){
		e.stopPropagation();
	});
	$updatePage.find('rule > match > ledgeritem').children().hide();
}
