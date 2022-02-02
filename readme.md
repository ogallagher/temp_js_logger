# temp js logger

Patch and enhance `console` logging methods.

## Sound familiar?

The default scheme for logging in JS is to use the `console` object. If you're not using to a more complete logging library, the default solution is pretty limited. Basically:

1. `console.log` to print undecorated messages to the terminal or browser console.
1. If you're fancy, categorize messages with alternative method names, though in a backend terminal the messages won't appear any different: `log` `info` `warn` `error`.
1. If you're not fancy, maybe you just put a prefix string in the message to show what log level it is, and always use `console.log`.

If you want message metadata, you have to include that yourself. And you don't configure `console` to only print messages at a certain level.

## Then try this!

`temp_js_logger` looks to improve on this common early implementation of logging before a project migrates to a more complete logging library. This means you shouldn't have to change any code in order for `temp_js_logger` to work with your project.

```javascript
const temp_logger = require('./temp_js_logger')

temp_logger.import_promise
.then(() => {
	# I'm only nesting in promise resolve so optional imports (chalk for message coloring) are guaranteed ready
	console.log('DEBUG oh, that was easy')

	console.log('warn but can I configure the level?')

	temp_logger.set_level('info')

	console.log('info of course!')
	console.log('debug ignored')
})
```

## Configuration options

Below is a list of available options, which are passed members of an object to `temp_logger.config`.

### `level`
The logging level at or above which a message must be in order to appear in the console/terminal.

### `level_gui`
The logging level at or above which a message must be in order to appear in the webpage gui.

### `with_timestamp`
Whether to include a timestamp in the message.

### `caller_name`
A name to assign messages to, which will be included in the message.

### `with_lineno`
Whether to include the source code line number in the message.

### `parse_level_prefix`
Whether to determine the level of the logged message using the first word of its content. For example, `console.log('DEBUG hello')` becomes `DEBUG:hello` and `console.log('warning good bye')` becomes `WARNING:good bye`.

### `with_level`
Whether to include the level string/label in the output message.

### `with_always_level_name`
Whether to include the `ALWAYS` level string in messages determined to be at this level, which
is the default for any message that doesn't indicate the level and has `parse_level_prefix` set to `true`.

### `with_cli_colors`
Whether to color the cli messages by level. Note this uses the optional [**chalk**](https://github.com/chalk/chalk) dependency,
the import of which isn't ready until `temp_logger.imports_promise` resolves.

## Implementation details

This only overrides the target `console` methods: `log` `info` `warn` `error`. Other console methods are unaffected.

All identifiers defined by this library are scoped as members of the contained `TempLogger`
class, from which key methods are exposed via `exports`.
