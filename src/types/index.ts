/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */

type AnyObject = Record<string, any>;

type EmptyObject = Record<never, never>;

type AnyFunction = (...args: any) => any;

type AnyAsyncFunction = (...args: any) => Promise<any>;

type AnyConstructor = new (...args: any) => any;

type AsObject<A extends AnyObject> = { [P in keyof A]: A[P] };

/** Exclude keys of B from keys of A */
type DiffKeys<A extends AnyObject, B extends AnyObject> = Exclude<Keys<A>, Keys<B>>;

type Diff<A extends AnyObject, B extends AnyObject> = Pick<A, DiffKeys<A, B>>;

type IntersectionKeys<A extends AnyObject, B extends AnyObject> = Extract<Keys<A>, Keys<B>>;

type Intersection<A extends AnyObject, B extends AnyObject> = Pick<A, IntersectionKeys<A, B>>;

type Merge<A extends AnyObject, B extends AnyObject> = Diff<A, B> & B;

type OmitStrict<
  A extends AnyObject,
  K extends
    | keyof A
    | (Extract<Keys<A>, Keys<K>> extends never ? never : Pick<K, Extract<Keys<A>, Keys<K>>>)
> = Pick<A, Exclude<Keys<A>, K extends Keys<A> ? K : Keys<K>>>;

type ExcludeStrict<T, U extends T> = T extends U ? never : T;

type ExtractStrict<T, U extends T> = T extends U ? T : never;

type Override<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never
> = { [P in keyof Merge<A, B>]: Merge<A, B>[P] };

type Overwrite<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never
> = Override<A, B>;

type IfExtends<T, Type, Then = T, Else = never> = Extract<T, Type> extends never
  ? Else
  : Extract<T, Type> extends Type
  ? Then
  : Else;

type KeysOfType<A extends AnyObject, B, Strict extends boolean = true> = NonNullable<
  {
    [P in keyof A]: Strict extends true ? IfExtends<A[P], B, P, never> : A[P] extends B ? P : never;
  }[keyof A]
>;

type ExcludeKeysOfType<A extends AnyObject, B, Strict extends boolean = false> = Pick<
  A,
  Exclude<keyof A, KeysOfType<A, B, Strict>>
>;

type ExtractKeysOfType<A extends AnyObject, B, Strict extends boolean = false> = Pick<
  A,
  KeysOfType<A, B, Strict>
>;

type BaseTypeOf<T> = T extends string
  ? string | T
  : T extends number
  ? number | T
  : T extends boolean
  ? boolean | T
  : T;

/** Useful for union types because `keyof <union type>` is `never` */
// type Keys<T> = T extends T ? keyof T : never;
type Keys<T, OnlyObject extends boolean = true> = T extends T
  ? IfExtends<OnlyObject, true, IfExtends<T, AnyObject, keyof T, never>, keyof T>
  : never;

type DeepKeys<T, Prop = never> = IfExtends<
  T,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer ItemType>
    ? DeepKeys<ItemType, Prop>
    : Required<Extract<{ [P in keyof T]: DeepKeys<NonNullable<T>[P], P> }, AnyObject>>[Keys<T>],
  Prop
>;

type ExcludeTypesOptions<A extends AnyObject> = { omit: keyof A } | { pick: keyof A };

type ExcludeTypes<
  A extends AnyObject,
  T extends Extract<BaseTypeOf<A[keyof A]>, T>,
  K extends Exclude<Keys<ExcludeTypesOptions<A>>, keyof K> extends never
    ? never
    : Exclude<keyof K, Keys<ExcludeTypesOptions<A>>> extends never
    ? ExcludeTypesOptions<A>
    : never = { pick: keyof A }
> = ExcludeKeysOfType<
  {
    [P in keyof A]: 'omit' extends keyof K
      ? P extends K['omit']
        ? A[P]
        : Exclude<A[P], T>
      : 'pick' extends keyof K
      ? P extends K['pick']
        ? Exclude<A[P], T>
        : A[P]
      : Exclude<A[P], T>;
  },
  never | undefined,
  false
