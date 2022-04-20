export function hasIn<T extends AnyObject>(obj: Partial<T>, prop: keyof T): boolean {
  return prop in obj;
}
