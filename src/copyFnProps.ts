export default function copyFnProps<T extends AnyFunction>(source: T, dest: T): T {
  const descs = Object.getOwnPropertyDescriptors(source);
  delete descs.arguments;
  delete descs.caller;
  delete descs.length;
  delete descs.name;
  delete descs.prototype;
  Object.defineProperties(dest, descs);
  return dest;
}
