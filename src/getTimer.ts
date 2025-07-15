/* eslint-disable @typescript-eslint/no-use-before-define */

export interface TimerStartOptions {
  /** Invokes a timer callback immediately and starts the timer. */
  readonly immediately?: boolean | undefined;
  /** Stops after a timer callback is invoked. */
  readonly once?: boolean | undefined;
}

interface TimerStopOptions {
  /** If there is a pending invocation of the callback function, invoke it immediately. */
  readonly flush?: boolean;
}

export interface Timer {
  /** @deprecated Use isActive(). */
  readonly active: boolean;
  readonly isActive: () => boolean;
  readonly start: (options?: TimerStartOptions) => void;
  readonly stop: (options?: TimerStopOptions) => void;
  readonly pause: VoidFunction;
  readonly getState: () => 'active' | 'stopped' | 'paused';
}

interface Options {
  readonly callback: ((timer: Timer) => void) | ((timer: Timer) => Promise<void>);
  /** - function - can be used as a dynamically changing timer interval (evaluated at each timer tick). */
  readonly interval: number | (() => number);
  /** Defaults to `true`. */
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
  let timerId: number | NodeJS.Timeout | undefined;
  let sessionId = 0;
  let timeoutStartedAt = 0;
  let remainingTime = 0;
  let lastInterval = 0;

  const clearTimers = (): void => {
    clearInterval(timerId);
    clearTimeout(timerId);
    timerId = undefined;
  };

  const stop = ({ flush }: TimerStopOptions = Object.create(null)): void => {
    try {
      if (flush && timer.isActive()) {
        void callback(timer);
      }
    } finally {
      sessionId = 0;
      timeoutStartedAt = 0;
      remainingTime = 0;
      lastInterval = 0;
      clearTimers();
      onStop && onStop();
    }
  };

  const pause = (): void => {
    if (timer.isActive()) {
      remainingTime = Math.max(0, lastInterval - (Date.now() - timeoutStartedAt));
    }
    clearTimers();
    onPause && onPause();
  };

  const start = ({ immediately, once }: TimerStartOptions = Object.create(null)): void => {
    if (timer.isActive()) stop();

    if (sessionId >= Number.MAX_SAFE_INTEGER) {
      sessionId = 0;
    }
    sessionId += 1;

    try {
      if (typeof interval === 'function') {
        const timerCallback = (/* init?: boolean */): void => {
          remainingTime = 0;
          let loopInvoked = false;
          try {
            const result = callback(timer);
            if (waitCallback && result instanceof Promise) {
              loopInvoked = true;
              const id = sessionId;
              void result.finally(() => {
                if (id === sessionId && timerId != null) {
                  if (once) stop();
                  else loop();
                }
              });
            }
          } finally {
            if (timerId != null && !loopInvoked) {
              if (once) stop();
              else loop();
            }
          }
        };

        const loop = (): void => {
          const timeout = remainingTime > 0 ? remainingTime : interval();
          timerId = setTimeout(timerCallback, timeout);
          timeoutStartedAt = Date.now();
          lastInterval = timeout;
        };

        if (immediately) {
          timerId = -1;
          timerCallback(/* true */);
        } else {
          loop();
        }
      } else {
        const timerCallback = (): void => {
          try {
            void callback(timer);
          } finally {
            if (once) stop();
            else {
              // For next tick in setInterval.
              timeoutStartedAt = Date.now();
            }
          }
        };

        const startTimer = (): void => {
          timerId = once
            ? setTimeout(timerCallback, interval)
            : setInterval(timerCallback, interval);
          timeoutStartedAt = Date.now();
          lastInterval = interval;
        };

        const init = (): void => {
          if (remainingTime > 0) {
            timerId = setTimeout(() => {
              remainingTime = 0;
              try {
                void callback(timer);
              } finally {
                if (once) stop();
                else startTimer();
              }
            }, remainingTime);
            timeoutStartedAt = Date.now();
            lastInterval = remainingTime;
          } else {
            startTimer();
          }
        };

        try {
          if (immediately) {
            timerId = -1;
            void callback(timer);
          }
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
    isActive: () => timerId != null,
    getState: () => {
      if (timer.isActive()) return 'active';
      if (sessionId > 0) return 'paused';
      return 'stopped';
    },
  };

  if (autostart) timer.start();

  return timer;
}
