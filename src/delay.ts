import type { delayed } from './delayed';

export function delay<T extends AnyFunction>(
  fn: T,
  wait: number,
  ...args: Parameters<T>
): delay.Delay {
  let timer: ReturnType<typeof setTimeout> | undefined;

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

export namespace delay {
  export type Delay = Pick<delayed.Func<any>, 'isPending' | 'cancel'>;
}
