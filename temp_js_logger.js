/**
 * Owen Gallagher <github.com/ogallagher>
 * 
 * Temporary JS backend+frontend logger that patches console.log.
 * Written in common js, so no import/export keywords.
 */

class TempLogger {
	/**
	 * Create new TempLogger instance. All args are specified as keys in an options object.
	 *
	 * @param {String} level Logging level name.
	 * @param {boolean} with_timestamp Include timestamp in message.
	 * @param {String} caller_name Include given caller name in message.
	 * @param {boolean} with_lineno Include caller line number in message.
	 * @param {boolean} parse_level_prefix 
	 * @param {boolean} with_level
	 */
	constructor(
		{
			level,
			with_timestamp, 
			caller_name, 
			with_lineno, 
			parse_level_prefix, 
			with_level 
		} = {
			level: TempLogger.STR_DEBUG,
			with_timestamp: false,
			caller_name: undefined,
			with_lineno: true,
			parse_level_prefix: true,
			with_level: true
		}
	) {
		this.level = TempLogger.STR_TO_LEVEL[level.toUpperCase()]
		
		this.with_timestamp = with_timestamp == true
		
		this.caller_tag = caller_name
		if (caller_name == undefined || caller_name == '') {
			this.caller_tag = ''
		}
		else {
			this.caller_tag += '.'
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
		
		let level = TempLogger.LEVEL_DEBUG
		if (this.parse_level_prefix) {
			// parse level from message prefix
			if (typeof data == 'string') {
				let m = data.match(/^(\w+)[\s:]/)
				
				if (m != null) {
					// m = match str, level str, {index}
					let level_str = m[1].toUpperCase()
					let parsed_level = TempLogger.STR_TO_LEVEL[level_str]
					
					if (parsed_level != undefined) {
						level = parsed_level
					}
					
					data = data.substring(m.index + m[0].length)
				}
			}
		}
		else {
			// convert console method name to level
			switch (console_method_key) {
				case 'log':
					level = TempLogger.LEVEL_DEBUG
					break
				
				case 'info':
					level = TempLogger.LEVEL_INFO
					break
				
				case 'warn':
					level = TempLogger.LEVEL_WARNING
					break
				
				case 'error':
					level = TempLogger.LEVEL_ERROR
					break
			}
		}
		
		// determine whether to suppress or print the message
		if (level >= this.level) {
			let level_str = ''
			if (this.with_level) {
				level_str = TempLogger.LEVEL_TO_STR[level]
			}
		
			TempLogger.CONSOLE_METHOD[console_method_key](
				`${ts} ${this.caller_tag}${level_str}: ${data}`
			)
		}
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
	
	static config(constructor_opts) {
		TempLogger.root = new TempLogger(constructor_opts)
		return TempLogger.root
	}
}

// "scoped" class variables

TempLogger.NODE_VERSION = process.version
TempLogger.NV_MAJOR = parseInt(
	TempLogger.NODE_VERSION.substr(1, TempLogger.NODE_VERSION.indexOf('.'))
)

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
TempLogger.STR_WARN = 'WARN'
TempLogger.STR_ERR = 'ERR'

TempLogger.STR_TO_LEVEL = {}
TempLogger.STR_TO_LEVEL[TempLogger.STR_DEBUG] = TempLogger.LEVEL_DEBUG
TempLogger.STR_TO_LEVEL[TempLogger.STR_INFO] = TempLogger.LEVEL_INFO
TempLogger.STR_TO_LEVEL[TempLogger.STR_WARNING] = TempLogger.LEVEL_WARNING
TempLogger.STR_TO_LEVEL[TempLogger.STR_WARN] = TempLogger.LEVEL_WARNING
TempLogger.STR_TO_LEVEL[TempLogger.STR_ERROR] = TempLogger.LEVEL_ERROR
TempLogger.STR_TO_LEVEL[TempLogger.STR_ERR] = TempLogger.LEVEL_ERROR
TempLogger.STR_TO_LEVEL[TempLogger.STR_CRITICAL] = TempLogger.LEVEL_CRITICAL

TempLogger.LEVEL_TO_STR = {}
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_DEBUG] = TempLogger.STR_DEBUG
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_INFO] = TempLogger.STR_INFO
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_WARNING] = TempLogger.STR_WARNING
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_ERROR] = TempLogger.STR_ERROR
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_CRITICAL] = TempLogger.STR_CRITICAL

TempLogger.root = new TempLogger()

// patch console.log

for (let method_key of Object.keys(TempLogger.CONSOLE_METHOD)) {
	console[method_key] = function(data) {
		TempLogger.root.log(data, method_key)
	}
}

// backend nodejs exports
if (typeof exports != 'undefined') {
	exports.TempLogger = TempLogger
	exports.root = TempLogger.root
	
	exports.config = function(opt) {
		exports.root = TempLogger.config(opt)
	}
}
