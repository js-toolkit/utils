export interface Timer {
  stop: VoidFunction;
  start: VoidFunction;
  readonly active: boolean;
}

interface Options {
  callback: VoidFunction;
  interval: number;
  /** Default `true` */
  autostart?: boolean;
}

export default function getTimer({ callback, interval, autostart = true }: Options): Timer {
  let timer: any;

  const stop = (): void => {
    clearInterval(timer);
    timer = undefined;
  };

  const start = (): void => {
    stop();
    timer = setInterval(callback, interval);
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
