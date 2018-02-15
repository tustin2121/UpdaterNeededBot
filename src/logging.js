// logging.js
// logging setup

const path = require('path');
const mkdirp = require('mkdirp');
const log4js = require('log4js');

try {
	mkdirp.sync(path.resolve(__dirname, '../logs/output'));
} catch (e) {}

log4js.configure({
	levels: {
	//	ALL:	{ value:Number.MIN_VALUE,	colour:'grey' },
		TRACE:	{ value:5000,				colour:'grey' },
		DEBUG:	{ value:10000,				colour:'blue' },
		NOTE:	{ value:15000,				colour:'cyan' },
	//	INFO:	{ value:20000,				colour:'green' },
	//	WARN:	{ value:30000,				colour:'yellow' },
	//	ERROR:	{ value:40000,				colour:'red' },
	//	FATAL:	{ value:50000,				colour:'magenta' },
	//	MARK:	{ value:9007199254740992,	colour:'grey' },
	//	OFF:	{ value:Number.MAX_VALUE,	colour:'grey' },
	},
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
			backups: 20,
			compress: true,
			keepFileExt: true,
			layout: {
				type: 'pattern',
				pattern: `%r %p [%c] %m`,
			},
		},
		errorlog: {
			type: 'file',
			filename: `logs/output/errorlog.log`,
			maxLogSize: 8 * 1024 * 1024, // 8Mb
			backups: 20,
			compress: true,
			keepFileExt: true,
			layout: {
				type: 'pattern',
				pattern: `%r %p [%c] %m`,
			},
		},
		'out-filtered': {
			type: 'logLevelFilter',
			appender: 'out',
			level: 'debug',
		},
		'error-filtered': {
			type: 'logLevelFilter',
			appender: 'errorlog',
			level: 'error',
		},
	},
	categories: {
		default: {
			appenders: ['out-filtered', 'file', 'error-filtered'],
			level:'all',
		},
	},
});

function getLogger(category) {
	const l4logger = log4js.getLogger(category);
	l4logger.logRaw = l4logger.log;
	l4logger.log = l4logger.info;
	// const logger = {
	// 	log : l4logger.info.bind(l4logger),
	// 	logRaw: l4logger.log.bind(l4logger),
	// 	debug: l4logger.debug.bind(l4logger),
	// 	trace: l4logger.trace.bind(l4logger),
	// 	info: l4logger.info.bind(l4logger),
	// 	warn: l4logger.warn.bind(l4logger),
	// 	error: l4logger.error.bind(l4logger),
	// 	fatal: l4logger.fatal.bind(l4logger),
	// 	mark: l4logger.mark.bind(l4logger),
	// 	l4js : l4logger,
	// };
	return l4logger;
}

getLogger.shutdown = ()=>{
	return new Promise((r, e)=>{ log4js.shutdown(r); });
}

module.exports = getLogger;
