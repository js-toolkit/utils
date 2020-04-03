/* eslint-disable @typescript-eslint/no-unused-vars */

export default function bind<T extends (...args: any[]) => any>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
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
