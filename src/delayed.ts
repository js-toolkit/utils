import copyFnProps from './copyFnProps';

interface Delay<T extends AnyFunction> {
  isPending: boolean;
  cancel: VoidFunction;
  delay: (wait: number, ...args: Parameters<T>) => void;
}

export type DelayedFunc<T extends AnyFunction> = ((...args: Parameters<T>) => void) &
  AsObject<T> &
  Delay<T>;

function delayed<T extends AnyFunction>(fn: T, wait: number): DelayedFunc<T> {
  let timer: any;

  const wrapper = ((...args) => {
    wrapper.delay(wait, ...args);
  }) as DelayedFunc<T>;

  copyFnProps(fn, wrapper);

  wrapper.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  wrapper.delay = (delay, ...args) => {
    wrapper.cancel();
    timer = setTimeout(() => {
      timer = undefined;
      fn.call(undefined, ...args);
    }, delay);
  };

  Object.defineProperty(wrapper, 'isPending', {
    get() {
      return timer != null;
    },
  });

  return wrapper;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace delayed {
  export type Func<T extends AnyFunction> = DelayedFunc<T>;
}

export default delayed;
