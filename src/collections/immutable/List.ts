/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable max-classes-per-file */

export interface ListLike<T> extends Iterable<T> {
  readonly head: T;
  readonly tail: ListLike<T>;
  get(index: number): T;
  size(): number;
  replace(f: (value: T) => boolean, newValue: T): ListLike<T>;
  find(f: (v: T) => boolean): T | undefined;
  every(f: (value: T) => boolean): boolean;
  some(f: (value: T) => boolean): boolean;
  filter(f: (value: T) => boolean): ListLike<T>;
  sort(compareFn?: (a: T, b: T) => number): ListLike<T>;
  forEach(f: (value: T) => any): void;
  map<U>(f: (value: T) => U): ListLike<U>;
  reduce<U>(f: (previousValue: U, currentValue: T) => U, initialValue: U): U;
  reduceRight<U>(f: (previousValue: U, currentValue: T) => U, initialValue: U): U;
  reverse(): ListLike<T>;
  concat(tail: ListLike<T>): ListLike<T>;
  append(...items: T[]): ListLike<T>;
  prepend(...items: T[]): ListLike<T>;
  join(separator?: string): string;
  toArray(): T[];
}

export class List<T> implements ListLike<T> {
  readonly head: T;

  readonly tail: List<T>;

  protected constructor(head: T, tail: List<T>) {
    this.head = head;
    this.tail = tail;
  }

  get(index: number): T {
    if (index === 0) return this.head;

    // better performance with while instead of recursion call of this.tail.get(index - 1).
    let list: List<T> = this;
    let j = index;
    while (j > 0) {
      if (list === Nil) {
        throw new TypeError(`Index out of bounds: ${index}`);
      }
      j -= 1;
      list = list.tail;
    }

    return list.head;
  }

  size(): number {
    if (this === Nil) return 0;
    let list: List<T> = this;
    let count = 0;
    while (list !== Nil) {
      count += 1;
      list = list.tail;
    }
    return count;
  }

  [Symbol.iterator](): Iterator<T, undefined> {
    let list: List<T> = this;

    return {
      next() {
        if (list === Nil) {
          return { done: true, value: undefined };
        }

        try {
          return {
            done: false,
            value: list.head,
          };
        } finally {
          list = list.tail;
        }
      },
    };
  }

  private iterate<U, D>(map: (value: T) => U, stop: (v: U) => boolean, defaultValue: D): U | D {
    let list: List<T> = this;
    while (list !== Nil) {
      const v = map(list.head);
      if (stop(v)) return v;
      list = list.tail;
    }
    return defaultValue;
  }

  /** Returns head list, last list and current iteration list */
  private copy(
    predicate: (value: T) => boolean,
    stop?: (v: T) => boolean
  ): [ListInternal<T> | undefined, ListInternal<T> | undefined, List<T>] {
    let h: ListInternal<T> | undefined; // in order to keep the head list for return
    let t: ListInternal<T> | undefined; // last list
    let list: List<T> = this;

    while (list !== Nil) {
      if (stop && stop(list.head)) return [h, t, list];

      if (predicate(list.head)) {
        const nx = new ListInternal(list.head, Nil);
        // if first element
        if (t === undefined) {
          h = nx;
          t = nx;
        } else {
          t.next = nx;
          t = nx;
        }
      }

      list = list.tail;
    }

    return [h, t, list];
  }

  replace(predicate: (value: T) => boolean, newValue: T): List<T> {
    if (this === Nil) return Nil;
    // find predicate
    const [h, t, last] = this.copy(() => true, predicate);
    // if first iteration
    if (h === undefined) return new List(newValue, this.tail);
    // if not found
    if (last === Nil) return this;
    t!.next = new List(newValue, last.tail);
    return h;
  }

  find(f: (value: T) => boolean): T | undefined {
    return this.iterate((v) => v, f, undefined);
  }

  every(f: (value: T) => boolean): boolean {
    return this.iterate(f, (v) => !v, true);
  }

  some(f: (value: T) => boolean): boolean {
    return this.iterate(f, (v) => v, false);
  }

