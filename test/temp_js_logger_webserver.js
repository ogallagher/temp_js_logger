#!node

/**
 * Owen Gallagher
 * 2022-01-30
 */

Promise.all([
	import('express'),
	import('cors'),
	import('../temp_js_logger.js')
])
.then(function(modules) {
	const express = modules[0].default
	const cors = modules[1].default
	const temp_logger = modules[2].default
	const TempLogger = temp_logger.TempLogger
	
	// reference to external (unpatched) console.log method
	const ext_log = TempLogger.CONSOLE_METHOD['log']
	
	// init logging
	temp_logger.config({
		level: 'debug',
		with_timestamp: false,
		caller_name: 'temp_js_logger_webserver',
		with_lineno: true,
		parse_level_prefix: true,
		with_level: true,
		with_always_level_name: false,
		with_cli_colors: true
	})
	// nest subsequent logging commands to wait for colors
	.then(() => {
		console.log(`info configured temp_logger.root:\n${
			JSON.stringify(temp_logger.root, null, 2)
		}`)
		
		// serve public dir
		let PUBLIC_DIR = `${__dirname}/public`
		console.log(`DEBUG serving ${PUBLIC_DIR}/`)
	
		// server instance
		const server = express()
	
		// enable cross-origin requests for same origin html imports
		server.use(cors({
			// allow all origins
			origin: '*'
		}))
	
		server.set('port', process.env.PORT || 80)
	
		// serve website from public/
		server.use(express.static(PUBLIC_DIR))
	
		// route root path to main page
		server.get('/', function(req,res,next) {
			console.log(`INFO routing root path to /temp_js_logger.html`)
			res.sendFile(`./temp_js_logger.html`, {
				root: PUBLIC_DIR
			})
		})
	
		// http server
		server.listen(server.get('port'), on_start)
	})
	
	// methods
	
	function on_start() {
		console.log('INFO server running')
	}
})
.catch((err) => {
	console.error(err.stack)
	console.error('error make sure you run the `npm install` command to get needed node modules first')
	process.exit(1)
})
