export default class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = TimeoutError.name;
    this.constructor = TimeoutError;
    this['__proto__'] = TimeoutError.prototype; // eslint-disable-line no-proto, dot-notation
  }
}
