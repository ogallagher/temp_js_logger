#!node

/**
 * @fileoverview temp_js_logger cli test driver.
 * 
 * TODO test logger hierarchy
 * 
 * @author <github.com/ogallagher> (Owen Gallagher)
 */

console.log('this is what program messages looked like before using temp_js_logger')
console.log('critical but check out what happens when I use it!\n')

const temp_logger = require('../temp_js_logger')

main()

async function main() {
	await temp_logger.imports_promise
	
	console.log('DEBUG oh, that was easy')

	console.log('warn but can I configure the level?')

	temp_logger.set_level('info')

	console.log(`info of course! level is ${temp_logger.get_level_str()}`)
	console.log('debug ignored')

	console.log('in case you missed it, there was a debug message that I just suppressed')
	console.log('critical if you saw it, something is not working.\n')

	let logging_config = {
		level: 'warning',
		with_timestamp: true, 
		name: 'test-cli-driver', 
		with_lineno: true, 
		parse_level_prefix: false, 
		with_level: true,
		with_always_level_name: true, 
		with_cli_colors: false,
		log_to_file: true
	}
	console.log(`info now let\'s try an alternate configuration:\n${
		JSON.stringify(logging_config, null, 2)
	}`)
	await temp_logger.config(logging_config)
	
	console.log('this is ignored because console.log maps to DEBUG')
	console.info(`this is ignored because INFO < ${
		temp_logger.get_level()
	}=${
		temp_logger.get_level_str()
	}`)

	console.warn('see readme.md or documentation in the source for explanation of these options')

	console.error('DO NOT PANIC. Everything is fine!')
	
	console.warn('enabling parse_level_prefix and with_always_level_name')
	
	temp_logger.set_parse_level_prefix(true)
	temp_logger.set_with_always_level_name(true)
	
	console.log('this is an always-level message, since it has no prefix specified')
	
	console.log('warning creating child loggers')
	
	let artichoke = temp_logger.get_child('artichoke')
	artichoke.log('critical artichoke logger initialized')
	let bagel = temp_logger.get_child('bagel')
	bagel.log('critical bagel logger initialized')
	
	artichoke.patch_console()
	console.log('warn artichoke is now the active logger, used to patch `console.log`')
}