>;

// type KeepTypes<A extends AnyObject, B, K extends keyof A = keyof A> = ExcludeKeysOfType<
// { [P in keyof A]: P extends K ? Extract<A[P], B> : A[P] },
// never | undefined
// >;
type KeepTypes<
  A extends AnyObject,
  T extends Extract<BaseTypeOf<A[keyof A]>, T>,
  K extends Exclude<Keys<ExcludeTypesOptions<A>>, keyof K> extends never
    ? never
    : Exclude<keyof K, Keys<ExcludeTypesOptions<A>>> extends never
    ? ExcludeTypesOptions<A>
    : never = { pick: keyof A }
> = ExcludeKeysOfType<
  {
    [P in keyof A]: 'omit' extends keyof K
      ? P extends K['omit']
        ? A[P]
        : Extract<A[P], T>
      : 'pick' extends keyof K
      ? P extends K['pick']
        ? Extract<A[P], T>
        : A[P]
      : Extract<A[P], T>;
  },
  never | undefined,
  false
>;

type Writeable<A extends AnyObject> = { -readonly [P in keyof A]: A[P] };

// type DeepWriteable<T extends AnyObject> = IfExtends<
//   T,
//   AnyObject,
//   IfExtends<T, ReadonlyArray<any>, T, { -readonly [P in keyof T]: DeepWriteable<T[P]> }>,
//   T
// >;
type DeepWriteable<T, Depth extends number = never, R extends unknown[] = [any]> = IfExtends<
  Exclude<T, AnyFunction>,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer I>
    ? Array<DeepWriteable<I, Depth, R>>
    : {
        -readonly [P in keyof T]: R['length'] extends Depth
          ? T[P]
          : DeepWriteable<T[P], Depth, Push<R, any>>;
      },
  T
>;

// type DeepPartial<T extends AnyObject> = IfExtends<
//   T,
//   AnyObject,
//   IfExtends<T, ReadonlyArray<any>, T, { [P in keyof T]?: DeepPartial<T[P]> }>,
//   T
// >;
type DeepPartial<T, Depth extends number = never, R extends unknown[] = [any]> = IfExtends<
  Exclude<T, AnyFunction>,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer RI>
    ? IfExtends<T, Array<any>, NonNullable<T>, unknown> extends Array<infer I>
      ? Array<DeepPartial<I, Depth, R>>
      : ReadonlyArray<DeepPartial<RI, Depth, R>>
    : {
        [P in keyof T]?: R['length'] extends Depth ? T[P] : DeepPartial<T[P], Depth, Push<R, any>>;
      },
  T
>;

type DeepRequired<T, Depth extends number = never, R extends unknown[] = [any]> = IfExtends<
  Exclude<T, AnyFunction>,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer RI>
    ? IfExtends<T, Array<any>, NonNullable<T>, unknown> extends Array<infer I>
      ? Array<DeepRequired<I, Depth, R>>
      : ReadonlyArray<DeepRequired<RI, Depth, R>>
    : {
        [P in keyof T]-?: R['length'] extends Depth
          ? T[P]
          : DeepRequired<T[P], Depth, Push<R, any>>;
      },
  T
>;

type RequiredKeepUndefined<T> = { [K in keyof T]-?: [T[K]] } extends infer U
  ? U extends Record<keyof U, [any]>
    ? { [K in keyof U]: U[K][0] }
    : never
  : never;

type PromiseType<T> = T extends Promise<infer R> ? R : T;

type RequiredSome<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

type RequiredBut<T, K extends keyof T> = Pick<T, K> &
  { [P in Exclude<keyof T, K>]-?: Exclude<T[P], undefined> };

type PartialSome<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

type PartialBut<T, K extends keyof T> = Pick<T, K> & { [P in Exclude<keyof T, K>]?: T[P] };

type PartialRecord<K extends keyof any, T> = { [P in K]?: T };

type RequiredInner<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? IfExtends<T[K], AnyObject, Required<T[K]>, T[K]> : T[P];
};

