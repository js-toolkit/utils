export function hasIn<T extends AnyObject, K extends T extends T ? keyof T : never>(
  obj: T,
  prop: K
): obj is T extends T ? (K extends keyof T ? T : never) : never {
  return prop in obj;
}
