type MemoizedAsync<T extends AnyAsyncFunction> = T & {
  readonly promise: ReturnType<T> | undefined;
};

interface MemoizeAsyncOptions {
  readonly once?: boolean;
}

export function memoizeAsync<T extends AnyAsyncFunction>(
  func: T,
  options?: MemoizeAsyncOptions,
  ...rest: Parameters<ReturnType<T>['then']>
): MemoizedAsync<T> {
  let callPromise: Promise<unknown> | undefined;

  const memoized = ((...args: unknown[]) => {
    if (callPromise == null) {
      callPromise = func(...args).then(...rest);
      if (!options?.once) {
        callPromise.finally(() => {
          callPromise = undefined;
        });
      }
    }
    return callPromise;
  }) as MemoizedAsync<T>;

  Object.defineProperty(memoized, 'promise', { get: () => callPromise });

  return memoized;
}
