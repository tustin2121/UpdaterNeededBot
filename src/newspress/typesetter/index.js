// newspress/typesetter/index.js

const LOGGER = getLogger('TypeSetter');
const TypeSetter = require('./typesetter');

/** A function that formats the data from the html tags into reddit text formatting. */
function formatReddit(text) {
	// Replace the info tag with hover link information
	text = text.replace(/<info ext="([^\"]+)">([\s\S]+?)<\/info>/ig, (match, ext, txt)=>{
		return `[${txt}](#info "${ext}")`;
	});
	text = text.replace(/<b>([\s\S]+?)<\/b>/ig, (match, inner)=>{
		return `**${inner}**`;
	});
	text = text.replace(/<i>([\s\S]+?)<\/i>/ig, (match, inner)=>{
		return `*${inner}*`;
	});
	return { text };
}

/** A function that formats the data from the html tags into discord text formatting. */
function formatDiscord(text) {
	let embeds = [];
	
	// Replace the info tag with a pointer to the discord embed
	// If there's more than one, number them.
	text = text.replace(/<info ext="([^\"]+)">([\s\S]+?)<\/info>/ig, (match, ext, txt)=>{
		embeds.push({
			name: txt,
			value: ext,
		});
		return txt;
	});
	text = text.replace(/<b>([\s\S]+?)<\/b>/ig, (match, inner)=>{
		return `**${inner}**`;
	});
	text = text.replace(/<i>([\s\S]+?)<\/i>/ig, (match, inner)=>{
		return `*${inner}*`;
	});
	return { text, embeds };
}

function typeset(ledger) {
	LOGGER.warn(`TYPESETTER NOT YET IMPLEMENTED`);
	//let ts = new TypeSetter(ledger);
	return null;
}


module.exports = {
	TypeSetter,
	typeset,
	formatFor: {
		reddit: formatReddit,
		discord: formatDiscord,
	},
};