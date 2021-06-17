/* eslint-disable no-use-before-define */
// eslint-disable-next-line max-classes-per-file
import es5ErrorCompat from './es5ErrorCompat';

export class PromiseCancelledError extends Error {
  constructor(message?: string) {
    super(message);
    es5ErrorCompat.call(this, PromiseCancelledError);
  }
}

// eslint-disable-next-line no-shadow
function catchCancel(handler?: ((value: any) => unknown) | null, value?: any): unknown {
  // console.log('catchCancel', value, onrejected);
  if (value instanceof PromiseCancelledError || !handler) {
    throw value;
  }
  return handler(value);
}

class CancellablePromiseClass<T> extends Promise<T> {
  private canceller?: VoidFunction;

  constructor(
    executorOrPromise:
      | ((
          resolve: (value: T | PromiseLike<T>) => void,
          reject: (reason?: any) => void,
          cancel: () => void
        ) => void)
      | Promise<T>
  ) {
    let canceller: VoidFunction | undefined;

    super((resolve, reject) => {
      // console.log('* create', executorOrPromise instanceof Promise);
      const currentCanceller: VoidFunction = () => reject(new PromiseCancelledError());

      canceller =
        (executorOrPromise instanceof CancellablePromise && executorOrPromise.canceller) ||
        currentCanceller;

      if (executorOrPromise instanceof CancellablePromise) {
        executorOrPromise.cancelled(currentCanceller).then(resolve, reject);
      } else if (executorOrPromise instanceof Promise) {
        executorOrPromise.then(resolve, reject);
      } else {
        executorOrPromise(resolve, reject, canceller);
      }
    });

    this.canceller = canceller;
  }

  /**
   * Cancel the whole chain of @type {CancellablePromise}.
   * The regular @type {Promise} will still be executed.
   */
  cancel(): void {
    this.canceller && this.canceller();
  }

  cancelled<TResult = never>(
    oncancelled?: (() => TResult | PromiseLike<TResult>) | null
  ): CancellablePromise<T | TResult> {
    const next = super.then(
      (value) => {
        // console.log('cancelled *', value, oncancelled);
        if (value instanceof PromiseCancelledError) {
          if (oncancelled) return oncancelled();
          throw value;
        }
        return value;
      },
      (reason) => {
        // console.log('cancelled **', reason, oncancelled);
        if (reason instanceof PromiseCancelledError && oncancelled) {
          return oncancelled();
        }
        throw reason;
      }
    ) as CancellablePromise<T | TResult>;
    next.canceller = this.canceller;
    return next;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): CancellablePromise<TResult1 | TResult2> {
    const next = super.then(
      (value) => catchCancel(onfulfilled, value),
      (reason) => catchCancel(onrejected, reason)
    ) as CancellablePromise<TResult1 | TResult2>;
    next.canceller = this.canceller;
    return next;
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): CancellablePromise<T | TResult> {
    const next = super.then(undefined, (reason) =>
      catchCancel(onrejected, reason)
    ) as CancellablePromise<T | TResult>;
    next.canceller = this.canceller;
    return next;
  }

  finally(onfinally?: (() => void) | null): CancellablePromise<T> {
    const next = super.finally(onfinally) as CancellablePromise<T>;
    next.canceller = this.canceller;
    return next;
  }
}

