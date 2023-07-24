export function promisify<R = void>(fn: () => R): Promise<R> {
  return new Promise((resolve) => {
    resolve(fn());
  });
}
