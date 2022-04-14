export interface TimerStartOptions {
  immediately?: boolean;
}

export interface Timer {
  stop: VoidFunction;
  start: (options?: TimerStartOptions) => void;
  readonly active: boolean;
}

interface Options {
  callback: VoidFunction;
  /** - function - can be used as a dynamically changing timer interval (evaluated at each timer tick) */
  interval: number | (() => number);
  /** Default `true` */
  autostart?: boolean;
  onStart?: VoidFunction;
  onStop?: VoidFunction;
}

export default function getTimer({
  callback,
  interval,
  onStart,
  onStop,
  autostart = true,
}: Options): Timer {
  let timer: any;

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
        try {
          callback();
        } finally {
          timer != null && loop();
        }
      };
      const loop = (): void => {
        timer = setTimeout(timerCallback, interval());
      };
      if (immediately) {
        try {
          timerCallback();
        } catch {
          //
        }
      }
      loop();
    } else {
      timer = setInterval(callback, interval);
      if (immediately) {
        try {
          callback();
        } catch {
          //
        }
      }
    }
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
