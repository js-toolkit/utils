import es5ErrorCompat from '../es5ErrorCompat';

export default class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    es5ErrorCompat.call(this, TimeoutError);
  }
}
