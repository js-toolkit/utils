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

export default class CancellablePromise<T> extends Promise<T> {
  private canceller?: (reason?: any) => void;

  constructor(
    executorOrPromise:
      | ((
          resolve: (value: T | PromiseLike<T>) => void,
          reject: (reason?: any) => void,
          cancel: () => void
        ) => void)
      | Promise<T>
  ) {
    const ref = {
      val: undefined as AnyFunction | undefined,
      set: () => {
        this.canceller = ref.val;
      },
    };
    super((resolve, reject) => {
      // console.log('* create', executorOrPromise instanceof Promise);
      ref.val = reject;
      if (executorOrPromise instanceof Promise) resolve(executorOrPromise);
      else executorOrPromise(resolve, reject, () => reject(new PromiseCancelledError()));
    });
    ref.set();
  }

  /** Cancel only the current promise, not the prev chain. */
  cancel(): void {
    this.canceller && this.canceller(new PromiseCancelledError());
  }

  cancelled<TResult = never>(
    oncancelled?: (() => TResult | PromiseLike<TResult>) | null
  ): CancellablePromise<T | TResult> {
    return super.then(
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
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): CancellablePromise<TResult1 | TResult2> {
    return super.then(
      (value) => catchCancel(onfulfilled, value),
      (reason) => catchCancel(onrejected, reason)
    ) as CancellablePromise<TResult1 | TResult2>;
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): CancellablePromise<T | TResult> {
    return super.then(undefined, (reason) => catchCancel(onrejected, reason)) as CancellablePromise<
      T | TResult
    >;
  }

  static resolve(): CancellablePromise<void>;
  // eslint-disable-next-line no-shadow
  static resolve<T>(value: T | PromiseLike<T>): CancellablePromise<T>;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static resolve(value?: any): any {
    return super.resolve(value);
  }

  // eslint-disable-next-line no-shadow, @typescript-eslint/explicit-module-boundary-types
  static reject<T = never>(reason?: any): CancellablePromise<T> {
    return super.reject<T>(reason) as CancellablePromise<T>;
  }
}

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

// // console.log(CancellablePromise.reject().cancel);
