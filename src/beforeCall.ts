export default function beforeCall<F extends AnyFunction>(
  fn: F,
  callback: (...args: Parameters<F>) => void
): F {
  const wrapper: AnyFunction = (...args: Parameters<F>) => {
    callback(...args);
    return fn.call(undefined, ...args) as ReturnType<F>;
  };

  Object.defineProperties(wrapper, Object.getOwnPropertyDescriptors(fn));

  return wrapper as F;
}
