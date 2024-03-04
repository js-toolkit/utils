/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-base-to-string */

export interface GetErrorMessageOptions {
  /** Exclude constructor name if possible. */
  readonly simple?: boolean;
}

function objectToString(error: AnyObject, options: GetErrorMessageOptions): string {
  const { message, cause } = error as Error;
  if (message) {
    return cause ? `${message} => cause: ${getErrorMessage(cause, options)}` : message;
  }

  const errStr = (error as Error).toString();

  // If error is just a simple object ("[object Object]").
  if (error.constructor.name && errStr === `[object ${error.constructor.name}]`) {
    try {
      const jsonStr = JSON.stringify(error);
      return jsonStr === '{}' ? '' : jsonStr;
    } catch (ex) {
      console.warn('Stringify object failed:', error, ex);
    }
  }

  return errStr;
}

export function getErrorMessage(error: unknown, options: GetErrorMessageOptions = {}): string {
  // If error is not object
  if (typeof error !== 'object' || error == null) {
    return String(error);
  }
  const proto = Object.getPrototypeOf(error) as object;
  // If error is instance of Error with cause.
  if (error instanceof Error && proto === Error.prototype && error.cause != null) {
    const prefix = options.simple ? '' : `${error.name || error.constructor.name}: `;
    return `${prefix}${error.message} => cause: ${getErrorMessage(error.cause, options)}`;
  }
  // If error (simple object) has own implementation of `toString()`.
  if (Object.hasOwn(error, 'toString')) {
    return error.toString();
  }
  // If error is simple object
  if (error.constructor === {}.constructor) {
    return objectToString(error, options);
  }
  // If error (instance of class) has implementation of `toString()`.
  if (proto && Object.hasOwn(proto, 'toString')) {
    return error.toString();
  }
  // If error is instance of some class
  if (!options.simple && error.constructor.name) {
    const str = objectToString(error, options);
    const prefix = (error instanceof Error && error.name) || error.constructor.name;
    return `${prefix}${str ? `: ${str}` : ''}`;
  }
  // Other cases
  return objectToString(error, options);
}
