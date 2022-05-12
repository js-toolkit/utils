import clear from './clear';

export interface Queue<T> {
  add: (item: T) => void;
  take: () => T | undefined;
  clear: VoidFunction;
  getSize: () => number;
  isEmpty: () => boolean;
}

export function getQueue<T>(initialValue: readonly T[]): Queue<T> {
  const list = initialValue.slice();

  return {
    add: (item) => {
      list.push(item);
    },

    take: () => {
      return list.shift();
    },

    clear: () => {
      clear(list);
    },

    getSize: () => list.length,

    isEmpty: () => list.length === 0,
  };
}
