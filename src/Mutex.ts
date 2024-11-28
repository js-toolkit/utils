import log from './log';

export class Mutex implements Disposable {
  private readonly logger: log.Logger;
  private readonly unlockQueue: VoidFunction[] = [];
  private acquiredIdentifier: string | undefined;

  constructor(logger?: log.Logger) {
    this.logger = logger ?? log.getLogger('mutex');
  }

  /** Acquires the mutex, as soon as possible. */
  async acquire(identifier: string): Promise<void> {
    this.logger.debug(`${identifier} has requested mutex.`);
    if (this.acquiredIdentifier) {
      await new Promise<void>((resolve) => {
        this.unlockQueue.push(resolve);
      });
    }
    this.acquiredIdentifier = identifier;
    this.logger.debug(`${identifier} has acquired mutex.`);
  }

  /** Releases your hold on the mutex. */
  release(): void {
    this.logger.debug(`${this.acquiredIdentifier} has released mutex.`);
    const resolve = this.unlockQueue.shift();
    if (resolve) {
      resolve();
    } else {
      this.acquiredIdentifier = undefined;
    }
  }

  [Symbol.dispose](): void {
    this.release();
  }
}

// const mutex = new Mutex();
// const p1 = mutex.acquire('1');
// const p2 = mutex.acquire('2');
// const p3 = mutex.acquire('3');
// setTimeout(() => {
//   mutex.release();
// }, 1000);
// setTimeout(() => {
//   mutex.release();
// }, 2000);
// setTimeout(() => {
//   mutex.release();
//   mutex.acquire('4');
// }, 3000);