type RequiredInnerKeepUndefined<T, K extends keyof T> = {
  [P in keyof T]: P extends K
    ? IfExtends<T[P], AnyObject, RequiredKeepUndefined<T[P]>, T[P]>
    : T[P];
};

type PickInner<T, K extends keyof T, IK extends keyof NonNullable<T[K]>> = {
  [P in keyof T]: P extends K
    ? IK extends keyof Extract<T[P], AnyObject>
      ? Pick<NonNullable<T[P]>, IK>
      : T[P]
    : T[P];
};

type OmitInner<T, K extends keyof T, IK extends keyof NonNullable<T[K]>> = {
  [P in keyof T]: P extends K
    ? IK extends keyof Extract<T[K], AnyObject>
      ? OmitStrict<NonNullable<T[K]>, IK>
      : T[P]
    : T[P];
};

/** Swap key and value */
type ReverseObject<T extends Record<keyof T, string | number>> = {
  [P in keyof T as T[P]]: P;
  // [P in T[keyof T]]: {
  //   [K in keyof T]: T[K] extends P ? K : never;
  // }[keyof T];
};

type LowercaseKeys<T extends AnyObject> = {
  [P in keyof T as P extends number ? P : Lowercase<Extract<P, string>>]: T[P];
};

/** Requires to define all of the keys. */
type DefineAll<Enum extends string | symbol, T extends Record<Enum, unknown>> = T;

// https://stackoverflow.com/questions/57016728/is-there-a-way-to-define-type-for-array-with-unique-items-in-typescript

type Invalid<T> = Error & { __errorMessage: T };

type LiftInvalid<A extends ReadonlyArray<any>> = IfExtends<
  A[number],
  Invalid<any>,
  Extract<A[number], Invalid<any>>,
  A
>;

type Last<T extends unknown[]> = T extends [any, ...infer Rest] ? Rest : [];

type Push<A extends unknown[], T> = [...A, T];

type InArray<T, Item> = T extends readonly [Item, ...infer _]
  ? true
  : T extends readonly [Item]
  ? true
  : T extends readonly [infer _, ...infer Rest]
  ? InArray<Rest, Item>
  : false;

type ToUniqueArray<T extends ReadonlyArray<any>> = T extends readonly [infer X, ...infer Rest]
  ? InArray<Rest, X> extends true
    ? [Invalid<['Encountered value with duplicates:', X]>]
    : readonly [X, ...ToUniqueArray<Rest>]
  : T;

type UniqueArray<T extends ReadonlyArray<any>> = LiftInvalid<ToUniqueArray<T>>;

type AsUniqueArray<A extends ReadonlyArray<any>> = LiftInvalid<
  {
    [I in keyof A]: unknown extends {
      [J in keyof A]: J extends I ? never : A[J] extends A[I] ? unknown : never;
    }[number]
      ? Invalid<['Encountered value with duplicates:', A[I]]>
      : A[I];
  }
>;

type UnionToIntersection<U> = (U extends U ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

type LastOfUnion<T> = UnionToIntersection<T extends T ? () => T : never> extends () => infer R
  ? R
  : never;

type UnionToTuple<T, L = LastOfUnion<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L];

/**
 * Used with discriminants.
 * @example
 * type U = { type: 'type1'; a: number } | { type: 'type2'; b: number };
 * type Mapped = MapToKey<A, 'type'>; // { type1: { type: 'type1'; a: number } } | { type2: { type: 'type2', b: number } }
 */
type MapToKey<U extends AnyObject, K extends keyof U> = U extends U
  ? U[K] extends string | number
    ? { [P in U[K]]: U }
    : never
  : never;

/**
 * @example
 * type A = { a: number; b: number }
 * type R = MapKeyAsArray<A, 'a'>; // { { a: number[]; b: number } }
 */
type MapKeyAsArray<T extends AnyObject, K extends keyof T> = {
  [P in keyof T]: P extends K ? readonly T[P][] : T[P];
};
