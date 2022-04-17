/**
 * Owen Gallagher <github.com/ogallagher>
 * 
 * Temporary JS backend+frontend logger that patches console.log.
 * Written in common js, so no import/export keywords.
 */

// class

class TempLogger {
	/**
	 * Create new TempLogger instance. Note almost all args are specified as keys in an options object.
	 *
	 * By default, all message metadata is hidden for gui (webpage) messages.
	 *
	 * @param {String} level Logging level name, case insensitive.
	 *
	 * @param {String} level_gui Logging level name for gui messages.
	 * 
	 * @param {boolean} with_timestamp Include timestamp in message.
	 * 
	 * @param {String} name Logger name.
	 * 
	 * @param {boolean} with_lineno Include caller line number in message.
	 * 
	 * @param {boolean} parse_level_prefix If incoming messages will be prefixed with a logging 
	 * level string. If false, the console method (log, info, warn, error) is used to determine
	 * the log level.
	 * 
	 * @param {boolean} with_level Include level name in message.
	 *
	 * @param {boolean} with_always_level_name Include `ALWAYS` as a level name in message if
	 * no level is specified.
	 *
	 * @param {boolean} with_cli_colors Color messages by level in cli.
	 * 
	 * @param {paramType} paramName paramDescription
	 */
	constructor(
		{
			level,
			level_gui,
			with_timestamp,
			name,
			with_lineno,
			parse_level_prefix,
			with_level,
			with_always_level_name, 
			with_cli_colors
		} = {
			level: undefined,
			level_gui: undefined,
			with_timestamp: undefined,
			name: undefined,
			with_lineno: undefined,
			parse_level_prefix: undefined,
			with_level: undefined,
			with_always_level_name: undefined, 
			with_cli_colors: undefined
		},
		replaced
	) {
		if (replaced === undefined) {
			this.children = new Map()
		}
		else {
			// assign children of original logger to this logger
			this.children = replaced.children
		}
		
		// defaults and conversions handled in methods
		this.set_level(level)
		this.set_level_gui(level_gui)
		
		this.set_with_timestamp(
			(with_timestamp === undefined)
			// default
			? false
			// force truthy to boolean
			: with_timestamp == true
		)
		
		this.set_name(name)
		
		this.set_with_lineno(
			(with_lineno === undefined) 
			// default
			? true 
			// force truthy to boolean
			: with_lineno == true
		)
		
		this.set_parse_level_prefix(
			(parse_level_prefix === undefined) 
			// default
			? true 
			// force truthy to boolean
			: parse_level_prefix == true
		)
		
		this.set_with_level(
			(with_level === undefined) 
			// default
			? true 
			// truthy to boolean
			: with_level == true
		)
		
		this.set_with_always_level_name(
			(with_always_level_name === undefined)
			// default
			? false 
			// truthy to boolean
			: with_always_level_name == true
		)
		
		this.set_with_cli_colors(
			(with_cli_colors === undefined) 
			// default
			? true 
			// truthy to boolean
			: with_cli_colors == true
		)
		
		// webpage console
		if (TempLogger.environment == TempLogger.ENV_FRONTEND && !TempLogger.with_webpage_console) {
			window.addEventListener('load', function(e) {
				TempLogger.init_webpage_console()
			})
		}
	}
	
	/**
	 * Log a message to the cli console, and gui if enabled.
	 * 
	 * @param {Object} data The data/message to log.
	 * @param {String} console_method_key Optional console method name to use (usually `log`).
	 */
	log(data, console_method_key) {
		let ts = ''
		if (this.with_timestamp) {
			ts = new Date().toISOString()
		}
		
		let metadata = []
		
		if (this.name !== undefined) {
			metadata.push(this.name)
		}
		
		let lineno
		if (this.with_lineno) {
			lineno = TempLogger.get_caller_line()
			metadata.push(lineno)
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
						// update level
						level = parsed_level
						
						// remove level str from message
						data = data.substring(m.index + m[0].length)
					}
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
		
		let level_str = TempLogger.LEVEL_TO_STR[level]
		if (
			this.with_level && 
			(level != TempLogger.LEVEL_ALWAYS || this.with_always_level_name)
		) {
			metadata.push(level_str)
		}
		
		// determine whether to show the console message
		if (level >= this.level) {
			if (ts.length !== 0) {
				ts += ' '
			}
			
			let prefix = ts + metadata.join('.')
			if (prefix.length !== 0) {
				prefix += ': '
			}
			
			// pick final console method
			console_method_key = TempLogger.LEVEL_TO_CONSOLE_METHOD[level]
			
			let message = prefix + data
			
			// style
			if (this.with_cli_colors && TempLogger.chalk) {
				message = TempLogger.LEVEL_TO_CLI_COLOR[level](message)
			}
			
			// show in console
			TempLogger.CONSOLE_METHOD[console_method_key](message)
		}
		
		// determine whether to show the gui message
		if (
			TempLogger.environment == TempLogger.ENV_FRONTEND && 
			(level >= this.level_gui && level != TempLogger.LEVEL_ALWAYS) &&
			TempLogger.with_webpage_console
		) {
			this.log_gui(data, level)
		}
	}
	
