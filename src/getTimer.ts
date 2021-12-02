export interface Timer {
  stop: VoidFunction;
  start: VoidFunction;
  readonly active: boolean;
}

interface Options {
  callback: VoidFunction;
  interval: number | (() => number);
  /** Default `true` */
  autostart?: boolean;
}

export default function getTimer({ callback, interval, autostart = true }: Options): Timer {
  let timer: any;

  const stop = (): void => {
    clearInterval(timer);
    clearTimeout(timer);
    timer = undefined;
  };

  const start = (): void => {
    stop();
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
      loop();
    } else {
      timer = setInterval(callback, interval);
    }
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
