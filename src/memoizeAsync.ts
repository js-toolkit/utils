type MemoizedAsync<T extends AnyAsyncFunction> = T & {
  readonly promise: ReturnType<T> | undefined;
};

export function memoizeAsync<T extends AnyAsyncFunction>(
  func: T,
  ...rest: Parameters<ReturnType<T>['then']>
): MemoizedAsync<T> {
  let callPromise: Promise<unknown>;

  const memoized = ((...args: unknown[]) => {
    if (callPromise == null) {
      callPromise = func(...args).then(...rest);
    }
    return callPromise;
  }) as MemoizedAsync<T>;

  Object.defineProperty(memoized, 'promise', { get: () => callPromise });

  return memoized;
}
