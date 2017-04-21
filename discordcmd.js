// discordcmd.js
//

module.exports = function(msg, memory) {
	if (msg.content === '_tags UpdaterNeeded_') {
		return 'tagin';
	}
	if (msg.content.startsWith('_tags')) {
		return 'tagout';
	}
	if (msg.content.startsWith('Updater:')) {
		//msg.content.substr(8)
	}
	return null;
};