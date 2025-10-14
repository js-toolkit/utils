export function createDisposable(disposeFunc: () => void): Disposable {
  return {
    [Symbol.dispose]: disposeFunc,
  };
}
