type ClearResult<T extends AnyObject> = T extends ReadonlyArray<unknown> ? T : Partial<T>;

export default function clear<T extends AnyObject>(obj: T): ClearResult<T> {
  if (Array.isArray(obj)) {
    obj.splice(0, obj.length);
  } else {
    Object.getOwnPropertyNames(obj).forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      delete obj[key];
    });
  }
  return obj as ClearResult<T>;
}
