/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type NonNullValue = {};

type AnyObject = Record<PropertyKey, any>;

type EmptyObject = Record<PropertyKey, never>;

type AnyFunction = (...args: any) => any;

type AnyAsyncFunction = (...args: any) => Promise<any>;

type AnyConstructor = new (...args: any) => any;

type AsObject<A extends AnyObject> = { [P in keyof A]: A[P] };

/** Exclude keys of B from keys of A and returns keys. */
type DiffKeys<A extends AnyObject, B extends AnyObject> = Exclude<Keys<A>, Keys<B>>;

/** Exclude keys of B from keys of A and returns object. */
type Diff<A extends AnyObject, B extends AnyObject> = Pick<A, DiffKeys<A, B>>;

type IntersectionKeys<A extends AnyObject, B extends AnyObject> = Extract<Keys<A>, Keys<B>>;

type Intersection<A extends AnyObject, B extends AnyObject> = Pick<A, IntersectionKeys<A, B>>;

/** Merge objects. */
type Merge<A extends AnyObject, B extends AnyObject> = Diff<A, B> & B;

type OmitStrict<
  A extends AnyObject,
  K extends
    | keyof A
    | (Extract<Keys<A>, Keys<K>> extends never ? never : Pick<K, Extract<Keys<A>, Keys<K>>>),
> = Pick<A, Exclude<Keys<A>, K extends Keys<A> ? K : Keys<K>>>;

type ExcludeStrict<T, U extends T> = T extends U ? never : T;

type ExtractStrict<T, U extends T> = T extends U ? T : never;

type Override<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never,
> = { [P in keyof Merge<A, B>]: Merge<A, B>[P] };

type Overwrite<
  A extends AnyObject,
  B extends DiffKeys<B, A> extends never ? Intersection<B, A> : never,
> = Override<A, B>;

type IfExtends<T, Type, Then = T, Else = never> = [Type] extends [never]
  ? [T] extends [never]
    ? Then
    : Else
  : Extract<T, Type> extends never
    ? Else
    : Extract<T, Type> extends Type
      ? Then
      : Else;

type KeysOfType<T extends AnyObject, Type, Strict extends boolean = true> = T extends T
  ? {
      [P in keyof T]-?: Strict extends true
        ? IfExtends<T[P], Type, P, never>
        : T[P] extends Type
          ? P
          : never;
    }[keyof T]
  : never;

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

/** Returns keys recursively. */
type DeepKeys<T, FallbackProps = never> = IfExtends<
  T,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer ItemType>
    ? DeepKeys<ItemType, FallbackProps>
    : Required<Extract<{ [P in keyof T]: DeepKeys<NonNullable<T>[P], P> }, AnyObject>>[Keys<T>],
  FallbackProps
>;

type ExcludeTypes<
  A extends AnyObject,
  T extends K['baseTypes'] extends true
    ? Extract<BaseTypeOf<A[import('./internal').GetKeys<A, K>]>, T>
    : Extract<A[import('./internal').GetKeys<A, K>], T>,
  K extends import('./internal').ExcludeTypesOptions<A> = { pick: keyof A },
> = {
  [P in keyof A]: 'omit' extends keyof K
    ? P extends K['omit']
      ? A[P]
      : Exclude<A[P], T>
    : 'pick' extends keyof K
      ? P extends K['pick']
        ? Exclude<A[P], T>
        : A[P]
      : never;
};

type OmitIndex<T extends AnyObject> = T extends T
  ? { [P in keyof T as string extends P ? never : number extends P ? never : P]: T[P] }
  : never;

type WithIndex<T extends AnyObject> = T extends T ? T & Record<string, any> : never;

// type KeepTypes<A extends AnyObject, B, K extends keyof A = keyof A> = ExcludeKeysOfType<
// { [P in keyof A]: P extends K ? Extract<A[P], B> : A[P] },
// never | undefined
// >;
// type Q = 0 extends never ? 1 : 0
type KeepTypes<
  A extends AnyObject,
  T extends Extract<BaseTypeOf<A[keyof A]>, T>,
  K extends Exclude<Keys<import('./internal').GetKeysOptions<A>>, keyof K> extends never
    ? never
    : Exclude<keyof K, Keys<import('./internal').GetKeysOptions<A>>> extends never
      ? import('./internal').GetKeysOptions<A>
      : never = { pick: keyof A },
> = ExcludeTypes<
  {
    [P in keyof A as 'omit' extends keyof K
      ? P extends K['omit']
        ? P
        : Extract<A[P], T> extends never
          ? never
          : P
      : 'pick' extends keyof K
        ? P extends K['pick']
          ? Extract<A[P], T> extends never
            ? never
            : P
          : P
        : Extract<A[P], T> extends never
          ? never
          : P]: 'omit' extends keyof K
      ? P extends K['omit']
        ? A[P]
        : Extract<A[P], T>
      : 'pick' extends keyof K
        ? P extends K['pick']
          ? Extract<A[P], T>
          : A[P]
        : Extract<A[P], T>;
  },
  never
