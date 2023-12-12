/* eslint-disable @typescript-eslint/ban-types */

export function copyFnProps<T extends AnyFunction>(source: T, dest: T): T {
  // Do not use `Object.getOwnPropertyDescriptors` for ES5 capability
  const descs = Object.getOwnPropertyNames(source).reduce(
    (acc, prop) => {
      const desc = Object.getOwnPropertyDescriptor(source, prop);
      desc && (acc[prop as keyof Function] = desc);
      return acc;
    },
    {} as Partial<Record<keyof Function, PropertyDescriptor>>
  );

  delete descs.arguments;
  delete descs.caller;
  delete descs.length;
  delete descs.name;
  delete descs.prototype;
  delete descs.apply;
  delete descs.call;
  delete descs.bind;
  delete descs.toString;

  Object.defineProperties(dest, descs);

  return dest;
}
