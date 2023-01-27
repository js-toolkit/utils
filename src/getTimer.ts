/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-use-before-define */
export interface TimerStartOptions {
  immediately?: boolean;
}

export interface Timer {
  stop: VoidFunction;
  start: (options?: TimerStartOptions) => void;
  readonly active: boolean;
}

interface Options {
  callback: VoidFunction | (() => Promise<void>);
  /** - function - can be used as a dynamically changing timer interval (evaluated at each timer tick) */
  interval: number | (() => number);
  /** Default `true` */
  autostart?: boolean;
  /** Used only if `interval` is a function and callback returns `Promise`. */
  waitCallback?: boolean;
  onStart?: VoidFunction;
  onStop?: VoidFunction;
}

const ignoreError = (callback: VoidFunction): void => {
  try {
    callback();
  } catch {
    //
  }
};

export function getTimer({
  callback,
  interval,
  onStart,
  onStop,
  autostart = true,
  waitCallback,
}: Options): Timer {
  let timer: any;
  let sessionId = 0;

  const stop = (): void => {
    clearInterval(timer);
    clearTimeout(timer);
    timer = undefined;
    onStop && onStop();
  };

  const start = ({ immediately }: TimerStartOptions = {}): void => {
    timer != null && stop();
    if (typeof interval === 'function') {
      const timerCallback = (): void => {
        let loopInvoked = false;
        try {
          const result = callback();
          if (waitCallback && result instanceof Promise) {
            loopInvoked = true;
            const id = sessionId;
            result.finally(() => timer != null && id === sessionId && loop());
          }
        } finally {
          timer != null && !loopInvoked && loop();
        }
      };
      const loop = (): void => {
        timer = setTimeout(timerCallback, interval());
      };
      immediately && ignoreError(timerCallback);
      loop();
    } else {
      timer = setInterval(callback, interval);
      immediately && ignoreError(callback);
    }
    sessionId += 1;
    onStart && onStart();
  };

  if (autostart) start();

  return {
    start,
    stop,
    get active() {
      return timer != null;
    },
  };
}

export default getTimer;
