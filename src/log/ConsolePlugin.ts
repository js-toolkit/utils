/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
import { hasIn } from '../hasIn';
import { Plugin } from './Plugin';
import type log from './log';

// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
export class ConsolePlugin extends Plugin {
  override initialize(): void {}

  override notifyOfChange(): void {}

  override factory(_logger: log.Logger, level: log.Level): log.LoggingMethod | undefined {
    if (typeof console === 'undefined') {
      return undefined;
    }
    const method = level as keyof Console;
    const methodName =
      hasIn(console, method) && typeof console[method] === 'function' ? method : undefined;
    if (methodName) {
      return (console[methodName] as log.LoggingMethod).bind(console);
    }
    return undefined;
  }
}
