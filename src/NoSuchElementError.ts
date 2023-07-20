import { es5ErrorCompat } from './es5ErrorCompat';

/**
 * Thrown by various accessor methods or partial functions to indicate
 * that the element being requested does not exist.
 */
export class NoSuchElementError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    es5ErrorCompat(this, NoSuchElementError);
  }
}

export default NoSuchElementError;
