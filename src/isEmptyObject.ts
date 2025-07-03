/* eslint-disable @typescript-eslint/no-for-in-array */
/* eslint-disable no-unreachable-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

/**
 * @param obj Can be `Array | string | object`.
 */
export function isEmptyObject<T extends AnyObject | string>(obj: T): boolean {
  if (Array.isArray(obj) || typeof obj === 'string') {
    return obj.length === 0;
  }
  for (const _ in obj) {
    return false;
  }
  return true;
}
