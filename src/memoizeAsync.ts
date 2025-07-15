export type MemoizedAsync<T extends AnyAsyncFunction> = T & {
  readonly promise: ReturnType<T> | undefined;
};

export interface MemoizeAsyncOptions {
  /** Allow call once only. Always returns a memoized result. */
  readonly once?: boolean | undefined;
}

export function memoizeAsync<T extends AnyAsyncFunction>(
  func: T,
  options: MemoizeAsyncOptions = Object.create(null),
  ...rest: Parameters<ReturnType<T>['then']>
): MemoizedAsync<T> {
  let callPromise: Promise<unknown> | undefined;

  const memoized = ((...args: unknown[]) => {
    if (callPromise == null) {
      callPromise = func(...args);
      if (rest.length > 0) {
        callPromise = callPromise.then(...rest);
      }
      if (!options.once) {
        callPromise = callPromise.finally(() => {
          callPromise = undefined;
        });
      }
    }
    return callPromise;
  }) as MemoizedAsync<T>;

  Object.defineProperty(memoized, 'promise', { get: () => callPromise });

  return memoized;
}
