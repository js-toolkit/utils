/* eslint-disable no-restricted-syntax */

import type { SelectByPredicate } from './omitBy';

type PickByResult<
  O extends AnyObject,
  T extends O[keyof O] = never,
  K extends keyof O = never,
> = IfExtends<
  T,
  O[keyof O],
  PartialBut<O, KeysOfType<O, T>>,
  IfExtends<K, keyof O, PartialBut<O, K>, Partial<O>>
>;

export function pickBy<
  O extends AnyObject,
  T extends O[keyof O] = never,
  K extends keyof O = never,
>(obj: O, predicate: SelectByPredicate<O, T, K>): PickByResult<O, T, K> {
  const result: AnyObject = {};
  for (const key in obj) {
    if (predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }
  return result as PickByResult<O, T, K>;
}

// const o = pickBy({ a: 0, b: undefined }, (val) => val != null);
// const o = pickBy({ a: 0, b: undefined }, (val): val is undefined => val == null);
// const o = pickBy({ a: 0, b: undefined }, (_, key): key is 'a' => key === 'a');
// const o = pickBy([1, 2, 3, undefined], (val): val is undefined => val == null);
