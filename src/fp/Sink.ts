type Finalizator = () => void | Promise<void>;

export default class Sink<A> {
  private readonly promise: Promise<never>;

  private pending: boolean = true;

  private waitTimeoutHandler?: any;

  private resolve?: () => void;

  private reject?: (reason?: any) => void;

  private finalizator?: Finalizator;

  private pipeHandler?: (value: any) => Promise<any>;

  private onPipe = async (value: any): Promise<void> => {
    try {
      this.pipeHandler && (await this.pipeHandler(value));
    } catch (ex) {
      this.cancel(ex);
    }
  };

  constructor(
    executor: (pipe: (value: A) => any, cancel: Sink<A>['cancel']) => Finalizator | void
  ) {
    this.cancel = this.cancel.bind(this);
    this.wait = this.wait.bind(this);
    this.pipe = this.pipe.bind(this);

    this.promise = new Promise<never>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      const f = executor(this.onPipe, this.cancel);
      this.finalizator = typeof f === 'function' ? f : undefined;
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

  cancel(reason?: any): Promise<void> {
    if (!this.isPending) return Promise.resolve();
    return Promise.resolve()
      .then(this.finalizator)
      .then(() => {
        if (reason) {
          this.reject && this.reject(reason);
        } else {
          this.resolve && this.resolve();
        }
      });
    // if (!this.isPending) return;
    // this.finalizator && (await this.finalizator());
    // if (reason) {
    //   this.reject && this.reject(reason);
    // } else {
    //   this.resolve && this.resolve();
    // }
  }

  pipe<B>(action: (value: A) => PromiseLike<B> | B): Sink<B> {
    const prevHandler = this.pipeHandler;
    this.pipeHandler = value =>
      (prevHandler ? prevHandler(value) : Promise.resolve(value)).then(action);
    return this as any;
  }
}
