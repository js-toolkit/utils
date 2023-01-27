import { es5ErrorCompat } from './es5ErrorCompat';

export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    es5ErrorCompat(this, TimeoutError);
  }
}

export default TimeoutError;
