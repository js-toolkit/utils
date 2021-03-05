import es5ErrorCompat from './es5ErrorCompat';

export default class UnreachableCaseError extends Error {
  constructor(value: never) {
    super(`Unreachable case: ${String(value)}`);
    es5ErrorCompat.call(this, UnreachableCaseError);
  }
}
