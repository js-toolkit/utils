/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { ExcludeKeysOfType, ExtractKeysOfType } from './index';
import { Option } from './fp';

export type JSONPrimitives = string | number | boolean | null | undefined;

export type JSONTypes = JSONPrimitives | JSONObject | JSONArray;

export interface JSONObject extends Record<string, JSONTypes> {}

export interface JSONArray extends ReadonlyArray<JSONTypes> {}

/** Like Date object, Moment object, luxon.DateTime object */
export interface ValueContainer<A extends JSONPrimitives> {
  valueOf: () => A;
}

type ExcludeFunctions<A extends object> = ExcludeKeysOfType<A, Function>;

type ValidProps<A extends object, OmitKeys extends keyof any> = ExcludeFunctions<Omit<A, OmitKeys>>;

type UnknownType = string;

type ArrayToJSON<
  A,
  IsReadonly extends boolean,
  OmitKeys extends keyof any
> = IsReadonly extends true
  ? ReadonlyArray<A extends object ? ObjectToJSON<A, OmitKeys> : UnknownType>
  : Array<A extends object ? ObjectToJSON<A, OmitKeys> : UnknownType>;

type Optional<A extends object, OmitKeys extends keyof any> = {
  [P in keyof ExtractKeysOfType<A, Option<any>>]?: JSONValue<A[P], OmitKeys>;
};

type NonOptional<A extends object, OmitKeys extends keyof any> = {
  [P in keyof ValidProps<ExcludeKeysOfType<A, Option<any>>, OmitKeys>]: JSONValue<A[P], OmitKeys>;
};

export type ObjectToJSON<A extends object, OmitKeys extends keyof any> = keyof ValidProps<
  A,
  OmitKeys
> extends never
  ? A extends ValueContainer<infer R>
    ? R
    : {}
  : Optional<A, OmitKeys> & NonOptional<A, OmitKeys>;

type ArrayOrObjectToJSON<A, OmitKeys extends keyof any> = A extends ReadonlyArray<infer T>
  ? A extends Array<infer T>
    ? ArrayToJSON<T, false, OmitKeys>
    : ArrayToJSON<T, true, OmitKeys>
  : A extends Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array
  ? Array<number>
  : A extends object
  ? ObjectToJSON<A, OmitKeys>
  : UnknownType;

type ValueToJSON<A, OmitKeys extends keyof any> = A extends JSONTypes
  ? A
  : undefined extends A
  ? ArrayOrObjectToJSON<Exclude<A, undefined>, OmitKeys> | undefined
  : ArrayOrObjectToJSON<A, OmitKeys>;

export type JSONValue<A, OmitKeys extends keyof any = never> = A extends Option<infer T>
  ? ValueToJSON<T, OmitKeys> | undefined
  : ValueToJSON<A, OmitKeys>;
