/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

export type DefaultOrBabelDescriptor<T> = TypedPropertyDescriptor<T> & {
  initializer?: (() => any) | undefined;
};

/** Bind method to instance. */
export function bind<T extends (...args: any[]) => any>(
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
        const fn: Function = initializer.call(this);
        return fn.bind(this);
      },
    };
  }

  return {
    configurable: true,
    enumerable: false,
    get(this: typeof target) {
      const { value, get, set, ...rest } = descriptor;
      Object.defineProperty(this, propertyKey, {
        ...rest,
        value: value?.bind(this),
      });
      return this[propertyKey];
    },
  };
}

export default bind;
