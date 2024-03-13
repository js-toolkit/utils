/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { noop } from '../noop';
import type { GetOverridedKeys } from '../types/augmentation';
import { Plugin as PluginBase } from './Plugin';
import { ConsolePlugin } from './ConsolePlugin';

type LogMethodFactory = (
  method: log.Level | log.LevelNumber,
  logger: log.Logger,
  plugins: (typeof state)['plugins']
) => log.LoggingMethod;

type PluginConfigMap = Record<
  string,
  [plugin: log.Plugin, configs: Record<log.Logger['name'], AnyObject>]
>;

const state = {
  rootLoggerName: '',
  defaultLevel: 'debug' satisfies log.Level as log.Level,
  loggers: {} as Record<string, log.Logger>,
  plugins: {} as PluginConfigMap,
  levels: ['none', 'error', 'warn', 'info', 'debug', 'trace'] as const as log.Levels,
  factory: defaultMethodFactory as LogMethodFactory,
};

function getLoggersList(): log.Logger[] {
  return Object.values(state.loggers);
}

function getPluginsList(): log.Plugin[] {
  return Object.values(state.plugins).flatMap(([p]) => p);
}

function defaultMethodFactory(
  method: log.Level | log.LevelNumber,
  logger: log.Logger,
  plugins: PluginConfigMap
): log.LoggingMethod {
  const chain: log.LoggingMethod[] = [];
  const level = log.normalizeLevel(method);

  Object.values(plugins).forEach(([plugin, configs]) => {
    const rootConfig = configs[state.rootLoggerName];
    const loggerConfig = configs[logger.name];
    const newMethod = plugin.factory(logger, level, { ...rootConfig, ...loggerConfig });
    newMethod && chain.push(newMethod);
  });

  return (...message: unknown[]) => {
    for (let i = 0; i < chain.length; i += 1) {
      chain[i](...message);
    }
  };
}

function buildMethods(logger: log.Logger): void {
  const levelIdx = logger.getLevelNumber();
  for (let i = 0; i < state.levels.length - 1; i += 1) {
    const level = state.levels[i];
    logger[level] = levelIdx < i ? noop : state.factory(level, logger, state.plugins);
  }
}

function removeMethods(logger: log.Logger): void {
  for (let i = 0; i < state.levels.length - 1; i += 1) {
    delete logger[state.levels[i]];
  }
}

type LoggerMethods = { [P in log.Level]: (...args: unknown[]) => void };

interface Logger extends LoggerMethods {}

class Logger {
  readonly name: string;
  readonly #defaultLevel: log.Level;
  #level: log.Level | undefined;

  constructor(name: string, defaultLevel: log.Level) {
    this.name = name;
    this.#defaultLevel = defaultLevel;
    this.setLevel(defaultLevel);
    getPluginsList().forEach((plugin) => plugin.initialize(this));
  }

  // eslint-disable-next-line class-methods-use-this
  getLevels(): log.Levels {
    return log.getLevels();
  }

  getLevel(): log.Level {
    return this.#level ?? this.#defaultLevel;
  }

  getLevelNumber(): number {
    return this.getLevels().indexOf(this.getLevel());
  }

  setLevel(level: log.Level | log.LevelNumber): this {
    const nextLevel = log.normalizeLevel(level);
    const prevLevel = this.#level;

    if (prevLevel === nextLevel) return this;

    if (!this.getLevels().includes(nextLevel)) {
      throw new Error(`Invalid level: ${nextLevel}`);
    }

    this.#level = nextLevel;
    // If really changed
    if (prevLevel !== this.#level) {
      buildMethods(this);
      // If not initial setup
      prevLevel != null && getPluginsList().forEach((plugin) => plugin.notifyOfChange(this));
    }
    return this;
  }

  isLevelEnabled(level: log.Level | log.LevelNumber): boolean {
    return this.getLevelNumber() >= this.getLevels().indexOf(log.normalizeLevel(level));
  }

  log(...message: unknown[]): void {
    this.debug && this.debug(...message);
  }

  use(plugin: log.Plugin | string, config?: AnyObject | undefined): this {
    if (plugin instanceof log.Plugin) {
      log.register(plugin);
    }
    const pluginName = typeof plugin === 'string' ? plugin : plugin.name;
    const usePlugin = state.plugins[pluginName];
    if (!usePlugin) throw new Error(`Invalid plugin: ${pluginName}`);
    usePlugin['1'][this.name] = config || {};
    buildMethods(this);
    return this;
  }
}

type LoggerType = Logger;

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace log {
  // Use this remap for vscode quick fix's 'Implement inherited abstract class' in custom plugin impl
  // eslint-disable-next-line no-shadow
  export type Logger = { [P in keyof LoggerType]: LoggerType[P] };

  export const Plugin = PluginBase;
  export type Plugin = PluginBase;

  export type LoggingMethod = (...message: unknown[]) => void;

  export type Levels = UnionToTuple<Level>;
  export type LevelNumber = TupleIndices<Levels>;

  export interface LevelsOverrides {}

  export type Level = GetOverridedKeys<
    'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace',
    LevelsOverrides
  >;

  export interface ConfigureOptions {
    readonly levels: Levels;
    readonly level: Level;
    readonly factory?: LogMethodFactory | undefined;
  }

  export function normalizeLevel(level: Level | LevelNumber): log.Level {
    return typeof level === 'number' ? state.levels[level] : level;
  }

  export function getDefaultLevel(): Level {
    return state.defaultLevel;
  }

  export function setDefaultLevel(level: Level | LevelNumber): void {
    state.defaultLevel = normalizeLevel(level);
  }

  export function getLevels(): Levels {
    return state.levels;
  }

  export function getLogger(name: string, level?: Level | LevelNumber | undefined): Logger {
    if (!state.loggers[name]) {
      const logger = new Logger(name, normalizeLevel(level ?? getDefaultLevel()));
      state.loggers[name] = logger;
    }
    const logger = state.loggers[name];
    // If update level of existing logger
    if (level != null && logger.getLevel() !== normalizeLevel(level)) {
      logger.setLevel(level);
    }
    return logger;
  }

  export function getLoggers(): Record<string, Logger> {
    return { ...state.loggers };
  }

  export function getPlugins(): Record<string, Plugin> {
    return Object.entries(state.plugins).reduce(
      (acc, [name, [pl]]) => {
        acc[name] = pl;
        return acc;
      },
      {} as Record<string, Plugin>
    );
  }

  export function configure({
    levels: newLevels,
    level: newLevel,
    factory,
  }: ConfigureOptions): void {
    const loggers = getLoggersList();
    loggers.forEach((logger) => removeMethods(logger));

    state.levels = newLevels;
    setDefaultLevel(newLevel);
    if (factory) {
      state.factory = factory;
    }

    loggers.forEach((logger) => logger.setLevel(newLevel));
  }

  export function register(plugin: log.Plugin): void {
    const pluginName = plugin.name;
    if (!state.plugins[pluginName]) {
      state.plugins[pluginName] = [plugin, {}];
    }
  }

  export function use(plugin: log.Plugin | string, config?: AnyObject | undefined): void {
    if (plugin instanceof log.Plugin) {
      register(plugin);
    }
    const loggers = getLoggersList();
    loggers.forEach((logger) => logger.use(plugin, config));
  }

  // Use console by default
  use(new ConsolePlugin('console'));
  // Create root logger
  // getLogger(state.rootLoggerName);
}

export default log;