export interface CancellablePromiseConstructor
  extends DefineAll<
    Exclude<keyof typeof Promise, symbol>,
    {
      readonly prototype: CancellablePromise<any>;

      reject<T = never>(reason?: any): CancellablePromise<T>;

      resolve(): CancellablePromise<void>;

      resolve<T>(value: T | PromiseLike<T>): CancellablePromise<T>;

      all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>,
          T5 | PromiseLike<T5>,
          T6 | PromiseLike<T6>,
          T7 | PromiseLike<T7>,
          T8 | PromiseLike<T8>,
          T9 | PromiseLike<T9>,
          T10 | PromiseLike<T10>
        ]
      ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;

      all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>,
          T5 | PromiseLike<T5>,
          T6 | PromiseLike<T6>,
          T7 | PromiseLike<T7>,
          T8 | PromiseLike<T8>,
          T9 | PromiseLike<T9>
        ]
      ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;

      all<T1, T2, T3, T4, T5, T6, T7, T8>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>,
          T5 | PromiseLike<T5>,
          T6 | PromiseLike<T6>,
          T7 | PromiseLike<T7>,
          T8 | PromiseLike<T8>
        ]
      ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;

      all<T1, T2, T3, T4, T5, T6, T7>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>,
          T5 | PromiseLike<T5>,
          T6 | PromiseLike<T6>,
          T7 | PromiseLike<T7>
        ]
      ): CancellablePromise<[T1, T2, T3, T4, T5, T6, T7]>;

      all<T1, T2, T3, T4, T5, T6>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>,
          T5 | PromiseLike<T5>,
          T6 | PromiseLike<T6>
        ]
      ): CancellablePromise<[T1, T2, T3, T4, T5, T6]>;

      all<T1, T2, T3, T4, T5>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>,
          T5 | PromiseLike<T5>
        ]
      ): CancellablePromise<[T1, T2, T3, T4, T5]>;

      all<T1, T2, T3, T4>(
        values: readonly [
          T1 | PromiseLike<T1>,
          T2 | PromiseLike<T2>,
          T3 | PromiseLike<T3>,
          T4 | PromiseLike<T4>
        ]
      ): CancellablePromise<[T1, T2, T3, T4]>;

      all<T1, T2, T3>(
        values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]
      ): CancellablePromise<[T1, T2, T3]>;

      all<T1, T2>(
        values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]
      ): CancellablePromise<[T1, T2]>;

      all<T>(values: readonly (T | PromiseLike<T>)[]): CancellablePromise<T[]>;

      all<T>(values: Iterable<T | PromiseLike<T>>): CancellablePromise<T[]>;

      race<T>(values: Iterable<T>): CancellablePromise<T extends PromiseLike<infer U> ? U : T>;

      race<T>(values: Iterable<T | PromiseLike<T>>): CancellablePromise<T>;

      race<T>(values: readonly T[]): CancellablePromise<T extends PromiseLike<infer U> ? U : T>;

      allSettled<T extends readonly unknown[] | readonly [unknown]>(
        values: T
      ): CancellablePromise<
        {
          -readonly [P in keyof T]: PromiseSettledResult<
            T[P] extends PromiseLike<infer U> ? U : T[P]
          >;
        }
      >;

      allSettled<T>(
        values: Iterable<T>
      ): CancellablePromise<PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[]>;

      any<T>(values: (T | PromiseLike<T>)[] | Iterable<T | PromiseLike<T>>): CancellablePromise<T>;
    }
  > {
  new <T>(...args: ConstructorParameters<typeof CancellablePromiseClass>): CancellablePromise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CancellablePromise<T> extends CancellablePromiseClass<T> {}

const CancellablePromise: CancellablePromiseConstructor =
  CancellablePromiseClass as unknown as CancellablePromiseConstructor;

export default CancellablePromise;

// const p = new CancellablePromise<void>((resolve, reject, cancel) => {
//   // setTimeout(() => cancel(), 200);
//   // setTimeout(() => reject('qqq'), 200);
//   // setTimeout(() => resolve(), 2000);
// });
// void p
//   .then((v) => console.log('Resolved 1', v))
//   .catch()
//   // .catch((ex) => console.log('Error 1', ex))
//   .cancelled()
//   // .cancelled(() => console.log('Cancelled 1'))
//   .then((v) => console.log('Resolved 2', v))
//   .catch(() => {
//     throw 123;
//   })
//   // .catch((ex) => console.log('Error 2', ex))
//   .then((v) => console.log('Resolved 3', v))
//   .catch((ex) => console.log('Error 3', ex))
//   .cancelled(() => console.log('Cancelled 2'));

// setTimeout(() => p.cancel(), 200);

// const p = new CancellablePromise(
//   new CancellablePromise((resolve, reject) => setTimeout(resolve, 1000))
//     .then(() => console.log('resolve 1'))
//     .then(() =>
//       new Promise((resolve) => setTimeout(resolve, 1000)).then(() => console.log('resolve 2'))
//     )
// ); //.then(() => console.log('resolved'));

// p.then(() => console.log('resolved'))
//   .cancelled(() => console.log('cancelled'))
//   .catch((ex) => console.log('error', ex));

// setTimeout(() => console.log('end'), 2500);

// setTimeout(() => p.cancel(), 500);
