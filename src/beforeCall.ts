import { copyFnProps } from './copyFnProps';

export function beforeCall<
  F extends AnyFunction,
  C extends (...args: Parameters<F>) => void | Promise<void>,
>(
  fn: F,
  beforeCallback: C,
  context: any = undefined
): C extends AnyAsyncFunction
  ? ((...args: Parameters<F>) => Promise<ReturnType<F>>) & AsObject<F>
  : F {
  const wrapper: AnyFunction = (...args: Parameters<F>) => {
    const cbResult = beforeCallback.apply(context, args);
    if (cbResult instanceof Promise) {
      return cbResult.finally(() => fn.apply(context, args) as ReturnType<F>);
    }
    return fn.apply(context, args) as ReturnType<F>;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return copyFnProps(fn, wrapper) as any;
}

export default beforeCall;
