export function promisify<R = void>(fn: () => R): Promise<Awaited<R>> {
  return new Promise((resolve) => {
    resolve(fn() as Awaited<R>);
  });
}
