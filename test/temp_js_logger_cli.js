#!node

// Owen Gallagher <github.com/ogallagher>
// temp_js_logger cli test driver

console.log('this is what program messages looked like before using temp_js_logger')
console.log('critical but check out what happens when I use it!\n')

const temp_logger = require('../temp_js_logger')
console.log

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
	caller_name: 'test-cli-driver', 
	with_lineno: true, 
	parse_level_prefix: false, 
	with_level: true,
	with_always_level_name: true, 
}
console.log(`now let\'s try an alternate configuration:\n${
	JSON.stringify(logging_config, null, 2)
}`)
temp_logger.config(logging_config)

console.log('this is ignored because console.log maps to DEBUG')
console.info(`this is ignored because INFO < ${
	temp_logger.get_level()
}=${
	temp_logger.get_level_str()
}`)

console.warn('see readme.md or documentation in the source for explanation of these options')

console.error('DO NOT PANIC. Everything is fine!')
