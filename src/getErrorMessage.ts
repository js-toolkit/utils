function objectToString(error: AnyObject): string {
  const msg = error.message as string;
  if (msg) return msg;

  const errStr = error.toString();

  if (errStr === {}.toString()) {
    try {
      return JSON.stringify(error);
    } catch {
      console.log(error);
    }
  }

  return errStr;
}

export function getErrorMessage(error: unknown): string {
  // If error is not object
  if (typeof error !== 'object' || error == null) return String(error);
  // If error has own implementation of `toString()`.
  if (Object.getOwnPropertyNames(error).includes('toString')) return error.toString();
  // If error is simple object
  if (error.constructor === {}.constructor) return objectToString(error);
  // If error is instance of some class
  return `${error.constructor.name}: ${objectToString(error)}`;
}

export default getErrorMessage;
