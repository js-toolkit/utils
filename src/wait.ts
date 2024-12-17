export function wait<T>(ms: number, value?: T | PromiseLike<T>): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value as T), ms);
  });
}
