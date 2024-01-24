/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */

type OmitByPredicate<O extends AnyObject, T extends O[keyof O], K extends keyof O> =
  | ((value: O[typeof key], key: keyof O) => value is T)
  | ((value: O[typeof key], key: keyof O) => key is K)
  | ((value: O[typeof key], key: keyof O) => boolean);

type OmitByResult<
  O extends AnyObject,
  T extends O[keyof O] = never,
  K extends keyof O = never,
> = IfExtends<
  T,
  O[keyof O],
  PartialSome<O, KeysOfType<O, T>>,
  IfExtends<K, keyof O, PartialSome<O, K>, Partial<O>>
>;

export function omitBy<
  O extends AnyObject,
  T extends O[keyof O] = never,
  K extends keyof O = never,
>(obj: O, predicate: OmitByPredicate<O, T, K>): OmitByResult<O, T, K> {
  const result: AnyObject = {};
  for (const key in obj) {
    const equals = predicate(obj[key], key);
    if (!equals) {
      result[key] = obj[key];
    }
  }
  return result as OmitByResult<O, T, K>;
}

// const o = omitBy({ a: 0, b: undefined }, (val) => val != null);
// const o = omitBy({ a: 0, b: undefined }, (val): val is undefined => val == null);
// const o = omitBy({ a: 0, b: undefined }, (_, key): key is 'a' => key === 'a');
// const o = omitBy([1, 2, 3, undefined], (val): val is undefined => val == null);
