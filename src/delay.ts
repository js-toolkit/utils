import type delayed from './delayed';

function delay<T extends AnyFunction>(fn: T, wait: number, ...args: Parameters<T>): delay.Delay {
  let timer: any;

  const cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };

  timer = setTimeout(() => {
    timer = undefined;
    fn.call(undefined, ...args);
  }, wait);

  return {
    get isPending() {
      return timer != null;
    },
    cancel,
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace delay {
  export type Delay = Pick<delayed.Func<any>, 'isPending' | 'cancel'>;
}

export default delay;
