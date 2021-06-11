export default function beforeCall<
  F extends AnyFunction,
  C extends (...args: Parameters<F>) => void | Promise<void>
>(
  fn: F,
  callback: C,
  context: any = undefined
): C extends AnyAsyncFunction
  ? ((...args: Parameters<F>) => Promise<ReturnType<F>>) & AsObject<F>
  : F {
  const wrapper: AnyFunction = (...args: Parameters<F>) => {
    const cbResult = callback(...args);
    if (cbResult instanceof Promise) {
      return cbResult.finally(() => fn.call(context, ...args) as ReturnType<F>);
    }
    return fn.call(context, ...args) as ReturnType<F>;
  };

  const descs = Object.getOwnPropertyDescriptors(fn);
  delete descs.arguments;
  delete descs.caller;
  delete descs.length;
  delete descs.name;
  delete descs.prototype;

  Object.defineProperties(wrapper, descs);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return wrapper as any;
}