>;

type Writeable<T extends AnyObject> = T extends T ? { -readonly [P in keyof T]: T[P] } : never;

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
type DeepPartial<
  T,
  Depth extends number = never,
  ExactOptional extends boolean = true,
  R extends unknown[] = [any],
> = IfExtends<
  Exclude<T, AnyFunction>,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer RI>
    ? IfExtends<T, Array<any>, NonNullable<T>, unknown> extends Array<infer I>
      ? Array<DeepPartial<I, Depth, ExactOptional, R>>
      : ReadonlyArray<DeepPartial<RI, Depth, ExactOptional, R>>
    : {
        [P in keyof T]?:
          | (R['length'] extends Depth
              ? T[P]
              : DeepPartial<T[P], Depth, ExactOptional, Push<R, any>>)
          | (ExactOptional extends false ? undefined : never);
      },
  T
>;

type DeepRequired<
  T,
  Depth extends number = never,
  ExactOptional extends boolean = true,
  R extends unknown[] = [any],
> = IfExtends<
  Exclude<T, AnyFunction>,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer RI>
    ? IfExtends<T, Array<any>, NonNullable<T>, unknown> extends Array<infer I>
      ? Array<DeepRequired<I, Depth, ExactOptional, R>>
      : ReadonlyArray<DeepRequired<RI, Depth, ExactOptional, R>>
    : {
        [P in keyof T]-?: Exclude<
          R['length'] extends Depth ? T[P] : DeepRequired<T[P], Depth, ExactOptional, Push<R, any>>,
          ExactOptional extends false ? undefined : never
        >;
      },
  T
>;

type DeepReadonly<T, Depth extends number = never, R extends unknown[] = [any]> = IfExtends<
  Exclude<T, AnyFunction>,
  AnyObject,
  IfExtends<T, ReadonlyArray<any>, NonNullable<T>, unknown> extends ReadonlyArray<infer RI>
    ? ReadonlyArray<DeepReadonly<RI, Depth, R>>
    : {
        readonly [P in keyof T]: R['length'] extends Depth
          ? T[P]
          : DeepReadonly<T[P], Depth, Push<R, any>>;
      },
  T
>;

type RequiredKeepUndefined<T> = T extends T
  ? { [K in keyof T]-?: [T[K]] } extends infer U
    ? U extends Record<keyof U, [any]>
      ? { [K in keyof U]: U[K][0] }
      : never
    : never
  : never;

type RequiredSome<T, K extends keyof T> = T extends T
  ? Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }
  : never;

type RequiredBut<T, K extends keyof T> = T extends T
  ? Pick<T, K> & { [P in Exclude<keyof T, K>]-?: Exclude<T[P], undefined> }
  : never;

type RequiredStrict<T> = T extends T ? { [P in keyof T]-?: Exclude<T[P], undefined> } : never;

type PartialSome<T, K extends keyof T> = T extends T ? Omit<T, K> & { [P in K]?: T[P] } : never;

type PartialBut<T, K extends keyof T> = T extends T
  ? Pick<T, K> & { [P in Exclude<keyof T, K>]?: T[P] }
  : never;

type PartialRecord<K extends keyof any, T> = { [P in K]?: T };

/** Useful with `exactOptionalPropertyTypes` option. */
type OptionalToUndefined<T> = T extends T
  ? { [K in keyof T]: undefined extends T[K] ? T[K] | undefined : T[K] }
  : never;
// type OptionalToUndefined<T> = { [K in keyof T]: [T[K]] } extends infer U
//   ? U extends PartialRecord<keyof U, [any]>
//     ? {
//         [K in keyof U]: U[K] extends [any]
//           ? U[K][0]
//           : U[K] extends [any] | undefined
//           ? Exclude<U[K], undefined>[0] | undefined
//           : never;
//       }
//     : never
//   : never;

type RequiredInner<T, K extends keyof T> = T extends T
  ? { [P in keyof T]: P extends K ? IfExtends<T[P], AnyObject, Required<T[P]>, T[P]> : T[P] }
  : never;

type RequiredInnerKeepUndefined<T, K extends keyof T> = T extends T
  ? {
      [P in keyof T]: P extends K
        ? IfExtends<T[P], AnyObject, RequiredKeepUndefined<T[P]>, T[P]>
        : T[P];
    }
  : never;

type PickInner<T, K extends keyof T, IK extends keyof NonNullable<T[K]>> = T extends T
  ? {
      [P in keyof T]: P extends K
        ? Pick<NonNullable<T[P]>, IK extends Keys<T[P]> ? IK : never>
        : T[P];
    }
  : never;

