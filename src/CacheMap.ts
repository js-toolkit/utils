import { promisify } from './promisify';

export class CacheMap<K, V> extends Map<K, V> {
  private readonly queue = new Map<K, Promise<unknown>>();

  getOrQueue<F extends () => V | Promise<V>>(
    key: K,
    factory: F
  ): Awaited<ReturnType<F>> | undefined {
    if (!this.has(key) && !this.queue.has(key)) {
      this.queue.set(
        key,
        promisify(factory)
          .then((val) => this.set(key, val))
          .finally(() => this.queue.delete(key))
      );
    }
    return this.get(key) as Awaited<ReturnType<F>>;
  }

  async getOrCreate<F extends () => V | Promise<V>>(
    key: K,
    factory: F
  ): Promise<Awaited<ReturnType<F>>> {
    await this.queue.get(key);
    if (!this.has(key)) {
      this.set(key, await factory());
    }
    return this.get(key) as Awaited<ReturnType<F>>;
  }
}

export default CacheMap;
