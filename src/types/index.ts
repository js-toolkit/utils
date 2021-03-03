/* eslint-disable @typescript-eslint/no-unused-vars */

// type AnyObject<K extends keyof any = string> = Record<K, any>;
export type AnyObject = Record<string, any>;

export type EmptyObject = Record<never, never>;

export type AnyFunction = (...args: any) => any;

export type Copy<A extends AnyObject> = { [P in keyof A]: A[P] };

/** Exclude keys of B from keys of A */
export type DiffKeys<A extends AnyObject, B extends AnyObject> = Exclude<Keys<A>, Keys<B>>;

export type Diff<A extends AnyObject, B extends AnyObject> = Pick<A, DiffKeys<A, B>>;

export type IntersectionKeys<A extends AnyObject, B extends AnyObject> = Extract<Keys<A>, Keys<B>>;

export type Intersection<A extends AnyObject, B extends AnyObject> = Pick<
  A,
  IntersectionKeys<A, B>
>;

export type Merge<A extends AnyObject, B extends AnyObject> = Diff<A, B> & B;

export type OmitStrict<
  A extends AnyObject,
  K extends
    | keyof A
    | (Extract<Keys<A>, Keys<K>> extends never ? never : Pick<K, Extract<Keys<A>, Keys<K>>>)
> = Pick<A, Exclude<Keys<A>, K extends Keys<A> ? K : Keys<K>>>;

export type ExcludeStrict<T, U extends T> = T extends U ? never : T;

export type ExtractStrict<T, U extends T> = T extends U ? T : never;

export type Overwrite<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never
> = { [P in keyof Merge<A, B>]: Merge<A, B>[P] };

export type IfExtends<T, Type, Then = T, Else = never> = Extract<T, Type> extends never
  ? Else
  : Extract<T, Type> extends Type
  ? Then
  : Else;

export type KeysOfType<A extends AnyObject, B, Strict extends boolean = true> = NonNullable<
  {
    [P in keyof A]: Strict extends true
      ? IfExtends<Extract<A[P], B>, B, P, never>
      : A[P] extends B
      ? P
      : never;
  }[keyof A]
>;

export type ExcludeKeysOfType<A extends AnyObject, B, Strict extends boolean = false> = Pick<
  A,
  Exclude<keyof A, KeysOfType<A, B, Strict>>
>;

export type ExtractKeysOfType<A extends AnyObject, B, Strict extends boolean = false> = Pick<
  A,
  KeysOfType<A, B, Strict>
>;

export type BaseTypeOf<T> = T extends string
  ? string | T
  : T extends number
  ? number | T
  : T extends boolean
  ? boolean | T
  : T;

/** Useful for union types because `keyof <union type>` is `never` */
// export type Keys<T> = T extends T ? keyof T : never;
export type Keys<T, OnlyObject extends boolean = true> = T extends T
  ? IfExtends<OnlyObject, true, IfExtends<T, AnyObject, keyof T, never>, keyof T>
  : never;

export type DeepKeys<T, Prop = never> = IfExtends<
  T,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer ItemType>
    ? DeepKeys<ItemType, Prop>
    : Required<Extract<{ [P in keyof T]: DeepKeys<NonNullable<T>[P], P> }, AnyObject>>[Keys<T>],
  Prop
>;

export type ExcludeTypesOptions<A extends AnyObject> = { omit: keyof A } | { pick: keyof A };

export type ExcludeTypes<
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

// export type KeepTypes<A extends AnyObject, B, K extends keyof A = keyof A> = ExcludeKeysOfType<
// { [P in keyof A]: P extends K ? Extract<A[P], B> : A[P] },
// never | undefined
// >;
export type KeepTypes<
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

export type Writeable<A extends AnyObject> = { -readonly [P in keyof A]: A[P] };

export type DeepWriteable<T extends AnyObject> = IfExtends<
  T,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, T, { -readonly [P in keyof T]: DeepWriteable<T[P]> }>,
  T
>;

// export type DeepPartial<T extends AnyObject> = IfExtends<
//   T,
//   AnyObject,
//   IfExtends<T, ReadonlyArray<any>, T, { [P in keyof T]?: DeepPartial<T[P]> }>,
//   T
// >;
export type DeepPartial<
  T extends AnyObject,
  Depth extends number = never,
  R extends unknown[] = [any]
> = IfExtends<
  T,
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

export type RequiredKeepUndefined<T> = { [K in keyof T]-?: [T[K]] } extends infer U
  ? U extends Record<keyof U, [any]>
    ? { [K in keyof U]: U[K][0] }
    : never
  : never;

export type PromiseType<T> = T extends Promise<infer R> ? R : T;

export type RequiredSome<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type PartialSome<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

export type PartialRecord<K extends keyof any, T> = { [P in K]?: T };

export type RequiredInner<T, K extends keyof T> = {
  [P in keyof T]: P extends K
    ? Extract<T[K], AnyObject> extends AnyObject
      ? Required<T[K]>
      : T[K]
    : T[P];
};

export type PickInner<T, K extends keyof T, IK extends keyof NonNullable<T[K]>> = {
  [P in keyof T]: P extends K
    ? IK extends keyof Extract<T[K], AnyObject>
      ? Pick<NonNullable<T[K]>, IK>
      : T[P]
    : T[P];
};

export type ReverseObject<T extends Record<keyof T, string | number>> = {
  [P in keyof T as T[P]]: P;
  // [P in T[keyof T]]: {
  //   [K in keyof T]: T[K] extends P ? K : never;
  // }[keyof T];
};

export type LowercaseKeys<T extends AnyObject> = {
  [P in keyof T as P extends number ? P : Lowercase<Extract<P, string>>]: T[P];
};

export type DefineAll<Enum extends string, T extends Record<Enum, unknown>> = T;

// https://stackoverflow.com/questions/57016728/is-there-a-way-to-define-type-for-array-with-unique-items-in-typescript

export type Invalid<T> = Error & { __errorMessage: T };

export type LiftInvalid<A extends ReadonlyArray<any>> = IfExtends<
  A[number],
  Invalid<any>,
  Extract<A[number], Invalid<any>>,
  A
>;

export type Last<T extends unknown[]> = T extends [any, ...infer Rest] ? Rest : [];

export type Push<A extends unknown[], T> = [...A, T];

export type InArray<T, Item> = T extends readonly [Item, ...infer _]
  ? true
  : T extends readonly [Item]
  ? true
  : T extends readonly [infer _, ...infer Rest]
  ? InArray<Rest, Item>
  : false;

export type ToUniqueArray<T extends ReadonlyArray<any>> = T extends readonly [
  infer X,
  ...infer Rest
]
  ? InArray<Rest, X> extends true
    ? [Invalid<['Encountered value with duplicates:', X]>]
    : readonly [X, ...ToUniqueArray<Rest>]
  : T;

export type UniqueArray<T extends ReadonlyArray<any>> = LiftInvalid<ToUniqueArray<T>>;

export type AsUniqueArray<A extends ReadonlyArray<any>> = LiftInvalid<
  {
    [I in keyof A]: unknown extends {
      [J in keyof A]: J extends I ? never : A[J] extends A[I] ? unknown : never;
    }[number]
      ? Invalid<['Encountered value with duplicates:', A[I]]>
      : A[I];
  }
>;

export type UnionToIntersection<U> = (U extends U ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type LastOfUnion<T> = UnionToIntersection<
  T extends T ? () => T : never
> extends () => infer R
  ? R
  : never;

export type UnionToTuple<
  T,
  L = LastOfUnion<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : [...UnionToTuple<Exclude<T, L>>, L];
