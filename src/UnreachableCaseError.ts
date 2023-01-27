import { es5ErrorCompat } from './es5ErrorCompat';

export class UnreachableCaseError extends Error {
  constructor(value: never) {
    super(`Unreachable case: ${String(value)}`);
    es5ErrorCompat(this, UnreachableCaseError);
  }
}

export default UnreachableCaseError;
