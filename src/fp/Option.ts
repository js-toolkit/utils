/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-classes-per-file */
import { NoSuchElementError } from '../NoSuchElementError';

export type Some<A> = Option<A>;
export type None = Option<never>;
type Optional<A> = A | null | undefined;

export abstract class Option<A> {
  static of<T>(value: Optional<T>): Option<T> {
    return option(value);
  }

  private readonly value: NonNullable<A>;

  protected constructor(ref: NonNullable<A>) {
    this.value = ref;
  }

  /**
   * Returns `true` if the option is empty, `false` otherwise.
   */
  isEmpty(): this is None {
    return this.value == null;
  }

  /**
   * Returns `true` if the option is not empty, `false` otherwise.
   */
  nonEmpty(): this is Some<A> {
    return !this.isEmpty();
  }

  get(): NonNullable<A> {
    if (this.isEmpty()) throw new NoSuchElementError('Option.get');
    return this.value;
  }

  /**
   * Returns the option's value if the option is nonempty, otherwise
   * return the given `fallback`.
   *
   * See [[Option.getOrElseL]] for a lazy alternative.
   */
  getOrElse<AA>(fallback: AA): NonNullable<A> | AA {
    if (this.nonEmpty()) return this.value;
    return fallback;
  }

  /**
   * Returns the option's value if the option is nonempty, otherwise
   * return the result of evaluating `thunk`.
   *
   * See [[Option.getOrElse]] for a strict alternative.
   */
  getOrElseL<AA>(thunk: () => AA): NonNullable<A> | AA {
    if (this.nonEmpty()) return this.value;
    return thunk();
  }

  /**
   * Returns this option if it is nonempty, otherwise returns the
   * given `fallback`.
   */
  orElse<AA>(fallback: Option<AA>): Option<A | AA> {
    if (this.nonEmpty()) return this;
    return fallback;
  }

  /**
   * Returns this option if it is nonempty, otherwise returns the
   * given result of evaluating the given `thunk`.
   *
   * @param thunk a no-params function that gets evaluated and
   *        whose result is returned in case this option is empty
   */
  orElseL<AA>(thunk: () => Option<AA>): Option<A | AA> {
    if (this.nonEmpty()) return this;
    return thunk();
  }

  /**
   * Returns the option's value if the option is nonempty, otherwise
   * return `null`.
   * ```
   */
  orNull(): NonNullable<A> | null {
    return this.nonEmpty() ? this.value : null;
  }

  /**
   * Returns the option's value if the option is nonempty, otherwise
   * return `undefined`.
   */
  orUndefined(): NonNullable<A> | undefined {
    return this.nonEmpty() ? this.value : undefined;
  }

  /**
   * Returns an option containing the result of applying `f` to
   * this option's value, or an empty option if the source is empty.
   *
   * NOTE: this is similar with `flatMap`, except with `map` the
   * result of `f` doesn't need to be wrapped in an `Option`.
   *
   * @param f the mapping function that will transform the value
   *          of this option if nonempty.
   *
   * @return a new option instance containing the value of the
   *         source mapped by the given function
   */
  map<B>(f: (a: NonNullable<A>) => B): Option<B> {
    return this.isEmpty() ? None : option(f(this.value));
  }

  /**
   * Returns the result of applying `f` to this option's value if
   * the option is nonempty, otherwise returns an empty option.
   *
   * NOTE: this is similar with `map`, except that `flatMap` the
   * result returned by `f` is expected to be boxed in an `Option`
   * already.
   *
   * Example:
   *
   * ```typescript
   * const opt = Option.of(10)
   *
   * opt.flatMap(num => {
   *   if (num % 2 == 0)
   *     Some(num + 1)
   *   else
   *     None
   * })
   * ```
   *
   * @param f the mapping function that will transform the value
   *          of this option if nonempty.
   *
   * @return a new option instance containing the value of the
   *         source mapped by the given function if the value is
   *         differs from this option value otherwise returns this option
   */
  flatMap<B>(f: (a: NonNullable<A>) => Option<B>): Option<B> {
    if (this.isEmpty()) return None;
    const result = f(this.value);
    const self = this as unknown as Option<B>;
    return result.nonEmpty() && result.value === self.value ? self : result;
  }

