/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
import { hasIn } from '../hasIn';
import { Plugin } from './Plugin';
import type log from './log';

interface Config {
  readonly prefix?: boolean;
}

// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
export class ConsolePlugin extends Plugin {
  override initialize(): void {}

  override notifyOfChange(): void {}

  override factory(
    logger: log.Logger | log.ReadonlyLogger,
    level: log.Level,
    { prefix = false }: Config
  ): log.LoggingMethod | undefined {
    if (typeof console === 'undefined' || level === 'none') {
      return undefined;
    }
    // const method = levelMethodMap[level];
    const method = level as keyof Console;
    const methodName =
      hasIn(console, method) && typeof console[method] === 'function' ? method : 'debug';
    const origin = (console[methodName] as log.LoggingMethod).bind(console);
    if (prefix) {
      return (...args) => {
        return origin(`${logger.name}:`, ...args);
      };
    }
    return origin;
  }
}
