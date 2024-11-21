import { es5ErrorCompat } from './es5ErrorCompat';

export interface ErrorCompatOptions extends ErrorOptions {
  readonly name?: string | undefined;
}

export abstract class ErrorCompat extends Error {
  constructor(SelfConstructor: AnyConstructor, message?: string, options?: ErrorCompatOptions) {
    super(message, options);
    es5ErrorCompat(this, SelfConstructor);
    if (options?.name != null) {
      this.name = options.name;
    }
  }
}
