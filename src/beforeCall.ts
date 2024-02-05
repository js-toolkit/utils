/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { copyFnProps } from './copyFnProps';

export function beforeCall<
  F extends AnyFunction,
  C extends (...args: Parameters<F>) => void | Promise<void>,
>(
  fn: F,
  beforeCallback: C,
  /** Might be a function. */
  context: unknown = undefined
): C extends AnyAsyncFunction
  ? ((...args: Parameters<F>) => Promise<ReturnType<F>>) & AsObject<F>
  : F {
  function wrapper(...args: Parameters<F>): unknown {
    const contexValue = typeof context === 'function' ? context() : context;
    const cbResult = beforeCallback.apply(contexValue, args);
    if (cbResult instanceof Promise) {
      return cbResult.finally(() => fn.apply(contexValue, args));
    }
    return fn.apply(contexValue, args);
  }

  return copyFnProps(fn, wrapper as AnyFunction) as any;
}
