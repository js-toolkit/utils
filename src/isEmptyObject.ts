/* eslint-disable no-unreachable-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

export function isEmptyObject<T extends AnyObject>(obj: T): boolean {
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  for (const _ in obj) {
    return false;
  }
  return true;
}

export default isEmptyObject;
