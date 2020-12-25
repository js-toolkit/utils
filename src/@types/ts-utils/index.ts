/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/ban-types
type AnyObject = object;

type AnyFunction = (...args: any) => any;

type Copy<A extends AnyObject> = { [P in keyof A]: A[P] };

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

type Writeable<A extends AnyObject> = { -readonly [P in keyof A]: A[P] };

type DeepWriteable<A extends AnyObject> = {
  -readonly [P in keyof A]: A[P] extends AnyObject ? DeepWriteable<A[P]> : A[P];
};

type RequiredKeepUndefined<T> = { [K in keyof T]-?: [T[K]] } extends infer U
  ? U extends Record<keyof U, [any]>
    ? { [K in keyof U]: U[K][0] }
    : never
  : never;

type PromiseType<T> = T extends Promise<infer R> ? R : T;

type RequiredSome<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type PartialSome<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

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
