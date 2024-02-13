/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-base-to-string */

function objectToString(error: AnyObject): string {
  const { message, cause } = error as Error;
  if (message) {
    return cause ? `${message} => cause: ${getErrorMessage(cause)}` : message;
  }

  const errStr = (error as Error).toString();

  // If error is just a simple object ("[object Object]").
  if (errStr === {}.toString()) {
    try {
      return JSON.stringify(error);
    } catch {
      console.warn('Stringify object failed:', error);
    }
  }

  return errStr;
}

export function getErrorMessage(error: unknown): string {
  // If error is not object
  if (typeof error !== 'object' || error == null) {
    return String(error);
  }
  const proto = Object.getPrototypeOf(error) as object;
  // If error is instance of Error with cause.
  if (error instanceof Error && proto === Error.prototype && error.cause != null) {
    return `${error.constructor.name}: ${error.message} => cause: ${getErrorMessage(error.cause)}`;
  }
  // If error (simple object) has own implementation of `toString()`.
  if (Object.hasOwn(error, 'toString')) {
    return error.toString();
  }
  // If error is simple object
  if (error.constructor === {}.constructor) {
    return objectToString(error);
  }
  // If error (instance of class) has implementation of `toString()`.
  if (proto && Object.hasOwn(proto, 'toString')) {
    return error.toString();
  }
  // If error is instance of some class
  if (error.constructor.name) {
    return `${error.constructor.name}: ${objectToString(error)}`;
  }
  // Other cases
  return objectToString(error);
}
