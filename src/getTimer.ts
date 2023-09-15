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
  readonly callback: ((timer: Timer) => void) | ((timer: Timer) => Promise<void>);
  /** - function - can be used as a dynamically changing timer interval (evaluated at each timer tick) */
  readonly interval: number | (() => number);
  /** Default `true` */
  readonly autostart?: boolean | undefined;
  /** Used only if `interval` is a function and callback returns `Promise`. */
  readonly waitCallback?: boolean | undefined;
  readonly onStart?: VoidFunction | undefined;
  readonly onStop?: VoidFunction | undefined;
  readonly onPause?: VoidFunction | undefined;
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
  let timerId: any;
  let sessionId = 0;
  let startTime = 0;
  let remainingTime = 0;
  let lastTimeout = 0;

  const clearTimers = (): void => {
    clearInterval(timerId);
    clearTimeout(timerId);
    timerId = undefined;
  };

  const stop = (): void => {
    startTime = 0;
    remainingTime = 0;
    lastTimeout = 0;
    clearTimers();
    onStop && onStop();
  };

  const pause = (): void => {
    if (timerId != null) {
      remainingTime = Math.max(0, lastTimeout - (Date.now() - startTime));
    }
    clearTimers();
    onPause && onPause();
  };

  const start = ({ immediately }: TimerStartOptions = {}): void => {
    timerId != null && stop();

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
            const result = callback(timer);
            if (waitCallback && result instanceof Promise) {
              loopInvoked = true;
              const id = sessionId;
              void result.finally(() => (timerId != null || init) && id === sessionId && loop());
            }
          } finally {
            (timerId != null || init) && !loopInvoked && loop();
          }
        };

        const loop = (): void => {
          const timeout = remainingTime > 0 ? remainingTime : interval();
          timerId = setTimeout(timerCallback, timeout);
          startTime = Date.now();
          lastTimeout = timeout;
        };

        if (immediately) timerCallback(true);
        else loop();
      } else {
        const timerCallback = (): void => {
          try {
            void callback(timer);
          } finally {
            startTime = Date.now();
          }
        };

        const startInterval = (): void => {
          timerId = setInterval(timerCallback, interval);
          startTime = Date.now();
          lastTimeout = interval;
        };

        const init = (): void => {
          if (remainingTime > 0) {
            timerId = setTimeout(() => {
              remainingTime = 0;
              try {
                void callback(timer);
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
          if (immediately) void callback(timer);
        } finally {
          init();
        }
      }
    } finally {
      onStart && onStart();
    }
  };

  const timer: Timer = {
    start,
    stop,
    pause,
    get active() {
      return timerId != null;
    },
  };

  if (autostart) timer.start();

  return timer;
}

export default getTimer;
