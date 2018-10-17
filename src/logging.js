// logging.js
// logging setup

const path = require('path');
const mkdirp = require('mkdirp');
const log4js = require('log4js');

try {
	mkdirp.sync(path.resolve(__dirname, '../logs/output'));
} catch (e) {}

const tokens = {
	ts() {
		if (typeof Bot === 'undefined') return '??d??h??m??s';
		return Bot.getTimestamp({ padded:true, compact:true });
	}
}


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
				pattern: `%[%r %x{ts} %5.5p%] [%c] %m`,
				tokens,
			},
		},
		file: {
			type: 'file',
			filename: `logs/run/runlog.log`,
			maxLogSize: 8 * 1024 * 1024, // 8Mb
			backups: 30,
			compress: false,
			keepFileExt: true,
			layout: {
				type: 'pattern',
				pattern: `%r %x{ts} %5.5p [%c] %m`,
				tokens,
			},
		},
		errorlog: {
			type: 'file',
			filename: `logs/error/errorlog.log`,
			maxLogSize: 8 * 1024 * 1024, // 8Mb
			backups: 20,
			compress: true,
			keepFileExt: true,
			layout: {
				type: 'pattern',
				pattern: `%r %x{ts} %5.5p [%c] %m`,
				tokens,
			},
		},
		xmllog: {
			type: 'file',
			filename: `logs/xml/xml.log`,
			maxLogSize: 8 * 1024 * 1024, // 8Mb
			backups: 50,
			compress: false,
			keepFileExt: true,
			layout: {
				type: 'pattern',
				pattern: `%r | %x{ts} :: %m`,
				tokens,
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
		'out-chat': {
			type: 'stdout',
			layout: {
				type: 'pattern',
				pattern: `%[%r %x{ts} %5.5p [%c] %m%]`,
				tokens,
			},
		},
	},
	categories: {
		default: {
			appenders: ['out-filtered', 'file', 'error-filtered'],
			level:'all',
		},
		'CHATLOG': {
			appenders: ['out-chat'],
			level:'off',
		},
		'XMLLOG': {
			appenders: ['xmllog'],
			level:'all',
		},
	},
});

function getLogger(category) {
	const l4logger = log4js.getLogger(category);
	l4logger.logRaw = l4logger.log;
	l4logger.log = l4logger.info;
	return l4logger;
}

getLogger.shutdown = ()=>{
	return new Promise((r, e)=>{ log4js.shutdown(r); });
}

module.exports = getLogger;
