/* eslint-disable @typescript-eslint/no-unused-vars */

// type AnyObject<K extends keyof any = string> = Record<K, any>;
type AnyObject = Record<string, any>;

type AnyFunction = (...args: any) => any;

type Copy<A extends AnyObject> = { [P in keyof A]: A[P] };

/** Exclude keys of B from keys of A */
type DiffKeys<A extends AnyObject, B extends AnyObject> = Exclude<keyof A, keyof B>;

type Diff<A extends AnyObject, B extends AnyObject> = Pick<A, DiffKeys<A, B>>;

type IntersectionKeys<A extends AnyObject, B extends AnyObject> = Extract<keyof A, keyof B>;

type Intersection<A extends AnyObject, B extends AnyObject> = Pick<A, IntersectionKeys<A, B>>;

type Merge<A extends AnyObject, B extends AnyObject> = Diff<A, B> & B;

type OmitStrict<
  A extends AnyObject,
  K extends
    | keyof A
    | (Extract<keyof A, keyof K> extends never ? never : Pick<K, Extract<keyof A, keyof K>>)
> = Pick<A, Exclude<keyof A, K extends keyof A ? K : keyof K>>;

type ExcludeStrict<T, U extends T> = T extends U ? never : T;

type ExtractStrict<T, U extends T> = T extends U ? T : never;

type Overwrite<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never
> = { [P in keyof Merge<A, B>]: Merge<A, B>[P] };

/** Return keys of type `T` */
type KeysOfType<A extends AnyObject, B> = NonNullable<
  { [P in keyof A]: A[P] extends B ? P : never }[keyof A]
>;

type ExcludeKeysOfType<A extends AnyObject, B> = Pick<A, Exclude<keyof A, KeysOfType<A, B>>>;

type ExtractKeysOfType<A extends AnyObject, B> = Pick<A, KeysOfType<A, B>>;

type BaseTypeOf<T> = T extends string
  ? string | T
  : T extends number
  ? number | T
  : T extends boolean
  ? boolean | T
  : T;

/** Useful for union types because `keyof <union type>` is `never` */
type Keys<T> = T extends T ? keyof T : never;

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
  never | undefined
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
  never | undefined
>;

type Writeable<A extends AnyObject> = { -readonly [P in keyof A]: A[P] };

type DeepWriteable<A extends AnyObject> = {
  -readonly [P in keyof A]: A[P] extends AnyObject ? DeepWriteable<A[P]> : A[P];
};

type DeepPartial<A extends AnyObject> = {
  [P in keyof A]?: A[P] extends AnyObject ? DeepPartial<A[P]> : A[P];
};

type RequiredKeepUndefined<T> = { [K in keyof T]-?: [T[K]] } extends infer U
  ? U extends Record<keyof U, [any]>
    ? { [K in keyof U]: U[K][0] }
    : never
  : never;

type PromiseType<T> = T extends Promise<infer R> ? R : T;

type RequiredSome<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type PartialSome<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

type ReverseObject<T extends Record<keyof T, string | number>> = {
  [P in keyof T as T[P]]: P;
  // [P in T[keyof T]]: {
  //   [K in keyof T]: T[K] extends P ? K : never;
  // }[keyof T];
};

type LowercaseKeys<T extends AnyObject> = {
  [P in keyof T as P extends number ? P : Lowercase<Extract<P, string>>]: T[P];
};

// https://stackoverflow.com/questions/57016728/is-there-a-way-to-define-type-for-array-with-unique-items-in-typescript

type Invalid<T> = Error & { __errorMessage: T };

type InArray<T, Item> = T extends readonly [Item, ...infer _]
  ? true
  : T extends readonly [Item]
  ? true
  : T extends readonly [infer _, ...infer Rest]
  ? InArray<Rest, Item>
  : false;

type UniqueArray<T> = T extends readonly [infer X, ...infer Rest]
  ? InArray<Rest, X> extends true
    ? Invalid<['Encountered value with duplicates:', X]>
    : readonly [X, ...UniqueArray<Rest>]
  : T;

type AsUniqueArray<A extends ReadonlyArray<any>> = {
  [I in keyof A]: unknown extends {
    [J in keyof A]: J extends I ? never : A[J] extends A[I] ? unknown : never;
  }[number]
    ? Invalid<['Encountered value with duplicates:', A[I]]>
    : A[I];
};
