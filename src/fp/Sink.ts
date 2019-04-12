export default class Sink<A> {
  private readonly promise: Promise<never>;

  private pending: boolean;

  private waitTimeoutHandler?: any;

  private resolve?: () => void;

  private reject?: (reason?: any) => void;

  private finalizator?: (() => void) | void;

  private pipeHandler?: (value: any) => any;

  private onPipe = (value: any): any => {
    try {
      this.pipeHandler && this.pipeHandler(value);
    } catch (ex) {
      this.cancel(ex);
    }
  };

  constructor(
    executor: (pipe: <B>(value: A) => B, cancel: Sink<A>['cancel']) => (() => void) | void
  ) {
    this.cancel = this.cancel.bind(this);
    this.wait = this.wait.bind(this);
    this.pipe = this.pipe.bind(this);

    this.pending = true;
    this.promise = new Promise<never>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.finalizator = executor(this.onPipe, this.cancel);
    }).finally(() => {
      this.pending = false;
      clearTimeout(this.waitTimeoutHandler);
    });
  }

  get isPending(): boolean {
    return this.pending;
  }

  wait(timeout?: number): Promise<never> {
    if (this.isPending && timeout && timeout > 0) {
      this.waitTimeoutHandler = setTimeout(() => this.cancel(), timeout);
    }
    return this.promise;
  }

  cancel(reason?: any): void {
    if (!this.resolve || !this.reject) throw new Error('Invalid operation.');
    this.finalizator && this.finalizator();
    if (reason) {
      this.reject && this.reject(reason);
    } else {
      this.resolve && this.resolve();
    }
  }

  pipe<B>(callback: (value: A) => B): Sink<B> {
    const prevHandler = this.pipeHandler;
    this.pipeHandler = value => callback(prevHandler ? prevHandler(value) : value);
    return this as any;
  }
}