	log_gui(data, level) {
		// parse html template
		let msgbox_el = TempLogger.html_to_element(TempLogger.CMP_MESSAGE_DEFAULT)
		
		msgbox_el.classList.add(`alert-${TempLogger.LEVEL_TO_ALERT_COLOR[level]}`)
		
		let msg_el = msgbox_el.getElementsByClassName(TempLogger.CMP_MESSAGE_CLASS)[0]
		msg_el.innerHTML = data
		
		let close_btn = msgbox_el.getElementsByClassName(TempLogger.CMP_CLOSE_CLASS)[0]
		close_btn.onclick = function(e) {
			msgbox_el.remove()
		}
		
		document.getElementsByClassName(TempLogger.CMP_CONSOLE_CLASS)[0]
		.appendChild(msgbox_el)
	}
	
	/**
	 * Create child logger of this one, or get an existing one.
	 * 
	 * Logger names in the hierarchy use dots as delimiter between parent and child.
	 * For now, all configuration options are handled at the root level, and descendent logger instances
	 * do not have their own options.
	 * 
	 * @example `TempLogger.root.get_child('banana') // name = <root-name>.banana`
	 * 
	 * @param {String} name Child logger name.
	 */
	get_child(name) {
		if (this.children.has(name)) {
			return this.children.get(name)
		}
		else {
			let child = new TempLogger({
				level: this.level,
				level_gui: this.level_gui,
				with_timestamp: this.with_timestamp,
				name: name,
				with_lineno: this.withlineno,
				parse_level_prefix: this.parse_level_prefix,
				with_level: this.with_level,
				with_always_level_name: this.with_always_level_name,
				with_cli_colors: this.with_cli_colors
			})
		
			this.children.set(name, child)
		
			return child
		}
	}
	
	static get_caller_line() {
		try {
			throw new Error('')
		}
		catch (err) {
			let line
			
			try {
				let call_stack = err.stack.split('\n')
				let caller_info = call_stack[4]
				
				if (caller_info == undefined || caller_info.indexOf(':') == -1) {
					caller_info = call_stack[3]
				}
			
				caller_info = caller_info.split(':')
			
				// line number is second to last item in colon-separated list
				line = caller_info[caller_info.length-2]
			}
			catch (e) {
				TempLogger.CONSOLE_METHOD['error'](call_stack)
				throw e
			}
			finally {
				return line
			}
		}
	}
	
	/**
	 * Configure the root logger.
	 * 
	 * All children of the previous root logger will be transferred to this one.
	 * 
	 * @param {Object} constructor_opts Options passed to the root logger constructor.
	 */
	static config(constructor_opts) {
		TempLogger.root = new TempLogger(constructor_opts, TempLogger.root)
		
		return TempLogger.imports_promise.then(() => {
			return TempLogger.root
		})
	}
	
	/**
	 * Set log level at or above which messages will be displayed.
	 * 
	 * @param {(String|Number)} level Level or level name.
	 */
	set_level(level) {
		if (typeof level == 'string') {
			// convert to level number
			level = TempLogger.STR_TO_LEVEL[level.toUpperCase()]
		}
		if (level == undefined) {
			// default
			level = TempLogger.LEVEL_DEBUG
		}
		
		this.level = level
		
		for (let child of this.children.values()) {
			child.set_level(this.level)
		}
	}
	
	/**
	 * Convenience method for `TempLogger.root.set_level`.
	 */
	static set_level(level) {
		TempLogger.root.set_level(level)
	}
	
	/**
	 * @returns {Number} Current level.
	 */
	get_level() {
		return this.level
	}
	
	/**
	 * @returns {Number} Root logger level.
	 */
	static get_level() {
		return TempLogger.root.get_level()
	}
	
	/**
	 * @returns {String} Current level name.
	 */
	get_level_str() {
		return TempLogger.LEVEL_TO_STR[this.get_level()]
	}
	
	/**
	 * @returns {String} Root logger level name.
	 */
	static get_level_str() {
		return TempLogger.root.get_level_str()
	}
	
