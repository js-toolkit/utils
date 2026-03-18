import { TimeoutError } from '../TimeoutError';

export namespace Sink {
  export type Finalizator = () => void | Promise<void>;

  export interface Options {
    readonly cancelOnPipeError?: boolean | undefined;
  }

  export interface WaitOptions {
    readonly timeout?: number | undefined;
    readonly errorOnTimeout?: boolean | undefined;
  }
}

type Timer = ReturnType<typeof setTimeout>;

function createTimer(callback: VoidFunction, timeout: number): Timer {
  return setTimeout(callback, timeout);
}

function stopTimer(timer: Timer | undefined): void {
  clearTimeout(timer);
}

export class Sink<A> {
  private readonly promise: Promise<void>;
  private readonly cancelOnError: boolean;
  private pending;
  private waitTimeoutHandler: Timer | undefined;
  private cancelling: Promise<void> | undefined;
  private resolve: VoidFunction | undefined;
  private reject: ((reason?: unknown) => void) | undefined;
  private finalizator: Sink.Finalizator | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipeHandler: ((value: A) => Promise<any>) | undefined;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    executor: (pipe: (value: A) => void, cancel: Sink<A>['cancel']) => Sink.Finalizator | void,
    { cancelOnPipeError = true }: Sink.Options = Object.create(null)
  ) {
    this.pending = true;
    this.cancelOnError = cancelOnPipeError;

    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const cancel: this['cancel'] = (...args) => this.cancel(...args);

      const pipe = (value: A): void => {
        if (this.pipeHandler) {
          void this.pipeHandler(value).catch(this.cancelOnError ? cancel : undefined);
        }
      };

      const finalizator = executor(pipe, cancel);
      this.finalizator = typeof finalizator === 'function' ? finalizator : undefined;
    }).finally(() => {
      this.pending = false;
      stopTimer(this.waitTimeoutHandler);
    });
  }

  get isPending(): boolean {
    return this.pending;
  }

  /** Wait until Sink is finished/cancelled. */
  wait({ timeout, errorOnTimeout = true }: Sink.WaitOptions = Object.create(null)): Promise<void> {
    if (this.isPending && timeout != null && timeout > 0) {
      stopTimer(this.waitTimeoutHandler);
      this.waitTimeoutHandler = createTimer(() => {
        this.waitTimeoutHandler = undefined;
        void this.cancel(
          errorOnTimeout ? new TimeoutError(`Timeout of ${timeout}ms exceeded.`) : undefined
        );
      }, timeout);
    }
    return this.promise;
  }

  /** Stop pipes and free resources. */
  cancel(reason?: unknown): Promise<void> {
    if (this.cancelling) return this.cancelling;
    if (!this.isPending) return Promise.resolve();
    // if (this.cancelling) return Promise.reject(new Error('Already in cancelling state.'));

    // finalizator may works long time so cancel timer because already in cancelling state.
    stopTimer(this.waitTimeoutHandler);

    this.cancelling = Promise.resolve()
      .then(this.finalizator)
      .catch((ex: unknown) => {
        if (reason != null) console.error('Cancel error:', ex);
        else throw ex;
      })
      .finally(() => {
        if (reason != null) {
          this.reject?.(reason);
        } else {
          this.resolve?.();
        }
        this.cancelling = undefined;
        this.finalizator = undefined;
        this.reject = undefined;
        this.resolve = undefined;
        this.pipeHandler = undefined;
      });

    return this.cancelling;

    // if (!this.isPending) return;
    // this.finalizator && (await this.finalizator());
    // if (reason) {
    //   this.reject && this.reject(reason);
    // } else {
    //   this.resolve && this.resolve();
    // }
  }

  /** Execute action on every pipe and use prev action result. */
  pipe<B>(action: (value: A) => PromiseLike<B> | B): Sink<B> {
    if (this.isPending) {
      const prevHandler = this.pipeHandler;
      this.pipeHandler = (value) =>
        (prevHandler ? prevHandler(value) : Promise.resolve(value)).then(action);
    }
    return this as unknown as Sink<B>;
  }

  /** Execute action on pipe once and then cancel. */
  once<B>(action: (value: A) => PromiseLike<B> | B): Sink<B> {
    if (this.isPending) {
      const prevHandler = this.pipeHandler;
      this.pipeHandler = (value) =>
        (prevHandler ? prevHandler(value) : Promise.resolve(value))
          .then(action)
          .then(() => this.cancel());
    }
    return this as unknown as Sink<B>;
  }

  catch<B = never>(action: (reason: unknown) => PromiseLike<B> | B): Sink<B> {
    if (this.isPending) {
      const prevHandler = this.pipeHandler;
      this.pipeHandler = (value) =>
        (prevHandler ? prevHandler(value) : Promise.resolve(value)).catch(action);
    }
    return this as unknown as Sink<B>;
  }
}