  filter(predicate: (value: T) => boolean): List<T> {
    if (this === Nil) return Nil;
    const [h] = this.copy(predicate);
    return h || Nil;
  }

  sort(compare?: (a: T, b: T) => number): List<T> {
    if (this === Nil) return Nil;
    // todo: slow
    return List.of(...this.toArray().sort(compare));
  }

  reduce<U>(f: (previousValue: U, currentValue: T) => U, initialValue: U): U {
    let lastValue = initialValue;
    let list: List<T> = this;
    while (list !== Nil) {
      lastValue = f(lastValue, list.head);
      list = list.tail;
    }
    return lastValue;
  }

  reduceRight<U>(f: (previousValue: U, currentValue: T) => U, initialValue: U): U {
    // todo: slow
    return this.reverse().reduce(f, initialValue);
  }

  forEach(f: (value: T) => any): void {
    this.reduce((_, h) => f(h), undefined);
  }

  map<U>(f: (value: T) => U): List<U> {
    if (this === Nil) return Nil;
    const h = new ListInternal(f(this.head), Nil);
    let t = h; // to keep head list for return
    let list = this.tail;
    while (list !== Nil) {
      const nx = new ListInternal(f(list.head), Nil);
      t.next = nx;
      t = nx;
      list = list.tail;
    }
    return h;
  }

  reverse(): List<T> {
    if (this === Nil) return Nil;
    return this.reduce((t, h) => List.from(h, t), Nil);
  }

  concat(tail: List<T>): List<T> {
    if (this === Nil) return tail;
    if (tail === Nil) return this;

    const h = new ListInternal(this.head, tail); // to keep head list for return
    let t = h; // last list
    let list = this.tail;

    while (list !== Nil) {
      const nx = new ListInternal(list.head, tail);
      t.next = nx;
      t = nx;
      list = list.tail;
    }

    return h;
  }

  append(...items: T[]): List<T> {
    if (!items.length) return this;
    const next = items.reduceRight((tail, item) => List.from(item, tail), Nil as List<T>);
    return this.concat(next);
  }

  prepend(...items: T[]): List<T> {
    if (!items.length) return this;
    return items.reduceRight((tail, item) => List.from(item, tail), this as List<T>);
  }

  join(separator = ', '): string {
    let result = '';
    let list: List<T> = this;
    while (list !== Nil) {
      result += list.head;
      if (list.tail !== Nil) result += separator;
      list = list.tail;
    }
    return result;
  }

  toArray(): T[] {
    const ar: T[] = [];
    let list: List<T> = this;
    let i = 0;
    while (list !== Nil) {
      ar[i] = list.head;
      i += 1;
      list = list.tail;
    }
    return ar;
  }

  static from<T>(head: T, tail: List<T>): List<T> {
    return Object.freeze(new List(head, tail)) as List<T>;
  }

  static of<T>(...items: T[]): List<T> {
    if (!items.length) return Nil;
    return items.reduceRight((tail, item) => this.from(item, tail), Nil);
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  static empty: Nil = new (class Nil extends List<undefined> {
    constructor() {
      super(undefined, undefined as never);

      Object.defineProperties(this, {
        head: {
          get() {
            throw new Error('Can not read head of empty list.');
          },
        },
        tail: {
          get() {
            throw new Error('Can not read tail of empty list.');
          },
        },
        size: {
          get() {
            return 0;
          },
        },
      });

      // freeze properties to avoid redefining
      // eslint-disable-next-line no-constructor-return
      return Object.freeze(this) as this;
    }
  })();
}

class ListInternal<T> extends List<T> {
  next: List<T>;

  constructor(head: T, next: List<T>) {
    super(head, next);

    this.next = next;

    const self = this;
    Object.defineProperty(this, 'tail', {
      get() {
        return self.next;
      },
    });

    // eslint-disable-next-line no-constructor-return
    return Object.seal(this);
  }
}

export type Nil = List<any>;

export const Nil: Nil = List.empty;
