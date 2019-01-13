/* eslint-disable import/prefer-default-export */

/**
 * Thrown by various accessor methods or partial functions to indicate
 * that the element being requested does not exist.
 */
export class NoSuchElementError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NoSuchElementError';

    // Workaround to make `instanceof` work in ES5
    const self = this as any;
    self.constructor = NoSuchElementError;
    self.__proto__ = NoSuchElementError.prototype; // eslint-disable-line no-proto
  }
}
