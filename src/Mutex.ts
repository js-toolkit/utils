import log from './log';

export class Mutex<I extends string = string> {
  private readonly logger: log.Logger;
  private readonly unlockQueue: VoidFunction[] = [];
  private acquiredIdentifier: I | undefined;

  constructor(logger?: log.Logger) {
    this.logger = logger ?? log.getLogger('mutex');
  }

  isAcquired(): boolean {
    return this.acquiredIdentifier != null;
  }

  /** Acquires the mutex, as soon as possible. */
  async acquire(identifier: I): Promise<Disposable> {
    this.logger.trace(`${identifier} has requested mutex.`);
    if (this.acquiredIdentifier) {
      await new Promise<void>((resolve) => {
        this.unlockQueue.push(resolve);
      });
    }
    this.acquiredIdentifier = identifier;
    this.logger.trace(`${identifier} has acquired mutex.`);
    const dispose = (): void => this.release();
    return {
      [Symbol.dispose](): void {
        dispose();
      },
    };
  }

  /** Releases your hold on the mutex. */
  release(): void {
    this.logger.trace(`${this.acquiredIdentifier} has released mutex.`);
    const resolve = this.unlockQueue.shift();
    if (resolve) {
      resolve();
    } else {
      this.acquiredIdentifier = undefined;
    }
  }
}

// const mutex = new Mutex<'1' | '2' | '3'>();

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

// async function fn(id: string, timeout: number): Promise<void> {
//   using _ = await mutex.acquire(id);
//   await new Promise((resolve) => setTimeout(resolve, timeout));
//   console.log('end', id);
// }
// Promise.all([fn('1', 1000), fn('2', 2000), fn('3', 3000)]);
