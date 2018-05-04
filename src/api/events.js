// api/events.js
// A subclass of EventEmitter, which cleans up some things for our own purposes

const EventEmitter = require('events');
const LOGGER = getLogger('ExtendedEmitter');

class ExtendedEmitter extends EventEmitter {
	constructor() {
		super();
	}
	
	/** Override of EventEmitter.prototype.emit that adds a try-catch. */
	emit(type, ...args) {
		try {
			EventEmitter.prototype.emit.call(this, type, ...args);
		} catch (e) {
			LOGGER.error(`Error in '${this.constructor.name}.${type}' event emission!`, e);
		}
	}
	
	emitLater(type, ...args) {
		process.nextTick(()=>{
			try {
				EventEmitter.prototype.emit.call(this, type, ...args);
			} catch (e) {
				LOGGER.error(`Error in '${this.constructor.name}.${type}' event emission!`, e);
			}
		});
	}
}

module.exports = ExtendedEmitter;