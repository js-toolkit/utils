// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyObject = object;

export type Copy<A extends AnyObject> = { [P in keyof A]: A[P] };

export type DiffKeys<A extends AnyObject, B extends AnyObject> = Exclude<keyof A, keyof B>;

export type Diff<A extends AnyObject, B extends AnyObject> = Pick<A, DiffKeys<A, B>>;

export type IntersectionKeys<A extends AnyObject, B extends AnyObject> = Extract<keyof A, keyof B>;

export type Intersection<A extends AnyObject, B extends AnyObject> = Pick<
  A,
  IntersectionKeys<A, B>
>;

export type Merge<A extends AnyObject, B extends AnyObject> = Diff<A, B> & B;

export type Omit<
  A extends AnyObject,
  K extends
    | keyof A
    | (Extract<keyof A, keyof K> extends never ? never : Pick<K, Extract<keyof A, keyof K>>)
> = Pick<A, Exclude<keyof A, K extends keyof A ? K : keyof K>>;

export type Overwrite<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never
> = { [P in keyof Merge<A, B>]: Merge<A, B>[P] };

/** Return keys of export type `T` */
export type KeysOfType<A extends AnyObject, B> = NonNullable<
  { [P in keyof A]: A[P] extends B ? P : never }[keyof A]
>;

export type ExcludeKeysOfType<A extends AnyObject, B> = Pick<A, Exclude<keyof A, KeysOfType<A, B>>>;

export type ExtractKeysOfType<A extends AnyObject, B> = Pick<A, KeysOfType<A, B>>;

export type Writeable<A extends AnyObject> = { -readonly [P in keyof A]: A[P] };

export type DeepWriteable<A extends AnyObject> = {
  -readonly [P in keyof A]: A[P] extends AnyObject ? DeepWriteable<A[P]> : A[P];
};
