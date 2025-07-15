import { Plugin } from './Plugin';
import type log from './log';

export class LocalStoragePlugin extends Plugin {
  private readonly levelMap: Record<string, log.Level> = Object.create(null);

  constructor(
    name: string,
    private readonly storageKey: string
  ) {
    super(name);
  }

  override initialize(logger: log.Logger): void {
    try {
      const key = logger.name ? `${this.storageKey}:${logger.name}` : this.storageKey;
      const nextLevel = window.localStorage.getItem(key);
      nextLevel != null && logger.setLevel(nextLevel as log.Level);
    } catch {
      //
    }
    this.levelMap[logger.name] = logger.getLevel();
  }

  override notifyOfChange(logger: log.Logger): void {
    const prevLevel = this.levelMap[logger.name];
    const nextLevel = logger.getLevel();
    if (prevLevel !== nextLevel) {
      this.levelMap[logger.name] = nextLevel;
      try {
        const key = logger.name ? `${this.storageKey}:${logger.name}` : this.storageKey;
        window.localStorage.setItem(key, nextLevel);
      } catch {
        //
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  override factory(): undefined {
    return undefined;
  }
}
