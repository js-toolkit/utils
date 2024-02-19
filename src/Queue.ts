import { clear } from './clear';

export class Queue<T> {
  private readonly list;

  constructor(initialValue: readonly T[]) {
    this.list = initialValue.slice();
  }

  add(item: T): void {
    this.list.push(item);
  }

  take(): T | undefined {
    return this.list.shift();
  }

  clear(): void {
    clear(this.list);
  }

  getSize(): number {
    return this.list.length;
  }

  isEmpty(): boolean {
    return this.list.length === 0;
  }

  toArray(): T[] {
    return this.list.slice();
  }
}
