import { es5ErrorCompat } from './es5ErrorCompat';

export class UnreachableCaseError extends Error {
  constructor(value: never, message?: string) {
    super(message ?? `Unreachable case: ${String(value)}`);
    es5ErrorCompat(this, UnreachableCaseError);
  }
}
