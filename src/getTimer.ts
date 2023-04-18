/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-use-before-define */

export interface TimerStartOptions {
  readonly immediately?: boolean | undefined;
}

export interface Timer {
  readonly active: boolean;
  readonly start: (options?: TimerStartOptions | undefined) => void;
  readonly stop: VoidFunction;
  readonly pause: VoidFunction;
}

// type
interface Options {
  callback: VoidFunction | (() => Promise<void>);
  /** - function - can be used as a dynamically changing timer interval (evaluated at each timer tick) */
  interval: number | (() => number);
  /** Default `true` */
  autostart?: boolean | undefined;
  /** Used only if `interval` is a function and callback returns `Promise`. */
  waitCallback?: boolean | undefined;
  onStart?: VoidFunction | undefined;
  onStop?: VoidFunction | undefined;
  onPause?: VoidFunction | undefined;
}

export function getTimer({
  callback,
  interval,
  onStart,
  onStop,
  onPause,
  autostart = true,
  waitCallback,
}: Options): Timer {
  let timer: any;
  let sessionId = 0;
  let startTime = 0;
  let remainingTime = 0;
  let lastTimeout = 0;

  const clearTimers = (): void => {
    clearInterval(timer);
    clearTimeout(timer);
    timer = undefined;
  };

  const stop = (): void => {
    startTime = 0;
    remainingTime = 0;
    lastTimeout = 0;
    clearTimers();
    onStop && onStop();
  };

  const pause = (): void => {
    if (timer != null) {
      remainingTime = Math.max(0, lastTimeout - (Date.now() - startTime));
    }
    clearTimers();
    onPause && onPause();
  };

  const start = ({ immediately }: TimerStartOptions = {}): void => {
    timer != null && stop();

    if (sessionId >= Number.MAX_SAFE_INTEGER) {
      sessionId = 0;
    }
    sessionId += 1;

    try {
      if (typeof interval === 'function') {
        const timerCallback = (init?: boolean): void => {
          remainingTime = 0;
          let loopInvoked = false;
          try {
            const result = callback();
            if (waitCallback && result instanceof Promise) {
              loopInvoked = true;
              const id = sessionId;
              result.finally(() => (timer != null || init) && id === sessionId && loop());
            }
          } finally {
            (timer != null || init) && !loopInvoked && loop();
          }
        };

        const loop = (): void => {
          const timeout = remainingTime > 0 ? remainingTime : interval();
          timer = setTimeout(timerCallback, timeout);
          startTime = Date.now();
          lastTimeout = timeout;
        };

        if (immediately) timerCallback(true);
        else loop();
      } else {
        const timerCallback = (): void => {
          try {
            void callback();
          } finally {
            startTime = Date.now();
          }
        };

        const startInterval = (): void => {
          timer = setInterval(timerCallback, interval);
          startTime = Date.now();
          lastTimeout = interval;
        };

        const init = (): void => {
          if (remainingTime > 0) {
            timer = setTimeout(() => {
              remainingTime = 0;
              try {
                void callback();
              } finally {
                startInterval();
              }
            }, remainingTime);
            startTime = Date.now();
            lastTimeout = remainingTime;
          } else {
            startInterval();
          }
        };

        try {
          if (immediately) void callback();
        } finally {
          init();
        }
      }
    } finally {
      onStart && onStart();
    }
  };

  if (autostart) start();

  return {
    start,
    stop,
    pause,
    get active() {
      return timer != null;
    },
  };
}

export default getTimer;
