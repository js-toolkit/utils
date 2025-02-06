/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
import { hasIn } from '../hasIn';
import { Plugin } from './Plugin';
import log from './log';

// const levelMethodMap: Record<log.Level, keyof Console | 'none'> = {
//   none: 'none',
//   error: 'error',
//   warn: 'warn',
//   info: 'info',
//   debug: 'debug',
//   v1: 'debug',
//   v2: 'debug',
//   trace: 'trace',
// };

// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
export class ConsolePlugin extends Plugin {
  override initialize(): void {}

  override notifyOfChange(): void {}

  override factory(_logger: log.Logger, level: log.Level): log.LoggingMethod | undefined {
    if (typeof console === 'undefined' || level === 'none') {
      return undefined;
    }
    // const method = levelMethodMap[level];
    const method = level as keyof Console;
    const methodName =
      hasIn(console, method) && typeof console[method] === 'function' ? method : 'debug';
    return (console[methodName] as log.LoggingMethod).bind(console);
    // if (methodName) {
    //   return (console[methodName] as log.LoggingMethod).bind(console);
    // }
    // console.warn(`Unknown method '${methodName}'.`);
    // return undefined;
  }
}
