/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-use-before-define */

type OmitByPredicate<O extends AnyObject, T extends O[keyof O] = O[keyof O]> =
  | ((value: O[typeof key], key: keyof O) => value is T)
  | ((value: O[typeof key], key: keyof O) => boolean);

export function omitBy<O extends AnyObject, T extends O[keyof O]>(
  obj: O,
  predicate: OmitByPredicate<O, T>
): O[keyof O] extends T ? Partial<O> : PartialSome<O, KeysOfType<O, T>> {
  // ): O[keyof O] extends T ? Partial<O> : ExcludeKeysOfType<O, T> {
  const result: AnyObject = {};
  Object.getOwnPropertyNames(obj).forEach((key) => {
    const equals = predicate(obj[key], key);
    if (!equals) {
      result[key] = obj[key];
    }
  });
  return result as any;
}

export default omitBy;

// const o = omitBy({ a: 0, b: undefined }, (val) => val != null);
// const o = omitBy({ a: 0, b: undefined }, (val): val is undefined => val == null);
