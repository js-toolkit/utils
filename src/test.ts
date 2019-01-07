import { Omit, Overwrite, KeysOfType } from './index';

type A = { a: number; c: string }; // $ExpectType "F"
type B = { a?: boolean; b: string };
type D = { d: number; e: string };

interface I extends A {
  i: number;
}

type Omit1 = Omit<B, 'a'>; // OK
type Omit2 = Omit<B, 'a' | 'c'>; // Error: `c` not in `B`
type Omit3 = Omit<B, keyof A>; // Error
type Omit4 = Omit<B, A>; // OK: Exclude all intersections with A
type Omit5 = Omit<B, A & D>; // OK: Exclude all intersections
type Omit6 = Omit<B, D>; // Error: `D` has no any intersections with `B`, so `Omit` is unnecessary.
type Omit7<I extends object, P extends I> = Omit<P, keyof I>; // OK
type Omit8<I extends object, P extends I> = Omit<P, I>; // Error
type Omit9<I extends object, P extends object> = Omit<P, keyof I>; // Error

type Overwrite1 = Overwrite<A, B>;
type Overwrite2 = Overwrite<A, D>;
type Overwrite3 = Overwrite<A, B & D>;
const c: Overwrite1 = {};

type FilterKeys1 = KeysOfType<A, number>;
const f: FilterKeys1;
