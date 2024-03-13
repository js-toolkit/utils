import type log from './log';

export abstract class Plugin {
  constructor(public readonly name: string) {
    //
  }

  abstract initialize(logger: log.Logger): void;

  abstract factory(
    logger: log.Logger,
    level: log.Level,
    config: AnyObject
  ): log.LoggingMethod | undefined;

  abstract notifyOfChange(logger: log.Logger): void;
}