type IfEquals<X, Y, A, B> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/** Pick only writeable keys. */
type PickWritable<T> = {
  [P in keyof T as IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>]: T[P];
};

/** Pick only readonly keys. */
type PickReadonly<T> = {
  [P in keyof T as IfEquals<{ [Q in P]: T[P] }, { readonly [Q in P]: T[P] }, P, never>]: T[P];
};

/** Pick only optional keys. */
type PickOptional<T> = {
  [P in keyof T as IfEquals<{ [Q in P]: T[P] }, { [Q in P]?: T[P] }, P, never>]: T[P];
};

/** Pick only required keys. */
type PickRequired<T> = {
  [P in keyof T as IfEquals<{ [Q in P]: T[P] }, { [Q in P]-?: T[P] }, P, never>]: T[P];
};

type OmitInner<T, K extends keyof T, IK extends keyof NonNullable<T[K]>> = T extends T
  ? {
      [P in keyof T]: P extends K
        ? OmitStrict<NonNullable<T[P]>, IK extends Keys<T[P]> ? IK : never>
        : T[P];
    }
  : never;

/** Swap key and value */
type ReverseObject<T extends Record<keyof T, string | number>> = T extends T
  ? {
      [P in keyof T as T[P]]: P;
      // [P in T[keyof T]]: {
      //   [K in keyof T]: T[K] extends P ? K : never;
      // }[keyof T];
    }
  : never;

/** Get values of enum as union. */
type EnumToUnion<T extends Record<keyof T, string | number>> = Keys<{
  [P in keyof T as `${T[P]}`]: P;
}>;

type LowercaseKeys<T extends AnyObject> = T extends T
  ? {
      [P in keyof T as P extends number ? P : Lowercase<Extract<P, string>>]: T[P];
    }
  : never;

/** Requires to define all of the keys. */
type DefineAll<Enum extends string | number | symbol, T extends Record<Enum, unknown>> = T;

/** Exclude the first element. Using with const arrays (tuples). */
type Last<T extends readonly unknown[]> = T extends [any, ...infer Rest] ? Rest : [];

/** Append to the last of const array (tuple). */
type Push<A extends readonly unknown[], T> = [...A, T];

/** Returns the number (Length) of first elements. */
type Head<
  T extends readonly unknown[],
  Length extends number = never,
  R extends readonly unknown[] = [],
> = T['length'] extends 0
  ? R
  : R['length'] extends Length
    ? R
    : T extends readonly [infer I, ...infer Rest]
      ? Head<Rest, Length, [...R, I]>
      : R;

/** Returns the number (Length) of last elements. */
type Tail<
  T extends readonly unknown[],
  Length extends number = never,
  R extends readonly unknown[] = [],
> = T['length'] extends 0
  ? R
  : R['length'] extends Length
    ? R
    : T extends readonly [...infer I, (infer L)?]
      ? Tail<I, Length, [L, ...R]>
      : R;

/** Skip the number (Length) of first elements. */
type Skip<
  T extends readonly unknown[],
  Length extends number = never,
  R extends readonly unknown[] = [],
> = T['length'] extends 0
  ? T
  : R['length'] extends Length
    ? T
    : T extends readonly [unknown?, ...infer Rest]
      ? Skip<Rest, Length, [...R, unknown]>
      : T;

type InArray<T, Item> = T extends readonly [Item, ...infer _]
  ? true
  : T extends readonly [Item]
    ? true
    : T extends readonly [infer _, ...infer Rest]
      ? InArray<Rest, Item>
      : false;

// https://stackoverflow.com/questions/57016728/is-there-a-way-to-define-type-for-array-with-unique-items-in-typescript
/** Useful with type checking utility like `asUniqueArray`. */
type ToUniqueArray<T extends ReadonlyArray<any>> = T extends readonly [infer X, ...infer Rest]
  ? InArray<Rest, X> extends true
    ? [import('./internal').Invalid<['Encountered value with duplicates:', X]>]
    : readonly [X, ...ToUniqueArray<Rest>]
  : T;

/** Useful with type checking utility like `asUniqueArray`. */
type UniqueArray<T extends ReadonlyArray<any>> = import('./internal').LiftInvalid<ToUniqueArray<T>>;

/** Used with type checking utility `asUniqueArray`. */
type AsUniqueArray<A extends ReadonlyArray<any>> = import('./internal').LiftInvalid<{
  [I in keyof A]: unknown extends {
    [J in keyof A]: J extends I ? never : A[J] extends A[I] ? unknown : never;
  }[number]
    ? import('./internal').Invalid<['Encountered value with duplicates:', A[I]]>
    : A[I];
}>;

/** */
type UnionToTuple<
  T,
  L = import('./internal').LastOfUnion<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : [...UnionToTuple<Exclude<T, L>>, L];

