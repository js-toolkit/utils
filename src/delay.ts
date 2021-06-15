export interface Delay {
  isPending: boolean;
  cancel: VoidFunction;
}

export default function delay<T extends AnyFunction>(
  fn: T,
  wait: number,
  ...args: Parameters<T>
): Delay {
  let timer: any;

  const cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };

  if (wait > 0) {
    timer = setTimeout(() => {
      timer = undefined;
      fn.call(undefined, args);
    }, wait);
  } else {
    fn.call(undefined, args);
  }

  return {
    get isPending() {
      return timer != null;
    },
    cancel,
  };
}
