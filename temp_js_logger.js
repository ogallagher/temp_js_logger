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
	 * @param {String} level Logging level name, case insensitive.
	 * 
	 * @param {boolean} with_timestamp Include timestamp in message.
	 * 
	 * @param {String} caller_name Include given caller name in message.
	 * 
	 * @param {boolean} with_lineno Include caller line number in message.
	 * 
	 * @param {boolean} parse_level_prefix If incoming messages will be prefixed with a logging 
	 * level string. If false, the console method (log, info, warn, error) is used to determine
	 * the log level.
	 * 
	 * @param {boolean} with_level Include level name in message.
	 *
	 * @param {boolean} with_always_level_name Include ALWAYS as a level name in message if
	 * no level is specified.
	 */
	constructor(
		{
			level,
			with_timestamp, 
			caller_name, 
			with_lineno, 
			parse_level_prefix, 
			with_level,
			with_always_level_name, 
		} = {
			level: TempLogger.STR_DEBUG,
			with_timestamp: false,
			caller_name: undefined,
			with_lineno: true,
			parse_level_prefix: true,
			with_level: true,
			with_always_level_name: false
		}
	) {
		this.level = TempLogger.STR_TO_LEVEL[level.toUpperCase()]
		
		// force truthy values to boolean
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
		this.with_always_level_name = with_always_level_name == true
		
		// webpage console
		if (TempLogger.environment == TempLogger.ENV_FRONTEND && !TempLogger.with_webpage_console) {
			TempLogger.init_webpage_console()
		}
	}
	
	log(data, console_method_key = 'log') {
		let ts = ''
		if (this.with_timestamp) {
			ts = new Date().toISOString() + ' '
		}
		
		let lineno = ''
		if (this.with_lineno) {
			lineno = TempLogger.get_caller_line() + '.'
		}
		
		let level = TempLogger.LEVEL_ALWAYS
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
			if (
				this.with_level && 
				(level != TempLogger.LEVEL_ALWAYS || this.with_always_level_name)
			) {
				level_str = TempLogger.LEVEL_TO_STR[level]
			}
			
			let prefix = ts + this.caller_tag + lineno + level_str
			if (prefix.length > 0) {
				prefix += ': '
			}
			
			let message = prefix + data
			TempLogger.CONSOLE_METHOD[console_method_key](message)
			
			if (
				TempLogger.environment == TempLogger.ENV_FRONTEND && 
				TempLogger.with_webpage_console
			) {
				// show in gui
				let msgbox_jq = $(TempLogger.CMP_MESSAGE_DEFAULT)
				.addClass(`alert-${TempLogger.LEVEL_TO_ALERT_COLOR[level]}`)
				
				msgbox_jq.find(`.${TempLogger.CMP_MESSAGE_CLASS}`).html(message)
				
				$(`.${TempLogger.CMP_CONSOLE_CLASS}`).append(msgbox_jq)
			}
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
	
	static set_level(level) {
		if (typeof level == 'string') {
			level = TempLogger.STR_TO_LEVEL[level.toUpperCase()]
		}
		if (level == undefined) {
			level = TempLogger.LEVEL_DEBUG
		}
		
		TempLogger.root.level = level
	}
	
	static set_with_timestamp(with_timestamp) {
		TempLogger.root.with_timestamp = with_timestamp == true
	}
	
	static set_caller_name(caller_name) {
		TempLogger.root.caller_tag = (caller_name == undefined || caller_name == '')
			? ''
			: caller_name + '.'
	}
	
	static set_with_lineno(with_lineno) {
		TempLogger.root.with_lineno = with_lineno == true
	}
	
	static set_parse_level_prefix(parse_level_prefix) {
		TempLogger.root.parse_level_prefix = parse_level_prefix == true
	}
	
	static set_with_level(with_level) {
		TempLogger.root.with_level = with_level == true
	}
	
	static set_with_always_level_name(with_always_level_name) {
		TempLogger.root.with_always_level_name = with_always_level_name == true
	}
	
	static init_webpage_console() {
		let console_jq = $(TempLogger.CMP_CONSOLE_DEFAULT)
		$('body').prepend(console_jq)
		
		TempLogger.with_webpage_console = true
	}
}

// "scoped" class variables