  /**
   * Returns this option if it is nonempty AND applying the
   * predicate `p` to the underlying value yields `true`,
   * otherwise return an empty option.
   *
   * @param p is the predicate function that is used to
   *        apply filtering on the option's value
   *
   * @return a new option instance containing the value of the
   *         source filtered with the given predicate
   */
  filter<B extends A>(p: (a: A) => a is B): Option<B>;

  filter(p: (a: NonNullable<A>) => boolean): Option<A>;

  filter(p: (a: NonNullable<A>) => boolean): Option<A> {
    if (this.isEmpty() || !p(this.value)) return None;
    return this;
  }

  /**
   * Returns the result of applying `f` to this option's value,
   * or in case the option is empty, the return the result of
   * evaluating the `fallback` function.
   *
   * This function is equivalent with:
   *
   * ```typescript
   * opt.map(f).getOrElseL(fallback)
   * ```
   *
   * @param fallback is the function to be evaluated in case this
   *        option is empty
   *
   * @param f is the mapping function for transforming this option's
   *        value in case it is nonempty
   */
  fold<B>(fallback: () => B, f: (a: NonNullable<A>) => B): B {
    if (this.isEmpty()) return fallback();
    return f(this.value);
  }

  /**
   * Returns true if this option is nonempty and the value it
   * holds is equal to the given `elem`.
   */
  contains(elem: NonNullable<A>): boolean {
    return this.nonEmpty() && this.value === elem;
  }

  /**
   * Returns `true` if this option is nonempty and the given
   * predicate returns `true` when applied on this option's value.
   *
   * @param p is the predicate function to test
   */
  exists(p: (a: NonNullable<A>) => boolean): boolean {
    return this.filter(p).nonEmpty();
  }

  /**
   * Returns true if this option is empty or the given predicate
   * returns `true` when applied on this option's value.
   *
   * @param p is the predicate function to test
   */
  forAll(p: (a: NonNullable<A>) => boolean): boolean {
    return this.isEmpty() || p(this.value);
  }

  /**
   * Apply the given procedure `cb` to the option's value if
   * this option is nonempty, otherwise do nothing.
   *
   * @param cb the procedure to apply
   */
  forEach(cb: (a: NonNullable<A>) => void): void {
    if (this.nonEmpty()) cb(this.value);
  }

  equals(that: Option<A>): boolean {
    if (that == null) return false;
    if (this.nonEmpty() && that.nonEmpty()) {
      return this.value === that.value;
    }
    return this.isEmpty() && that.isEmpty();
  }
}

/**
 * The `Some<A>` data constructor for [[Option]] represents existing
 * values of type `A`.
 */
export function some<A>(value: NonNullable<A>): Option<A> {
  if (value == null) throw new Error(`Unable to create '${Some.name}' with value ${String(value)}`);
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return new (class Some extends Option<A> {
    constructor() {
      super(value);
    }
  })();
}

/**
 * @alias some
 */
export function Some<A>(value: NonNullable<A>): Option<A> {
  return some(value);
}

// /**
//  * Represents existing values of type `A`.
//  */
// class Some<A> extends Option<A> {
//   constructor(value: NonNullable<A>) {
//     if (value == null)
//       throw new Error(`Unable to create '${Some.name}' with value ${String(value)}`);
//     super(value);
//   }
// }

/**
 * The `None` data constructor for [[Option]] represents non-existing
 * values for any type.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow
export const None: None = new (class None extends Option<never> {
  constructor() {
    super(undefined as never);
  }
})();

/**
 * Builds an [[Option]] reference that contains the given value.
 *
 * If the given value is `null` or `undefined` then the returned
 * option will be empty.
 */
export function option<A>(value: Optional<A>): Option<A> {
  return value != null ? some(value) : None;
}

// type A = { a: number };
// export function f1(a?: A | null | undefined) {
//   const s = Some(a);
//   return s.get().a;
// }

// const o: Option<number> = Some(0);
// console.log(o instanceof Option);
// console.log(o instanceof Some);
// console.log(o instanceof None);