	/**
	 * Set log level at or above which gui messages will be displayed.
	 * 
	 * @param {(String|Number)} level_gui Level or level name.
	 */
	set_level_gui(level_gui) {
		if (typeof level_gui == 'string') {
			// convert
			level_gui = TempLogger.STR_TO_LEVEL[level_gui.toUpperCase()]
		}
		if (level_gui == undefined) {
			// default
			level_gui = TempLogger.LEVEL_INFO
		}
		
		this.level_gui = level_gui
		
		for (let child of this.children.values()) {
			child.set_level_gui(this.level_gui)
		}
	}
	
	/**
	 * Convenience method for `TempLogger.root.set_level_gui`.
	 */
	static set_level_gui(level_gui) {
		TempLogger.root.set_level_gui(level_gui)
	}
	
	/**
	 * @returns {Number} Current gui level.
	 */
	get_level_gui() {
		return this.level_gui
	}
	
	/**
	 * @returns {Number} Root logger gui level.
	 */
	static get_level_gui() {
		return TempLogger.root.get_level_gui()
	}
	
	/**
	 * @returns {String} Current gui level name.
	 */
	get_level_gui_str() {
		return TempLogger.LEVEL_TO_STR[this.get_level_gui()]
	}
	
	/**
	 * @returns {Number} Root logger gui level name.
	 */
	static get_level_gui_str() {
		return TempLogger.root.get_level_gui_str()
	}
	
	set_with_timestamp(with_timestamp) {
		this.with_timestamp = with_timestamp == true
	}
	
	static set_with_timestamp(with_timestamp) {
		TempLogger.root.set_with_timestamp(with_timestamp)
	}
	
	/**
	 * Set the logger name.
	 * 
	 * @param {Array} names Qualified logger name, including ancestor logger names in order from
	 * root to leaf.
	 */
	set_name(...names) {
		let local_name = names[names.length - 1]
		
		if (local_name === undefined || local_name == '') {
			this.local_name = undefined
			this.name = undefined
		}
		else {
			this.local_name = local_name
			this.name = names.join('.')
		}
		
		// update inherited names in children
		for (let child of this.children) {
			child.set_name(...names.concat([child.local_name]))
		}
	}
	
	static set_name(name) {
		TempLogger.root.set_name(name)
	}
	
	/**
	 * Set whether to show line number.
	 */
	set_with_lineno(with_lineno) {
		this.with_lineno = with_lineno == true
	}
	
	/**
	 * Convenience method for `TempLogger.root.set_with_lineno`.
	 */
	static set_with_lineno(with_lineno) {
		TempLogger.root.set_with_lineno(with_lineno)
	}
	
	/**
	 * Set whether to parse log level as a message prefix.
	 */
	set_parse_level_prefix(parse_level_prefix) {
		this.parse_level_prefix = parse_level_prefix == true
	}
	
	static set_parse_level_prefix(parse_level_prefix) {
		TempLogger.root.set_parse_level_prefix(parse_level_prefix)
	}
	
	/**
	 * Set whether to show level name in message.
	 */
	set_with_level(with_level) {
		this.with_level = with_level == true
	}
	
	static set_with_level(with_level) {
		TempLogger.root.set_with_level(with_level)
	}
	
	/**
	 * Set whether to show messages at the `always` level.
	 */
 	set_with_always_level_name(with_always_level_name) {
		this.with_always_level_name = with_always_level_name == true
	}
	
	static set_with_always_level_name(with_always_level_name) {
		TempLogger.root.set_with_always_level_name(with_always_level_name)
	}
	
	/**
	 * Set whether to display messages in different colors depending on log level in the cli.
	 */
	set_with_cli_colors(with_cli_colors) {
		this.with_cli_colors = with_cli_colors == true
	}
	
	static set_with_cli_colors(with_cli_colors) {
		TempLogger.root.set_with_cli_colors(with_cli_colors)
	}
	
	/**
	 * Add gui console element to the current webpage.
	 */
	static init_webpage_console() {
		let console_el = TempLogger.html_to_element(TempLogger.CMP_CONSOLE_DEFAULT)
		document.getElementsByTagName('body')[0].appendChild(console_el)
		
		TempLogger.with_webpage_console = true
		
		TempLogger.CONSOLE_METHOD['log']('initialized webpage console')
	}
	
	/**
	 * Remove gui console element from the current webpage.
	 */
	static remove_webpage_console() {
		TempLogger.with_webpage_console = false
		
		$(`.${TempLogger.CMP_CONSOLE_CLASS}`).remove()
	}
	
	/**
	 * Create an element ready to be injected into the webpage.
	 * 
	 * Adapted from [this stackoverflow answer](https://stackoverflow.com/a/35385518/10200417).
	 */
	static html_to_element(html) {
	    let template = document.createElement('template')
	    html = html.trim()	// never return a text node of whitespace as the result
	    template.innerHTML = html
	    return template.content.firstChild
	}
}

