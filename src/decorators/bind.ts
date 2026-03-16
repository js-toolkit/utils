export type DefaultOrBabelDescriptor<T> = TypedPropertyDescriptor<T> & {
  initializer?: (() => AnyFunction) | undefined;
};

/** Bind method to instance. */
export function bind<T extends AnyFunction>(
  target: object,
  propertyKey: string | symbol,
  descriptor: DefaultOrBabelDescriptor<T>
): DefaultOrBabelDescriptor<T> {
  // Babel property method decorator:
  if (descriptor.initializer) {
    const { initializer, ...rest } = descriptor;
    return {
      ...rest,
      initializer() {
        // N.B: we can't immediately invoke initializer; this would be wrong
        const fn = initializer.call(this);
        return fn.bind(this);
      },
    };
  }

  return {
    configurable: true,
    enumerable: false,
    get(this: typeof target & AnyObject) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { value, get, set, ...rest } = descriptor;
      Object.defineProperty(this, propertyKey, {
        ...rest,
        value: value?.bind(this),
      });
      return this[propertyKey] as T;
    },
  };
}
