export default function getErrorMessage(error: unknown): string {
  // If error is not object
  if (typeof error !== 'object' || error == null) return String(error);
  // If error has own implementation of `toString()`.
  if (Object.getOwnPropertyNames(error).includes('toString')) return error.toString();
  // If error is simple object
  if (error.constructor === {}.constructor) return (error as Error).message || error.toString();
  // If error is instance of some class
  return `${error.constructor.name}: ${(error as Error).message || error.toString()}`;
}