// optional imports

TempLogger.chalk = undefined

TempLogger.imports_promise = 
import('chalk')
.then((chalk) => {
	// console message coloring
	chalk = chalk.default
	
	TempLogger.chalk = chalk
	TempLogger.LEVEL_TO_CLI_COLOR = {}
	
	TempLogger.LEVEL_TO_CLI_COLOR[TempLogger.LEVEL_DEBUG] = (str) => str
	
	TempLogger.LEVEL_TO_CLI_COLOR[TempLogger.LEVEL_INFO] = chalk.green
	
	TempLogger.LEVEL_TO_CLI_COLOR[TempLogger.LEVEL_WARNING] = chalk.yellow
	
	TempLogger.LEVEL_TO_CLI_COLOR[TempLogger.LEVEL_ERROR] = chalk.red
	
	TempLogger.LEVEL_TO_CLI_COLOR[TempLogger.LEVEL_CRITICAL] = chalk.magenta
	
	TempLogger.LEVEL_TO_CLI_COLOR[TempLogger.LEVEL_ALWAYS] = chalk.inverse
})
.catch((err) => {
	// coloring not available
})

// scoped class variables

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

TempLogger.LEVEL_TO_CONSOLE_METHOD = {}
TempLogger.LEVEL_TO_CONSOLE_METHOD[TempLogger.LEVEL_DEBUG] = 'log'
TempLogger.LEVEL_TO_CONSOLE_METHOD[TempLogger.LEVEL_INFO] = 'info'
TempLogger.LEVEL_TO_CONSOLE_METHOD[TempLogger.LEVEL_WARNING] = 'warn'
TempLogger.LEVEL_TO_CONSOLE_METHOD[TempLogger.LEVEL_ERROR] = 'error'
TempLogger.LEVEL_TO_CONSOLE_METHOD[TempLogger.LEVEL_CRITICAL] = 'error'
TempLogger.LEVEL_TO_CONSOLE_METHOD[TempLogger.LEVEL_ALWAYS] = 'log'

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
`<div class="${TempLogger.CMP_CONSOLE_CLASS} fixed-top px-4 text-start">
</div>`

TempLogger.CMP_MESSAGEBOX_CLASS = `${TempLogger.CSS_CLASS_PREFIX}-msg-box`
TempLogger.CMP_MESSAGE_CLASS = `${TempLogger.CSS_CLASS_PREFIX}-msg`
TempLogger.CMP_CLOSE_CLASS = `${TempLogger.CSS_CLASS_PREFIX}-close`
TempLogger.CMP_MESSAGE_DEFAULT = 
`<div class="${TempLogger.CMP_MESSAGE_CLASS} alert alert-dismissible my-2" role="alert">
	<div class="row">
		<div class="${TempLogger.CMP_MESSAGE_CLASS} col"></div>
		<button 
			type="button" aria-label="close"
			class="${TempLogger.CMP_CLOSE_CLASS} btn-close col-auto">
		</button>
	</div>
</div>`

// patch console.log

for (let method_key of Object.keys(TempLogger.CONSOLE_METHOD)) {
	console[method_key] = function(data) {
		TempLogger.root.log(data, method_key)
	}
}

if (typeof exports != 'undefined') {
	// backend nodejs exports
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
		return TempLogger.config(opt).then((root) => {
			exports.root = root
		})
	}
	
	// setters
	exports.set_level = TempLogger.set_level
	exports.set_level_gui = TempLogger.set_level_gui
	exports.set_with_timestamp = TempLogger.set_with_timestamp
	exports.set_name = TempLogger.set_name
	exports.set_with_lineno = TempLogger.set_with_lineno
	exports.set_parse_level_prefix = TempLogger.set_parse_level_prefix
	exports.set_with_level = TempLogger.set_with_level
	exports.set_with_always_level_name = TempLogger.set_with_always_level_name
	
	// getters
	exports.get_level = TempLogger.get_level
	exports.get_level_str = TempLogger.get_level_str
	exports.get_level_gui = TempLogger.get_level_gui
	exports.get_level_str = TempLogger.get_level_str
	
	// plain console methods. ex: temp_js_logger.CONSOLE_METHOD.log('plain log message')
	exports.CONSOLE_METHOD = TempLogger.CONSOLE_METHOD
	
	// imports promise
	exports.imports_promise = TempLogger.imports_promise
	
	// default config
	exports.config()
}
else {
	// frontend browser
	// environment
	TempLogger.environment = TempLogger.ENV_FRONTEND
	
	// default config
	TempLogger.config()
}
