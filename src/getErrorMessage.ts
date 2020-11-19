export default function getErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error == null) return String(error);
  if (Object.getOwnPropertyNames(error).includes('toString')) return error.toString();
  if (error.constructor === {}.constructor) return (error as Error).message || error.toString();
  return `${error.constructor.name}: ${(error as Error).message}`;
}
