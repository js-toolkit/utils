/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type log from './log';

interface ChildLogger extends Pick<log.Logger, log.Level> {}

class ChildLogger
  implements
    Pick<
      log.Logger,
      'name' | 'getLevels' | 'getLevel' | 'getLevelNumber' | 'isLevelEnabled' | 'getLogger' | 'log'
    >
{
  constructor(
    public readonly name: string,
    private readonly parent: log.Logger
  ) {}

  getLevels(): log.Levels {
    return this.parent.getLevels();
  }

  getLevel(): log.Level {
    return this.parent.getLevel();
  }

  getLevelNumber(): number {
    return this.parent.getLevelNumber();
  }

  isLevelEnabled(level: log.Level | log.LevelNumber): boolean {
    return this.parent.isLevelEnabled(level);
  }

  log(...message: unknown[]): void {
    if (this.info) this.info(...message);
  }

  getLogger(name: string): log.ReadonlyLogger {
    return this.parent.getLogger(name);
  }
}

export { ChildLogger };