TempLogger.ENV_UNKNOWN = 'unknown'
TempLogger.ENV_BACKEND = 'backend'
TempLogger.ENV_FRONTEND = 'frontend'
TempLogger.environment = TempLogger.ENV_UNKNOWN

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
TempLogger.LEVEL_ALWAYS = 10

TempLogger.STR_DEBUG = 'DEBUG'
TempLogger.STR_INFO = 'INFO'
TempLogger.STR_WARNING = 'WARNING'
TempLogger.STR_ERROR = 'ERROR'
TempLogger.STR_CRITICAL = 'CRITICAL'
TempLogger.STR_ALWAYS = 'ALWAYS'

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
TempLogger.STR_TO_LEVEL[TempLogger.STR_ALWAYS] = TempLogger.LEVEL_ALWAYS

TempLogger.LEVEL_TO_STR = {}
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_DEBUG] = TempLogger.STR_DEBUG
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_INFO] = TempLogger.STR_INFO
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_WARNING] = TempLogger.STR_WARNING
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_ERROR] = TempLogger.STR_ERROR
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_CRITICAL] = TempLogger.STR_CRITICAL
TempLogger.LEVEL_TO_STR[TempLogger.LEVEL_ALWAYS] = TempLogger.STR_ALWAYS

TempLogger.LEVEL_TO_ALERT_COLOR = {}
TempLogger.LEVEL_TO_ALERT_COLOR[TempLogger.LEVEL_DEBUG] = 'light'
TempLogger.LEVEL_TO_ALERT_COLOR[TempLogger.LEVEL_INFO] = 'info'
TempLogger.LEVEL_TO_ALERT_COLOR[TempLogger.LEVEL_WARNING] = 'warning'
TempLogger.LEVEL_TO_ALERT_COLOR[TempLogger.LEVEL_ERROR] = 'danger'
TempLogger.LEVEL_TO_ALERT_COLOR[TempLogger.LEVEL_CRITICAL] = 'danger'
TempLogger.LEVEL_TO_ALERT_COLOR[TempLogger.LEVEL_ALWAYS] = 'secondary'

TempLogger.with_webpage_console = false

TempLogger.CSS_CLASS_PREFIX = 'temp-logger'

TempLogger.CMP_CONSOLE_CLASS = `${TempLogger.CSS_CLASS_PREFIX}-console`
TempLogger.CMP_CONSOLE_DEFAULT = 
`<div class="${TempLogger.CMP_CONSOLE_CLASS} fixed-top">
</div>`

TempLogger.CMP_MESSAGEBOX_CLASS = `${TempLogger.CSS_CLASS_PREFIX}-msg-box`
TempLogger.CMP_MESSAGE_CLASS = `${TempLogger.CSS_CLASS_PREFIX}-msg`
TempLogger.CMP_MESSAGE_DEFAULT = 
`<div class="${TempLogger.CMP_MESSAGE_CLASS} alert" alert-dismissible" role="alert">
	<span class="${TempLogger.CMP_MESSAGE_CLASS}"></span>
	<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="close"></button>
</div>`

// patch console.log

for (let method_key of Object.keys(TempLogger.CONSOLE_METHOD)) {
	console[method_key] = function(data) {
		TempLogger.root.log(data, method_key)
	}
}

// backend nodejs exports
if (typeof exports != 'undefined') {
	// environment
	TempLogger.environment = TempLogger.ENV_BACKEND
	
	// interpreter version
	TempLogger.NODE_VERSION = process.version
	TempLogger.NV_MAJOR = parseInt(
		TempLogger.NODE_VERSION.substr(1, TempLogger.NODE_VERSION.indexOf('.'))
	)
	
	exports.TempLogger = TempLogger
	exports.root = TempLogger.root
	
	// root constructor wrapper
	exports.config = function(opt) {
		exports.root = TempLogger.config(opt)
	}
	
	// setters
	exports.set_level = TempLogger.set_level
	exports.set_with_timestamp = TempLogger.set_with_timestamp
	exports.set_caller_name = TempLogger.set_caller_name
	exports.set_with_lineno = TempLogger.set_with_lineno
	exports.set_parse_level_prefix = TempLogger.set_parse_level_prefix
	exports.set_with_level = TempLogger.set_with_level
	exports.set_with_always_level_name = TempLogger.set_with_always_level_name
}
else {
	// environment
	TempLogger.environment = TempLogger.ENV_FRONTEND
}

// default config
TempLogger.root = new TempLogger()
