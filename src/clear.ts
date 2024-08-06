/* eslint-disable no-param-reassign */
type ClearResult<T extends AnyObject> = T extends ReadonlyArray<unknown> ? T : Partial<T>;

export function clear<T extends AnyObject>(obj: T): ClearResult<T> {
  if (Array.isArray<unknown[]>(obj)) {
    // obj.length > 0 && obj.splice(0, obj.length);
    if (obj.length > 0) {
      obj.length = 0;
    }
  } else {
    Object.getOwnPropertyNames(obj).forEach((key) => {
      delete obj[key];
    });
  }
  return obj as ClearResult<T>;
}
