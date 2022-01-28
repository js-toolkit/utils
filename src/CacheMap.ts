export default class CacheMap<K, V> extends Map<K, V> {
  async getOrCreate<F extends () => V | Promise<V>>(
    key: K,
    factory: F
  ): Promise<Awaited<ReturnType<F>>> {
    if (!this.has(key) && factory) {
      const val = await factory();
      this.set(key, val);
    }
    return this.get(key) as Awaited<ReturnType<F>>;
  }
}
