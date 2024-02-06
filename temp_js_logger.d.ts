declare type ChalkInstance = any
declare type SonicBoom = any
interface TempLoggerConstructorOptions {
	/**
	 * Logging level name, case insensitive.
	 */
	level?: number|string
	/**
	 * Logging level name for gui messages.
	 */
	level_gui?: number|string
	/**
	 * Include timestamp in message.
	 */
	with_timestamp?: boolean
	/**
	 * Logger name.
	 */
	name?: string
	/**
	 * Include caller line number in message.
	 */
	with_lineno?: boolean
	/**
	 * If incoming messages will be prefixed with a logging 
	 * level string. If `false`, the console method (log, info, warn, error) is used to determine
	 * the log level.
	 */
	parse_level_prefix?: boolean
	/**
	 * Include level name in message.
	 */
	with_level?: boolean
	/**
	 * Include `ALWAYS` as a level name in message if
	 * no level is specified.
	 */
	with_always_level_name?: boolean
	/**
	 * Color messages by level in cli.
	 */
	with_cli_colors?: boolean
	/**
	 * Whether to output to a log file in a backend environment 
	 * as well as `process.stdout`.
	 */
	log_to_file?: boolean
	/**
	 * Reference to parent logger.
	 */
	parent?: TempLogger
}
export declare class TempLogger {
    /**
     * Child loggers.
     */
    children: Map<string, TempLogger>;
    /**
     * {@link TempLoggerConstructorOptions.parent}
     */
    parent: TempLogger;
    level: number;
    level_gui: number;
    level_file: number;
    /**
     * Logger name with prefixed ancestors.
     */
    name: any;
    with_timestamp: any;
    with_lineno: any;
    parse_level_prefix: any;
    with_level: any;
    with_always_level_name: boolean;
    with_cli_colors: boolean;
    withlineno: any;
    /**
     * Logger name without prefixed ancestors.
     */
    local_name: any;
    log_to_file: boolean;
    static chalk: ChalkInstance;
    static SonicBoom: any;
    static sonic: SonicBoom;
    static LEVEL_DEBUG: number;
    static LEVEL_INFO: number;
    static LEVEL_WARNING: number;
    static LEVEL_ERROR: number;
    static LEVEL_CRITICAL: number;
    static LEVEL_ALWAYS: number;
    static STR_DEBUG: string;
    static STR_INFO: string;
    static STR_WARNING: string;
    static STR_WARN: string;
    static STR_ERROR: string;
    static STR_ERR: string;
    static STR_CRITICAL: string;
    static STR_ALWAYS: string;
    static ENV_UNKNOWN: string;
    static ENV_BACKEND: string;
    static ENV_FRONTEND: string;
    static CONSOLE_METHOD: {
        [key: string]: Function;
    };
    static STR_TO_LEVEL: {
        [key: string]: number;
    };
    static LEVEL_TO_STR: {
        [key: number]: string;
    };
    static LEVEL_TO_CLI_COLOR: {
        [key: number]: ChalkInstance | Function;
    };
    static LEVEL_TO_CONSOLE_METHOD: {
        [key: number]: string;
    };
    static LEVEL_TO_ALERT_COLOR: {
        [key: number]: string;
    };
    static LOG_FILE_DIR: string;
    static LOG_FILE_NAME: string;
    static LOG_FILE_PATH: string;
    static CSS_CLASS_PREFIX: string;
    static CMP_CONSOLE_CLASS: string;
    static CMP_CONSOLE_DEFAULT: string;
    static CMP_MESSAGEBOX_CLASS: string;
    static CMP_MESSAGE_CLASS: string;
    static CMP_CLOSE_CLASS: string;
    static CMP_MESSAGE_DEFAULT: string;
    static imports_promise: Promise<unknown>;
    static root: TempLogger;
    static environment: string;
    static with_webpage_console: boolean;
    static with_log_file: boolean;
    static NODE_VERSION: string;
    static NV_MAJOR: number;
    /**
     * Create new TempLogger instance. Note almost all args are specified as keys in an options object.
     *
     * By default, all message metadata is hidden for gui (webpage) messages.
     *
     * @param constructor_opts Logger options.
     *
     * @param replaced Optional reference to existing logger that this instance will replace.
     */
    constructor(opts?: TempLoggerConstructorOptions, replaced?: TempLogger);
    /**
     * Log a message to the cli console, and gui if enabled.
     *
     * @param data The data/message to log.
     * @param console_method_key Optional console method name to use (usually `log`).
     */
    log(data: object | string, console_method_key: string): void;
    log_gui(data: any, level: number): void;
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
    get_child(name: any): TempLogger;
    static get_child(name: any): TempLogger;
    static get_caller_line(): string;
    /**
     * Configure the root logger.
     *
     * All children of the previous root logger will be transferred to this one.
     *
     * @param {Object} constructor_opts Options passed to the root logger constructor.
     */
    static config(constructor_opts?: TempLoggerConstructorOptions): Promise<TempLogger>;
    /**
     * Set log level at or above which messages will be displayed.
     *
     * @param {(String|Number)} level Level or level name.
     */
    set_level(level: any): void;
    /**
     * Convenience method for `TempLogger.root.set_level`.
     */
    static set_level(level: any): void;
    /**
     * @returns {Number} Current level.
     */
    get_level(): number;
    /**
     * @returns {Number} Root logger level.
     */
    static get_level(): number;
    /**
     * @returns {String} Current level name.
     */
    get_level_str(): string;
    /**
     * @returns {String} Root logger level name.
     */
    static get_level_str(): string;
    /**
     * Set log level at or above which gui messages will be displayed.
     *
     * @param {(String|Number)} level_gui Level or level name.
     */
    set_level_gui(level_gui: any): void;
    /**
     * Convenience method for `TempLogger.root.set_level_gui`.
     */
    static set_level_gui(level_gui: any): void;
    /**
     * @returns {Number} Current gui level.
     */
    get_level_gui(): number;
    /**
     * @returns {Number} Root logger gui level.
     */
    static get_level_gui(): number;
    /**
     * @returns {String} Current gui level name.
     */
    get_level_gui_str(): string;
    /**
     * @returns {Number} Root logger gui level name.
     */
    static get_level_gui_str(): string;
    set_with_timestamp(with_timestamp: any): void;
    static set_with_timestamp(with_timestamp: any): void;
    /**
     * Set the logger name.
     *
     * @param names Qualified logger name, including ancestor logger names in order from
     * root to leaf.
     */
    set_name(...names: string[]): void;
    /**
     * Convenience method for `TempLogger.root.set_name(...names)`.
     */
    static set_name(...names: string[]): void;
    /**
     * Set whether to show line number.
     */
    set_with_lineno(with_lineno: any): void;
    /**
     * Convenience method for `TempLogger.root.set_with_lineno`.
     */
    static set_with_lineno(with_lineno: any): void;
    /**
     * Set whether to parse log level as a message prefix.
     */
    set_parse_level_prefix(parse_level_prefix: any): void;
    static set_parse_level_prefix(parse_level_prefix: any): void;
    /**
     * Set whether to show level name in message.
     */
    set_with_level(with_level: any): void;
    static set_with_level(with_level: any): void;
    /**
     * Set whether to show messages at the `always` level.
     */
    set_with_always_level_name(with_always_level_name: any): void;
    static set_with_always_level_name(with_always_level_name: any): void;
    /**
     * Set whether to display messages in different colors depending on log level in the cli.
     */
    set_with_cli_colors(with_cli_colors: any): void;
    static set_with_cli_colors(with_cli_colors: any): void;
    set_log_to_file(log_to_file: any): void;
    static set_log_to_file(log_to_file: any): void;
    /**
     * Patch `console` logging methods using this logger.
     */
    patch_console(): void;
    /**
     * Convenience method for `TempLogger.root.patch_console`.
     */
    static patch_console(): void;
    /**
     * Initialize log file.
     */
    static init_log_file(): Promise<unknown>;
    /**
     * Add gui console element to the current webpage.
     */
    static init_webpage_console(): void;
    /**
     * Remove gui console element from the current webpage.
     */
    static remove_webpage_console(): void;
    /**
     * Create an element ready to be injected into the webpage.
     *
     * Adapted from [this stackoverflow answer](https://stackoverflow.com/a/35385518/10200417).
     */
    static html_to_element(html: string): ChildNode;
}
export var root: typeof TempLogger.root
export var config: (opt?: TempLoggerConstructorOptions) => Promise<void>
export var set_level: typeof TempLogger.set_level
export var set_level_gui: typeof TempLogger.set_level_gui
export var set_with_timestamp: typeof TempLogger.set_with_timestamp
export var set_name: typeof TempLogger.set_name
export var set_with_lineno: typeof TempLogger.set_with_lineno
export var set_parse_level_prefix: typeof TempLogger.set_parse_level_prefix
export var set_with_level: typeof TempLogger.set_with_level
export var set_with_always_level_name: typeof TempLogger.set_with_always_level_name
export var get_level: typeof TempLogger.get_level
export var get_level_str: typeof TempLogger.get_level_str
export var get_level_gui: typeof TempLogger.get_level_gui
export var get_level_gui_str: typeof TempLogger.get_level_gui_str
export var get_child: typeof TempLogger.get_child
export var CONSOLE_METHOD: typeof TempLogger.CONSOLE_METHOD
export var imports_promise: Promise<void>
