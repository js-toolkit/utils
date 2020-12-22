export default function beforeCall<F extends AnyFunction>(
  fn: F,
  callback: (...args: Parameters<F>) => void
): F {
  const wrapper: AnyFunction = (...args: Parameters<F>) => {
    callback(...args);
    return fn.call(undefined, ...args) as ReturnType<F>;
  };

  const descs = Object.getOwnPropertyDescriptors(fn);
  delete descs.arguments;
  delete descs.caller;
  delete descs.length;
  delete descs.name;
  delete descs.prototype;

  Object.defineProperties(wrapper, descs);

  return wrapper as F;
}
