/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-base-to-string */

function objectToString(error: AnyObject): string {
  const msg = error.message as string;
  if (msg) return msg;

  const errStr = (error as Object).toString();

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
  // If error (simple object) has own implementation of `toString()`.
  if (Object.hasOwn(error, 'toString')) {
    return error.toString();
  }
  // If error is simple object
  if (error.constructor === {}.constructor) {
    return objectToString(error);
  }
  // If error (instance of class) has implementation of `toString()`.
  const proto = Object.getPrototypeOf(error) as object;
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
