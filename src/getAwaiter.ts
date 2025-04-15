import { TimeoutError } from './TimeoutError';

export interface Awaiter<T> {
  readonly pending: boolean;
  wait: (timeout?: number) => Promise<T>;
  resolve: IsAny<T> extends true
    ? (value?: T | PromiseLike<T>) => void
    : (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export interface AwaiterOptions {
  readonly lazy?: boolean | undefined;
}

// getAwaiter<any>().resolve()

export function getAwaiter<T = void>({ lazy }: AwaiterOptions = {}): Awaiter<T> {
  // https://stackoverflow.com/a/42118995

  let pending = false;
  let settled = false;
  let resolveRef: Awaiter<T>['resolve'] | undefined;
  let rejectRef: Awaiter<T>['reject'] | undefined;

  let resolved: boolean;
  let resolveValue: T | PromiseLike<T>;
  let rejected: boolean;
  let rejectValue: unknown;

  let promise: Promise<T>;

  let waitTimeoutHandler: any;

  const rejectHandler = (error: unknown): void => {
    if (!pending && !settled) {
      rejected = true;
      rejectValue = error;
      resolved = false;
    }
    rejectRef && rejectRef(error);
  };

  const wait = (timeout?: number): Promise<T> => {
    if (promise == null) {
      // Do not use race in order to able to renew wait timeout.
      promise = new Promise<T>((resolve, reject) => {
        pending = true;
        resolveRef = resolve as typeof resolveRef;
        rejectRef = reject;
        if (resolved) resolve(resolveValue);
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        if (rejected) reject(rejectValue);
      }).finally(() => {
        // Changed only after all chain will resolved.
        pending = false;
        settled = true;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        clearTimeout(waitTimeoutHandler);
      });
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
    wait,
    resolve: (value?: T | PromiseLike<T>) => {
      if (!pending && !settled) {
        resolved = true;
        resolveValue = value as typeof resolveValue;
        rejected = false;
      }
      resolveRef && resolveRef(value as NonNullable<typeof value>);
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
