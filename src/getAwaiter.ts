import { TimeoutError } from './TimeoutError';

export interface Awaiter<T> {
  readonly pending: boolean;
  readonly settled: boolean;
  wait: (timeout?: number) => Promise<T>;
  resolve: IsAny<T> extends true
    ? (value?: T | PromiseLike<T>, force?: boolean) => void
    : (value: T | PromiseLike<T>, force?: boolean) => void;
  reject: (reason?: any, force?: boolean) => void;
}

export interface AwaiterOptions {
  readonly lazy?: boolean | undefined;
}

export function getAwaiter<T = void>({ lazy }: AwaiterOptions = Object.create(null)): Awaiter<T> {
  // https://stackoverflow.com/a/42118995

  let pending = false;
  let settled = false;
  let resolveRef: PromiseWithResolvers<T>['resolve'] | undefined;
  let rejectRef: PromiseWithResolvers<T>['reject'] | undefined;

  let resolved: boolean;
  let resolveValue: T | PromiseLike<T>;
  let rejected: boolean;
  let rejectValue: unknown;

  let promise: Promise<T>;

  let waitTimeoutHandler: any;

  const rejectHandler = (error: unknown, force?: boolean): void => {
    // Resolve before wait called.
    if (!settled && (!pending || force)) {
      rejected = true;
      rejectValue = error;
      resolved = false;
      settled = true;
    }
    rejectRef?.(error);
  };

  const complete = (): void => {
    // Changed only after all chain will resolved.
    pending = false;
    settled = true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    clearTimeout(waitTimeoutHandler);
  };

  const wait = (timeout?: number): Promise<T> => {
    if (promise == null) {
      // Do not use race in order to able to renew wait timeout.
      ({ promise, resolve: resolveRef, reject: rejectRef } = Promise.withResolvers<T>());
      pending = true;
      void promise.finally(complete);
      if (resolved) resolveRef(resolveValue);
      if (rejected) rejectRef(rejectValue);
    }
    if (timeout && timeout > 0 && !settled) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      clearTimeout(waitTimeoutHandler);
      waitTimeoutHandler = setTimeout(
        () => rejectHandler(new TimeoutError(`Timeout of ${timeout}ms exceeded.`)),
        timeout
      );
    }
    return promise;
  };

  if (!lazy) {
    void wait();
  }

  return {
    // promise,
    get pending() {
      return pending;
    },
    get settled() {
      return settled;
    },
    wait,
    resolve: (value?: T | PromiseLike<T>, force?: boolean) => {
      // Resolve before wait called.
      if (!settled && (!pending || force)) {
        resolved = true;
        resolveValue = value as typeof resolveValue;
        rejected = false;
        settled = true;
      }
      resolveRef?.(value as NonNullable<typeof value>);
    },
    reject: rejectHandler,
  };
}

// const w = getAwaiter<number>();

// setTimeout(() => {
//   console.log(w.pending);
//   w.resolve(10);
//   console.log(w.pending);
// }, 2000);

// void (async () => {
//   const result = await w.wait().then(() => new Promise((resolve) => setTimeout(resolve, 1000)));
//   console.log('done', result, w.pending);
// })();
