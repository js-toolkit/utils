/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-use-before-define */
import type { Option } from '../fp/Option';

export type JSONPrimitive = string | number | boolean | null | undefined;

export interface JSONObject extends Record<string, JSONValue> {}

export interface JSONArray extends ReadonlyArray<JSONValue> {}

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

/** Like Date object, Moment object, luxon.DateTime object */
export interface ValueContainer<A extends JSONPrimitive> {
  valueOf: () => A;
}

type ExcludeFunctions<A extends AnyObject> = ExcludeKeysOfType<A, AnyFunction>;

type ValidProps<A extends AnyObject, OmitKeys extends keyof any> = ExcludeFunctions<
  Omit<A, OmitKeys | keyof JSONSerializable<any, any>>
>;

type JSONArrayOf<
  A,
  IsReadonly extends boolean,
  OmitKeys extends ExtractKeys<A>
> = IsReadonly extends true ? ReadonlyArray<Jsonify<A, OmitKeys>> : Array<Jsonify<A, OmitKeys>>;

type Optional<A extends AnyObject, OmitKeys extends ExtractKeys<A>> = {
  [P in Exclude<keyof ExtractKeysOfType<A, Option<any>>, OmitKeys>]?: Jsonify<A[P], OmitKeys>;
};

type NonOptional<A extends AnyObject, OmitKeys extends ExtractKeys<A>> = {
  [P in keyof ValidProps<ExcludeKeysOfType<A, Option<any>>, OmitKeys>]: Jsonify<A[P], OmitKeys>;
};

type ObjectToJSON<A extends AnyObject, OmitKeys extends ExtractKeys<A>> = keyof ValidProps<
  A,
  OmitKeys
> extends never
  ? A extends ValueContainer<infer R>
    ? R
    : {} // eslint-disable-line @typescript-eslint/ban-types
  : Optional<A, OmitKeys> & NonOptional<A, OmitKeys>;

type ExtractKeys<A> = A extends Option<infer T>
  ? ExtractKeys<T>
  : A extends JSONSerializable<infer T, any>
  ? ExtractKeys<T>
  : A extends ReadonlyArray<infer T>
  ? ExtractKeys<T>
  : A extends AnyObject
  ? keyof A
  : never;

export type Jsonify<A, OmitKeys extends ExtractKeys<A> = never> = A extends Option<infer T>
  ? Jsonify<T, Extract<OmitKeys, ExtractKeys<T>>> | undefined
  : A extends JSONSerializable<infer T, any>
  ? Jsonify<T, Extract<OmitKeys, ExtractKeys<T>>>
  : A extends ReadonlyArray<infer T>
  ? JSONArrayOf<T, A extends Array<any> ? false : true, Extract<OmitKeys, ExtractKeys<T>>>
  : A extends Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array
  ? Array<number>
  : A extends AnyObject
  ? ObjectToJSON<A, OmitKeys>
  : A extends JSONValue
  ? A
  : string;

// type A = Exclude<
//   NonNullable<
//     Jsonify<({ a: { aa: string } | undefined; b: number } | undefined | number)[], 'a'>
//   >[number],
//   number | undefined
// >;
// type A = ExtractKeys<Array<{ a: { aa: string } | undefined } | undefined | string | number>>;
// type A = ArrayToJSON<Array<{ a: { aa: string } | undefined } | undefined | string | number>, never>;
// type A = ArrayToJSON<Int8Array, never>;

export interface JSONSerializable<A extends AnyObject, OmitKeys extends ExtractKeys<A> = never> {
  /**
   * Just for correct infering: https://github.com/Microsoft/TypeScript/issues/26688
   * It's required to define in implementation for correct typing with `JSONModel`.
   * It might be just equals `this`.
   */
  // Must be declared!
  // Because `Date` type has `toJSON` method and it incorrectly determined as JSONSerializable
  // because generic type `A` will be erased due to the fact that it is not used.
  // It needs to remove with TS 3.4.1 but may be present with 3.4.5+
  readonly _serializable: JSONSerializable<A, OmitKeys>;
  toJSON(): Jsonify<A, OmitKeys>;
}
