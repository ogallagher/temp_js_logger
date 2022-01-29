/**
 * Owen Gallagher <github.com/ogallagher>
 * 
 * Temporary JS backend+frontend logger that patches console.log.
 * Written in common js, so no import/export keywords.
 */

class TempLogger {
	constructor({ with_timestamp, caller_name, with_lineno, parse_level_prefix, with_level }) {
		this.with_timestamp = with_timestamp == true
		
		this.caller_name = caller_name
		if (caller_name == undefined) {
			this.caller_name = ''
		}
		
		this.with_lineno = with_lineno == true
		
		this.parse_level_prefix = parse_level_prefix == true
		this.with_level = with_level == true
	}
	
	log(data, console_method_key = 'log') {
		let ts = ''
		if (this.with_timestamp) {
			ts = new Date().toISOString()
		}
		
		let lineno = ''
		if (this.with_lineno) {
			lineno = TempLogger.get_caller_line()
		}
		
		let level = ''
		if (this.with_level) {
			level = TempLogger.LEVEL_DEBUG
			
			if (this.parse_level_prefix) {
				if (typeof data == 'string') {
					let m = data.match(/^(\w+)\s/)
					if (m != null) {
						// m = match str, level str, {index}
						parsed_level = TempLogger.STR_TO_LEVEL[
							m[1].toUpperCase()
						]
						
						if (parsed_level != undefined) {
							level = parsed_level
						}
					}
				}
			}
		}
		
		TempLogger.CONSOLE_METHOD[console_method_key](
			`${ts} ${this.caller_name}.${level}: ${data}`
		)
	}
	
	// TODO modify for current nesting
	// TODO handle cases where line is undefined
	static get_caller_line() {
		try {
			throw new Error('')
		}
		catch (err) {
			let line
			
			try {
				let call_stack = err.stack.split('\n')
				let caller_info = call_stack[4]
				
				if (caller_info.indexOf(':') == -1) {
					caller_info = call_stack[3]
				}
			
				caller_info = caller_info.split(':')
			
				// line number is second to last item in colon-separated list
				line = caller_info[caller_info.length-2]
			}
			catch (e) {
				console.log(call_stack)
				throw e
			}
			finally {
				return line
			}
		}
	}
}

TempLogger.NODE_VERSION = process.version
TempLogger.NV_MAJOR = parseInt(NODE_VERSION.substr(1, NODE_VERSION.indexOf('.')))

TempLogger.CONSOLE_METHOD = {
	log: console.log,
	info: console.info,
	warn: console.warn,
	error: console.error
}

TempLogger.LEVEL_DEBUG = 0
TempLogger.LEVEL_INFO = 1
TempLogger.LEVEL_WARNING = 2
TempLogger.LEVEL_ERROR = 3
TempLogger.LEVEL_CRITICAL = 4

TempLogger.STR_DEBUG = 'DEBUG'
TempLogger.STR_INFO = 'INFO'
TempLogger.STR_WARNING = 'WARNING'
TempLogger.STR_ERROR = 'ERROR'
TempLogger.STR_CRITICAL = 'CRITICAL'

TempLogger.STR_TO_LEVEL = {
	TempLogger.STR_DEBUG: TempLogger.LEVEL_DEBUG,
	TempLogger.STR_INFO: TempLogger.LEVEL_INFO,
	TempLogger.STR_WARNING: TempLogger.LEVEL_WARNING,
	TempLogger.STR_ERROR: TempLogger.LEVEL_ERROR,
	TempLogger.STR_CRITICAL: TempLogger.LEVEL_CRITICAL
}

// patch console.log

TempLogger.root = new TempLogger()

for (method_key of Object.keys(TempLogger.CONSOLE_METHOD)) {
	console[method_key] = function(data) {
		return TempLogger.root(data, method_key)
	}
}

// backend nodejs exports
if (typeof exports != 'undefined') {
	exports.TempLogger = TempLogger
}
