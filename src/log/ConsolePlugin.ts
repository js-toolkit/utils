/* eslint-disable class-methods-use-this */
import { hasIn } from '../hasIn';
import { noop } from '../noop';
import { Plugin } from './Plugin';
import type log from './log';

// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
export class ConsolePlugin extends Plugin {
  override initialize(): void {}

  override notifyOfChange(): void {}

  override factory(_logger: log.Logger, method: log.Level): log.LoggingMethod {
    if (typeof console === 'undefined') {
      return noop;
    }
    const level = method as keyof Console;
    const methodName =
      hasIn(console, level) && typeof console[level] === 'function' ? level : 'log';
    if (console[methodName]) {
      return (console[methodName] as log.LoggingMethod).bind(console);
    }
    return noop;
  }
}
