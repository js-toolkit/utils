export type GetKeysOptions<A extends AnyObject> = { omit: keyof A } | { pick: keyof A };

export type GetKeys<A extends AnyObject, K extends GetKeysOptions<A>> = 'omit' extends keyof K
  ? Exclude<keyof A, K['omit']>
  : 'pick' extends keyof K
    ? Extract<keyof A, K['pick']>
    : never;

export type ExcludeTypesOptions<A extends AnyObject> = { baseTypes?: boolean } & GetKeysOptions<A>;

export type UndefinedToNever<T> = T extends undefined ? never : T;

/** Used in `LiftInvalid`. */
export type Invalid<T> = Error & { __errorMessage: T };

/** Used in `AsUniqueArray`. */
export type LiftInvalid<A extends ReadonlyArray<any>> = IfExtends<
  A[number],
  Invalid<any>,
  Extract<A[number], Invalid<any>>,
  A
>;

/** Used in `NonUnion`. */
export type UnionToIntersection<U> = (U extends U ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/** Used in `UnionToTuple`. */
export type LastOfUnion<T> =
  UnionToIntersection<T extends T ? () => T : never> extends () => infer R ? R : never;
