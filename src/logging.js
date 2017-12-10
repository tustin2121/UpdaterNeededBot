// logging.js
// logging setup

const log4js = require('log4js');

log4js.configure({
	appenders: {
		out: {
			type: 'stdout',
			layout: {
				type: 'pattern',
				pattern: `%[%r %p%] [%c] %m`,
			}
		},
		file: {
			type: 'file',
			filename: `logs/output/runlog.log`,
			maxLogSize: 8 * 1024 * 1024, // 8Mb
			backups: 30,
			layout: {
				type: 'pattern',
				pattern: `%r %p [%c] %m`,
			},
		},
	},
	categories: {
		default: {
			appenders: ['out', 'file'],
			level:'all',
		},
	},
});

function getLogger(category) {
	const l4logger = log4js.getLogger(category);
	const logger = {
		log : l4logger.info.bind(l4logger),
		logRaw: l4logger.log.bind(l4logger),
		debug: l4logger.debug.bind(l4logger),
		trace: l4logger.trace.bind(l4logger),
		info: l4logger.info.bind(l4logger),
		warn: l4logger.warn.bind(l4logger),
		error: l4logger.error.bind(l4logger),
		fatal: l4logger.fatal.bind(l4logger),
		mark: l4logger.mark.bind(l4logger),
		l4js : l4logger,
	};
	return logger;
}

module.exports = getLogger;
