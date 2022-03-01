import es5ErrorCompat from './es5ErrorCompat';

/**
 * Thrown by various accessor methods or partial functions to indicate
 * that the element being requested does not exist.
 */
export default class NoSuchElementError extends Error {
  constructor(message?: string) {
    super(message);
    es5ErrorCompat(this, NoSuchElementError);
  }
}
