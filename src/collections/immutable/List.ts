export interface ListLike<T> extends Iterable<T> {
  readonly head: T;
  readonly tail: ListLike<T>;
  readonly size: number;
  readonly [n: number]: T;
  get(index: number): T;
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

export type Nil = List<any>;

export class List<T> implements ListLike<T> {
  readonly head: T;

  readonly tail: List<T>;

  readonly size: number;

  readonly [n: number]: T;

  protected constructor(head: T, tail: List<T>) {
    this.head = head;
    this.tail = tail;
    this.size = (tail && tail.size + 1) || 0;

    return new Proxy(this, {
      // prop always is string type or symbol, not number
      get(target, prop) {
        if (typeof prop !== 'symbol' && isFinite(+prop)) {
          console.log('***', 'read by index', '***');
          // read by indexes
          return target.get(+prop);
        }
        return target[prop];
      },
      has(target, prop) {
        if (typeof prop !== 'symbol' && isFinite(+prop)) {
          // read by indexes
          return +prop >= 0 && +prop < target.size;
        }
        return prop in target;
      },
      // set(target, prop) {
      //   throw new TypeError(`Cannot write '${prop.toString()}' to immutable list ${target}.`);
      // },
    });
  }

  get(index: number): T {
    if (index < 0 || index >= this.size) {
      throw new TypeError(`Index out of bound: ${index}`);
    }
    if (index === 0) return this.head;

    // better performance with while instead of recursion call of this.tail.get(index - 1).
    let list: List<T> = this;
    let j = index;
    while (j > 0) {
      j -= 1;
      list = list.tail;
    }

    return list.head;
  }

  [Symbol.iterator](): Iterator<T> {
    let list: List<T> = this;

    return {
      next(value?: any) {
        if (list === Nil) {
          return { done: true, value };
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

      return(value?: any) {
        list = Nil;
        return { done: true, value };
      },

      throw(e?: any) {
        list = Nil;
        if (e) throw e;
        else return { done: true, value: undefined as any };
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

  find(f: (value: T) => boolean): T | undefined {
    return this.iterate(_ => _, f, undefined);
  }

  every(f: (value: T) => boolean): boolean {
    return this.iterate(f, _ => !_, true);
  }

  some(f: (value: T) => boolean): boolean {
    return this.iterate(f, _ => _, false);
  }

  filter(f: (value: T) => boolean): List<T> {
    if (this === Nil) return Nil;

    let h: ListInternal<T> | undefined; // in order to keep head list for return
    let t: ListInternal<T> | undefined = h; // last list
    let list: List<T> = this;

    while (list !== Nil) {
      if (f(list.head)) {
        // if first iteration
        if (t === undefined) {
          h = new ListInternal(list.head, Nil);
          t = h;
        } else {
          const nx = new ListInternal(list.head, Nil);
          t.next = nx;
          t = nx;
        }
      }
      list = list.tail;
    }

    return h || Nil;
  }

  sort(compare?: (a: T, b: T) => number): List<T> {
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
    return this.reduce((t, h) => List.from(h, t), Nil);
  }

  concat(tail: List<T>): List<T> {
    if (tail === Nil) return this;

    const h = new ListInternal(this.head, tail); // to keep head list for return
    let t = h;
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
    const next = items.reduceRight((tail, item) => List.from(item, tail), Nil);
    return this.concat(next);
  }

  prepend(...items: T[]): List<T> {
    if (!items.length) return this;
    return items.reduceRight((tail, item) => List.from(item, tail), this as List<T>);
  }

  join(separator: string = ', '): string {
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
    const ar = new Array(this.size);
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

  static empty: Nil = new class Nil extends List<undefined> {
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
      return Object.freeze(this) as this;
    }
  }();
}

class ListInternal<T> extends List<T> {
  next: List<T>;

  constructor(head: T, next: List<T>) {
    super(head, next);

    this.next = next;

    Object.defineProperty(this, 'tail', {
      get() {
        return this.next;
      },
    });

    return Object.seal(this);
  }
}

export const Nil: Nil = List.empty;