/** `RequiredUnionToTuple<'1' | '2' | '3', ['1', '3', '2']>` */
type RequiredUnionToTuple<
  U,
  A extends readonly unknown[],
  F = Head<A, 1>,
  UA = F extends readonly any[] ? TupleToUnion<F> : never,
  Nothing = [U] extends [never] ? true : false,
> = number extends A['length']
  ? never
  : true extends Nothing
    ? A['length'] extends 0
      ? []
      : never
    : A['length'] extends 0
      ? true extends Nothing
        ? []
        : never
      : [UA, ...RequiredUnionToTuple<Exclude<U, UA>, Skip<A, 1>>];

/** Returns `never` if T is union type. */
type NonUnion<T> = [T] extends [import('./internal').UnionToIntersection<T>] ? T : never;

type IfTuple<T, Then = T, Else = never> =
  T extends ArrayLike<any> ? (number extends T['length'] ? Then : Else) : Else;

/** Returns union of tuple indices. */
type TupleIndices<T extends readonly any[]> = T extends T
  ? Extract<keyof T, `${number}`> extends `${infer N extends number}`
    ? N
    : never
  : never;

/** Returns union of tuple values. */
type TupleToUnion<T extends readonly any[]> = T extends T
  ? Extract<keyof T, `${number}`> extends `${infer N extends number}`
    ? T[N]
    : never
  : never;

/**
 * Converts `interface Methods {
     method(arg: 'type_1'): void;
     method(arg: 'type_2'): void;
     method(arg: 'type_3'): void;
   }` to `(arg: 'type_1') => void | (arg: 'type_2') => void | (arg: 'type_3') => void`
 * https://github.com/microsoft/TypeScript/issues/32164
 */
type OverloadToUnion<
  TOverload extends (...args: any[]) => any,
  TPartialOverload = unknown,
> = TOverload extends (...args: infer TArgs) => infer TReturn
  ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures.
    TPartialOverload extends TOverload
    ? never
    :
        | OverloadToUnion<
            TPartialOverload & TOverload,
            TPartialOverload & ((...args: TArgs) => TReturn) & AsObject<TOverload>
          >
        | ((...args: TArgs) => TReturn)
  : never;

// type OverloadToUnion<TOverload extends (...args: any[]) => any> = Exclude<
//   _OverloadToUnionRecursive<
//     // The "() => never" signature must be hoisted to the "front" of the
//     // intersection, for two reasons: a) because recursion stops when it is
//     // encountered, and b) it seems to prevent the collapse of subsequent
//     // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
//     // which gives a direct conversion to a union.
//     (() => never) & TOverload
//   >,
//   TOverload extends () => never ? never : () => never
// >;

// Inferring a union of parameter tuples or return types is now possible.
// type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnion<T>>;
// type OverloadReturnType<T extends (...args: any[]) => any> = ReturnType<OverloadUnion<T>>;

/**
 * Used with discriminants.
 * @example
 * type U = { type: 'type1'; a: number } | { type: 'type2'; b: number };
 * type Mapped = MapToKey<U, 'type'>; // => { type1: { type: 'type1'; a: number } } | { type2: { type: 'type2', b: number } }
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
type MapKeyAsArray<T extends AnyObject, K extends keyof T> = T extends T
  ? { [P in keyof T]: P extends K ? readonly T[P][] : T[P] }
  : never;

/**
 * Replace getters functions by the same props.
 */
type GettersToProps<T extends AnyObject> = T extends T
  ? {
      [P in keyof T as P extends `get${infer S}` ? Uncapitalize<S> : P]: P extends `get${string}`
        ? T[P] extends AnyFunction
          ? ReturnType<T[P]>
          : T[P]
        : T[P];
    }
  : never;

/**
 * Replace setters functions by the same props.
 */
type SettersToProps<T extends AnyObject> = T extends T
  ? {
      [P in keyof T as P extends `set${infer S}` ? Uncapitalize<S> : P]: P extends `set${string}`
        ? T[P] extends (value: infer V) => any
          ? V
          : T[P]
        : T[P];
    }
  : never;

/**
 * Remove part from the string.
 */
type RemovePart<T extends string, Part extends string> = T extends `${infer S1}${Part}${infer S2}`
  ? `${S1}${S2}`
  : T;

/**
 * Returns type of array item.
 */
type ArrayItem<T extends ArrayLike<any>> = T extends ArrayLike<infer U> ? U : never;

/**
 * Returns `true` if type is any, or `false` for any other type.
 */
type IsAny<T> = 0 extends 1 & T ? true : false;
// type IsAny<T> = import('./internal').UnionToIntersection<
//   import('./internal').UnionForAny<T>
// > extends never
//   ? true
//   : false;
