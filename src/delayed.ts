import copyFnProps from './copyFnProps';

export interface Delay {
  isPending: boolean;
  cancel: VoidFunction;
}

export type DelayedFunc<T extends AnyFunction> = ((...args: Parameters<T>) => void) &
  AsObject<T> &
  Delay;

export default function delayed<T extends AnyFunction>(fn: T, wait: number): DelayedFunc<T> {
  let timer: any;

  const wrapper: DelayedFunc<T> = ((...args) => {
    if (wait > 0) {
      timer = setTimeout(() => {
        timer = undefined;
        fn.call(undefined, ...args);
      }, wait);
    } else {
      fn.call(undefined, ...args);
    }
  }) as DelayedFunc<T>;

  copyFnProps(fn, wrapper);

  wrapper.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  Object.defineProperty(wrapper, 'isPending', {
    get() {
      return timer != null;
    },
  });

  return wrapper;
}
