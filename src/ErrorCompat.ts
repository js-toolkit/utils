import { es5ErrorCompat } from './es5ErrorCompat';

export abstract class ErrorCompat extends Error {
  constructor(
    SelfConstructor: AnyConstructor,
    message?: string | undefined,
    options?: ErrorOptions | undefined
  ) {
    super(message, options);
    es5ErrorCompat(this, SelfConstructor);
  }
}
